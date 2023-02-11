/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../ShkoOnline';

import loki from 'lokijs';
import { AttributeType } from '../ComponentFramework-Mock';

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
        this.metadata = this.db.addCollection('metadata');
        this.attributes = {};
        this.data = {};
    }

    initMetadata(metadatas: ShkoOnline.EntityMetadata[]) {
        metadatas.forEach((metadata) => {
            this.metadata.insert(metadata);

            const attributesCollection = this.db.addCollection(`${metadata.LogicalName}#attributes`);
            this.attributes[metadata.LogicalName] = attributesCollection;
            const attributes = metadata.Attributes;
            if (!attributes) return;
            attributes.forEach((attribute) => {
                attributesCollection.insert({ ...attribute });
            });
        });
    }
    getAttributeMetadata(entity: string, attribute: string) {
        if (!this.attributes[entity]) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for ${entity} ${attribute}`);
            }
            return null;
        }

        const result = this.attributes[entity].findOne({
            LogicalName: { $eq: attribute },
        }) as ShkoOnline.AttributeMetadata & Partial<LokiObj>;
        if (result) {
            delete result.$loki;
            delete result.meta;
        } else {
            console.warn(`Could not find metadata for ${entity} ${attribute}`);
        }
        return result as ShkoOnline.AttributeMetadata;
    }
    upsertAttributeMetadata(entity: string, attributeMetadata: ShkoOnline.AttributeMetadata) {
        const tableMetadata = this.metadata.findOne({ LogicalName: { $eq: entity } });
        if (!tableMetadata) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for ${entity}`);
            }
            return null;
        }
        tableMetadata.Attributes = [
            ...(tableMetadata.Attributes || []).filter(
                (attribute) => attribute.LogicalName !== attributeMetadata.LogicalName,
            ),
        ];
        tableMetadata.Attributes?.push(attributeMetadata);
        this.metadata.update(tableMetadata);

        this.attributes[entity].removeWhere({
            LogicalName: { $eq: attributeMetadata.LogicalName },
        });
        this.attributes[entity].insert(attributeMetadata);
    }

    initItems(items: { '@odata.context': string; value: any[] }) {
        const entitySetName = items['@odata.context'].substring(items['@odata.context'].indexOf('#') + 1);
        const tableMetadata = this.metadata.findOne({ EntitySetName: { $eq: entitySetName } });
        if (!tableMetadata) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for entitySet ${entitySetName}`);
            }
            return null;
        }
        const tableData = this.db.addCollection(`${tableMetadata.LogicalName}#data`);
        this.data[tableMetadata.LogicalName] = tableData;
        if (!tableMetadata.Attributes) return;
        items.value.forEach((item) => {
            let row: { [key: string]: any } = {};
            row['ownerid'] = item['ownerid'];
            tableMetadata.Attributes?.forEach((attribute) => {
                const key = attribute.LogicalName;
                if ((attribute.AttributeType as unknown) === 'Lookup' && `_${key}_value` in item) {
                    row[key] = item[`_${key}_value`]
                        ? ({
                              entityType: item[`_${key}_value@Microsoft.Dynamics.CRM.lookuplogicalname`],
                              id: item[`_${key}_value`],
                              name: item[`_${key}_value@OData.Community.Display.V1.FormattedValue`],
                          } as ComponentFramework.LookupValue)
                        : null;
                    row[`_${key}_value@Microsoft.Dynamics.CRM.associatednavigationproperty`] =
                        item[`_${key}_value@Microsoft.Dynamics.CRM.associatednavigationproperty`]; // Temporary hack
                } else if (key in item) {
                    row[key] = item[key];
                    if((attribute.AttributeType as unknown) !== 'String' )    row[`${key}@OData.Community.Display.V1.FormattedValue`] =
                        item[`${key}@OData.Community.Display.V1.FormattedValue`]; // Temporary hack
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
    GetRow(entity: string, id?: string) {
        const entityMetadata = this.metadata.findOne({ LogicalName: entity }) as ShkoOnline.EntityMetadata &
            Partial<LokiObj>;
        if (entityMetadata === undefined && this._warnMissingInit) {
            console.warn(`no metadata initialized for ${entity} table.`);
        }
        const entityData = this.data[entity];
        delete entityMetadata?.$loki;
        delete entityMetadata?.meta;
        if (entityData === undefined && this._warnMissingInit) {
            console.warn(`no data initialized for ${entity} table.`);
        }
        const row =
            id === undefined
                ? entityData?.findOne()
                : entityData?.findOne({
                      [entityMetadata?.PrimaryIdAttribute || entityMetadata?.LogicalName + 'id']: { $eq: id },
                  });
        delete row?.$loki;
        delete row?.meta;
        return { row, entityMetadata: entityMetadata as ShkoOnline.EntityMetadata };
    }
    GetRowForAPI(entity: string, id?: string) {
        const result = this.GetRow(entity, id);
        if (result.entityMetadata && result.entityMetadata.Attributes && result.row) {
            result.entityMetadata.Attributes.forEach((attribute) => {
                const key = attribute.LogicalName;
                if ((attribute.AttributeType as unknown) === 'Lookup' && key in result.row) {
                    const toExpand = result.row[key] as ComponentFramework.LookupValue;
                    delete result.row[key];

                    result.row[`_${key}_value`] = toExpand?.id || null;
                    result.row[`_${key}_value@Microsoft.Dynamics.CRM.lookuplogicalname`] = toExpand?.entityType;
                    result.row[`_${key}_value@OData.Community.Display.V1.FormattedValue`] = toExpand?.name;
                    result.row[`_${key}_value@Microsoft.Dynamics.CRM.associatednavigationproperty`] =
                        result.row?.[`_${key}_value@Microsoft.Dynamics.CRM.associatednavigationproperty`];
                }
            });
        }
        return result;
    }
    GetAllColumn(entity: string, attribute: string) {
        const tab: any[] = [];
        const data = this.data[entity].chain().data();
        data.forEach((at) => {
            tab.push(at[attribute]);
        });
        return tab;
    }
    GetValueAndMetadata<TAttribute extends ShkoOnline.AttributeMetadata, TValue = any>(
        entity: string,
        attributeName: string,
        rowid?: string,
    ) {
        const result = this.GetRow(entity, rowid);
        const attributeMetadata = result.entityMetadata.Attributes?.find(
            (attribute) => attribute.LogicalName === attributeName,
        ) as TAttribute;
        const value = result.row?.[attributeName] as TValue;
        return { value, attributeMetadata };
    }
    GetRows(entity: string) {
        const entityMetadata = this.metadata.findOne({ LogicalName: entity });
        const rows = [...(this.data[entity]?.data.map(({ $loki, meta, ...rest }) => ({ ...rest })) || [])];
        return { rows, entityMetadata };
    }
    UpdateValue<T>(value: T, entity: string, attribute: string, row?: string) {
        const update = this.GetRow(entity, row);
        update.row[attribute] = value;
        this.data[entity].update(update.row);
    }
}
