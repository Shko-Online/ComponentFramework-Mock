/*
    Unless explicitly acquired and licensed from Licensor under another
    license, the contents of this file are subject to the Reciprocal Public
    License ("RPL") Version 1.5, or subsequent versions as allowed by the RPL,
    and You may not copy or use this file in either source code or executable
    form, except in compliance with the terms and conditions of the RPL.

    All software distributed under the RPL is provided strictly on an "AS
    IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND
    LICENSOR HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT
    LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
    PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT. See the RPL for specific
    language governing rights and limitations under the RPL. 
*/
import loki from 'lokijs';

export class MetadataDB {
    _warnMissingInit: boolean;
    attributes: {
        [key: string]: Collection<ShkoOnline.AttributeMetadata>;
    };
    metadata: Collection<ShkoOnline.EntityMetadata>;
    data: {
        [key: string]: Collection<any>;
    };
    db: loki;
    constructor() {
        this._warnMissingInit = false;
        this.db = new loki('metadata.db');
        this.attributes = {};
        this.data = {};
    }

    initMetadata(metadatas: ShkoOnline.EntityMetadata[]) {
        metadatas.forEach((metadata1) => {
            if (!this.metadata) {
                this.metadata = this.db.addCollection('metadata');
            }

            this.metadata.insert(metadata1);

            const userAttributes = this.db.addCollection(`${metadata1.LogicalName}#attributes`);
            this.attributes[metadata1.LogicalName] = userAttributes;
            const attributes = metadata1.Attributes;

            attributes.forEach((attribute) => {
                userAttributes.insert({
                    LogicalName: attribute.LogicalName,
                    SchemaName: attribute.SchemaName,
                    AttributeType: attribute.AttributeType,
                    MetadataId: attribute.MetadataId,
                    DisplayName: attribute.DisplayName,
                });
            });
        });
    }
    getAttributeMetadata(entity: string, attribute: string) {
        return this.attributes[entity]?.findOne({
            LogicalName: { $eq: attribute },
        });
    }
    upsertAttributeMetadata(entity: string, attributeMetadata: ShkoOnline.AttributeMetadata) {
        const tableMetadata = this.metadata.findOne({ LogicalName: { $eq: entity } });
        tableMetadata.Attributes = tableMetadata.Attributes.filter(
            (attribute) => attribute.LogicalName !== attributeMetadata.LogicalName,
        );
        tableMetadata.Attributes.push(attributeMetadata);
        this.metadata.update(tableMetadata);

        if( this.attributes[entity].find({
            LogicalName: { $eq: attributeMetadata.LogicalName },
        })){
            this.attributes[entity].update(attributeMetadata);
        }else{
            this.attributes[entity].insert(attributeMetadata);
        }
      
       
    }
    initItems(items: { '@odata.context': string; value: any[] }) {
        const entitySetName = items['@odata.context'].substring(items['@odata.context'].indexOf('#') + 1);
        const tableMetadata = this.metadata.findOne({ EntitySetName: { $eq: entitySetName } });

        const tableData = this.db.addCollection(`${tableMetadata.LogicalName}#data`);
        this.data[tableMetadata.LogicalName] = tableData;
        items.value.forEach((item) => {
            let row = {};
            tableMetadata.Attributes.forEach((attribute) => {
                const key = attribute.LogicalName;
                if (key in item) {
                    row[key] = item[key];
                }
            });
            tableData.insert(row);
        });
    }
    initCanvasItems(items: any[]) {
        this.initItems({
            '@odata.context': '#!CanvasApp',
            value: items,
        });
    }
    GetRow(entity: string, id: string) {
        const entityMetadata = this.metadata.findOne({ LogicalName: entity });
        const entityData = this.data[entity];
        if (entityData === undefined && this._warnMissingInit) {
            console.warn(`no data initialized for ${entity} table.`);
        }
        if (id !== undefined) {
            return { row: entityData?.findOne({ [entityMetadata.PrimaryIdAttribute]: { $eq: id } }), entityMetadata };
        }
        return { row: entityData?.findOne(), entityMetadata };
    }
    GetAllColumn(entity: string, attribute: string) {
        const tab = [];
        const data = this.data[entity].chain().data();
        data.forEach((at) => {
            tab.push(at[attribute]);
        });
        return tab;
    }
    GetValueAndMetadata<T extends ShkoOnline.AttributeMetadata>(entity: string, rowid: string, attributeName: string) {
        const result = this.GetRow(entity, rowid);
        const attributeMetadata = result.entityMetadata.Attributes.find(
            (attribute) => attribute.LogicalName === attributeName,
        ) as T;
        const value = result.row?.[attributeName];
        return { value, attributeMetadata };
    }
    GetRows(entity: string) {
        const entityMetadata = this.metadata.findOne({ LogicalName: entity });
        const attributeMetadata = entityMetadata.Attributes;
        const rows = [...(this.data[entity]?.data || [])];
        return { rows, entityMetadata };
    }
    UpdateValue<T>(value: T, entity: string, attribute: string, row: string) {
        const update = this.GetRow(entity, row);
        update.row[attribute] = value;
        this.data[entity].update(update.row);
    }
}
