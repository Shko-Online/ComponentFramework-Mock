/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { ShkoOnline } from '../ShkoOnline';

import loki from 'lokijs';

export class MetadataDB {
    /**
     * Setting this to `true` will warn for missing metadata when doing operations.
     */
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

    /**
     * Use this method to initialize the metadata
     * @param metadatas
     */
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
    /**
     * Get the metadata for a specific attribute
     * @param entity The target table
     * @param attribute The target attribute
     */
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

    /**
     * Get the metadata for a table
     * @param entity The target table
     */
    getTableMetadata(entity: string) {
        const tableMetadata = this.metadata.findOne({ LogicalName: { $eq: entity } }) as ShkoOnline.EntityMetadata &
            Partial<LokiObj>;
        if (!tableMetadata) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for ${entity}`);
            }
            return;
        }
        delete tableMetadata['$loki'];
        delete tableMetadata['meta'];
        return tableMetadata as ShkoOnline.EntityMetadata;
    }

    /**
     * Update or Insert the metadata for a specific column of a table
     * @param entity The target table
     * @param attributeMetadata The target column
     * @returns
     */
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

    /**
     * Initialize the in-memory database with the items passed as param
     * @param items Object as returned from the Dataverse OData API
     */
    initItems(items: { '@odata.context': string; value: any[] }) {
        const entitySetName = items['@odata.context']?.substring(items['@odata.context'].indexOf('#') + 1);
        const tableMetadata = this.metadata.findOne({ EntitySetName: { $eq: entitySetName } });
        if (!tableMetadata) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for entitySet ${entitySetName}`);
            }
            return;
        }
        const tableData = this.db.addCollection(`${tableMetadata.LogicalName}#data`);
        this.data[tableMetadata.LogicalName] = tableData;
        if (!tableMetadata.Attributes) return;
        items.value.forEach((item) => {
            this.AddRow(tableMetadata.LogicalName, item, tableMetadata);
        });
    }

    /**
     * Add a new row to the table
     * @param entity The target table
     * @param item The data
     * @param tableMetadata The table metadata
     */
    AddRow(entity: string, item: any, tableMetadata?: ShkoOnline.EntityMetadata) {
        if (!tableMetadata) {
            tableMetadata = this.getTableMetadata(entity);
        }
        if (!tableMetadata) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for entitySet ${entity}`);
            }
            return;
        }
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
                if ((attribute.AttributeType as unknown) !== 'String')
                    row[`${key}@OData.Community.Display.V1.FormattedValue`] =
                        item[`${key}@OData.Community.Display.V1.FormattedValue`]; // Temporary hack
            }
        });
        this.data[tableMetadata.LogicalName].insert(row);
    }

    /**
     * Same as init items but for Pseudo-Table #!CanvasApp
     * @param items
     */
    initCanvasItems(items: any[]) {
        this.initItems({
            '@odata.context': '#!CanvasApp',
            value: items,
        });
    }

    /**
     * Get a row from the table and the relative metadata
     * @param entity The target table
     * @param id The target row
     * @returns
     */
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

    /**
     * Delete a row from the in-memory database
     * @param entity The target table
     * @param id The target row
     */
    RemoveRow(entity: string, id: string) {
        const entityMetadata = this.metadata.findOne({ LogicalName: entity }) as ShkoOnline.EntityMetadata &
            Partial<LokiObj>;
        if (entityMetadata === undefined && this._warnMissingInit) {
            console.warn(`no metadata initialized for ${entity} table.`);
        }
        const entityData = this.data[entity];
        if (entityData === undefined && this._warnMissingInit) {
            console.warn(`no data initialized for ${entity} table.`);
        }
        entityData?.removeWhere({
            [entityMetadata?.PrimaryIdAttribute || entityMetadata?.LogicalName + 'id']: { $eq: id },
        });
    }

    /**
     * Gets a row from a table and the associated  metadata
     * @param entity The target table
     * @param id The target row
     * @returns
     */
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

    /**
     * Get a coulmn value and metadata
     * @param entity The target table
     * @param attributeName The target column
     * @param rowid The target row
     * @returns
     */
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

    /**
     * Get all the rows for a table
     * @param entity The target table
     * @returns
     */
    GetAllRows(entity: string) {
        const entityMetadata = this.getTableMetadata(entity);
        const rows = [...(this.data[entity]?.data.map(({ $loki, meta, ...rest }) => ({ ...rest })) || [])];
        return { rows, entityMetadata };
    }

    /**
     * Update the value stored in a specific column in the in-memory database
     * @param value The new value
     * @param entity The target table
     * @param attribute The target column
     * @param row The target row
     */
    UpdateValue<T>(value: T, entity: string, attribute: string, row?: string) {
        const update = this.GetRow(entity, row);
        update.row[attribute] = value;
        this.data[entity].updateWhere(
            (row) => row.id === row || row === undefined,
            (row) => (row[attribute] = value),
        );
    }
}
