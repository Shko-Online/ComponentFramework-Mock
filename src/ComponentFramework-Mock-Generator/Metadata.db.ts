/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { ShkoOnline } from '../ShkoOnline';

import alasql from 'alasql';

import { AttributeMetadataSQL } from './SQLQueries/Metadata.Attribute';
import { EntityMetadataSQL } from './SQLQueries/Metadata.Entity';
import { OptionSetMetadataSQL } from './SQLQueries/Metadata.Optionset';
import { AttributeType, OptionSetType } from '../ComponentFramework-Mock';

const getSqlTypeForAttribute = (attributeType: ShkoOnline.AttributeType) => {
    switch (attributeType) {
        case AttributeType.Boolean:
            return 'bit';
        case AttributeType.DateTime:
            return 'datetime';
        case AttributeType.Decimal:
            return 'decimal';
        case AttributeType.Double:
            return 'double';
        case AttributeType.Integer:
            return 'int';
        case AttributeType.Picklist:
        default:
            return 'string';
    }
};

const getAttributeTypeFromString = (attributeType: ShkoOnline.AttributeType | string) => {
    if (typeof attributeType === 'number') {
        return attributeType;
    }
    switch (attributeType) {
        case 'Lookup':
            return AttributeType.Lookup;
        case 'BigInt':
            return AttributeType.BigInt;
        case 'Boolean':
            return AttributeType.Boolean;
        case 'CalendarRules':
            return AttributeType.CalendarRules;
        case 'Customer':
            return AttributeType.Customer;
        case 'DateTime':
            return AttributeType.DateTime;
        case 'Decimal':
            return AttributeType.Decimal;
        case 'Double':
            return AttributeType.Double;
        case 'EntityName':
            return AttributeType.EntityName;
        case 'Integer':
            return AttributeType.Integer;
        case 'Lookup':
            return AttributeType.Lookup;
        case 'ManagedProperty':
            return AttributeType.ManagedProperty;
        case 'Memo':
            return AttributeType.Memo;
        case 'Money':
            return AttributeType.Money;
        case 'Owner':
            return AttributeType.Owner;
        case 'PartyList':
            return AttributeType.PartyList;
        case 'Picklist':
            return AttributeType.Picklist;
        case 'State':
            return AttributeType.State;
        case 'Status':
            return AttributeType.Status;
        case 'String':
            return AttributeType.String;
        case 'Uniqueidentifier':
            return AttributeType.Uniqueidentifier;
        case 'Virtual':
            return AttributeType.Virtual;
        default:
            return AttributeType.Virtual;
    }
};

export class MetadataDB {
    /**
     * Setting this to `true` will warn for missing metadata when doing operations.
     */
    _warnMissingInit: boolean;
    db: { databaseid: string; exec: typeof alasql };
    _newId: () => string;
    EntityMetadataSQL: EntityMetadataSQL;
    OptionSetMetadataSQL: OptionSetMetadataSQL;
    AttributeMetadataSQL: AttributeMetadataSQL;
    constructor() {
        this._warnMissingInit = false;
        this.db = new (alasql as any).Database();
        this.AttributeMetadataSQL = new AttributeMetadataSQL(this.db.exec.bind(this.db));
        this.EntityMetadataSQL = new EntityMetadataSQL(this.db.exec.bind(this.db));
        this.OptionSetMetadataSQL = new OptionSetMetadataSQL(this.db.exec.bind(this.db));

        this._newId = () => this.db.exec('SELECT NEWID() as ID')[0]['ID'];
    }

    createAttribute(entityId: string, attribute: ShkoOnline.AttributeMetadata) {
        if (!attribute.MetadataId) attribute.MetadataId = this._newId();
        let OptionSetId: string | undefined = undefined;
        if (attribute.AttributeType === AttributeType.Picklist) {
            const optionsetAttribute = attribute as ShkoOnline.PickListAttributeMetadata;
            if (!optionsetAttribute.OptionSet) {
                optionsetAttribute.OptionSet = {
                    MetadataId: '',
                    IsCustomOptionSet: false,
                    Name: optionsetAttribute.LogicalName,
                    Options: {},
                    OptionSetType: OptionSetType.Picklist,
                };
            }
            if (!optionsetAttribute.OptionSet.MetadataId) {
                optionsetAttribute.OptionSet.MetadataId = this._newId();
            }
            OptionSetId = optionsetAttribute.OptionSet.MetadataId;
            this.OptionSetMetadataSQL.AddOptionSetMetadata({
                IsCustomOptionSet: optionsetAttribute.OptionSet.IsCustomOptionSet,
                LogicalName: optionsetAttribute.OptionSet.Name,
                OptionSetId: optionsetAttribute.OptionSet.MetadataId,
                OptionSetType: optionsetAttribute.OptionSet.OptionSetType,
            });
        }

        this.AttributeMetadataSQL.AddAttributeMetadata({
            EntityId: entityId,
            AttributeId: attribute.MetadataId,
            LogicalName: attribute.LogicalName,
            AttributeType: attribute.AttributeType,
            DefaultFormValue: (attribute as ShkoOnline.PickListAttributeMetadata).DefaultFormValue,
            OptionSetId,
            AttributeOf: attribute.AttributeOf,
            AttributeTypeName: attribute.AttributeTypeName?.value || '',
        });
    }

    /**
     * Use this method to initialize the metadata
     * @param metadatas
     */
    initMetadata(metadatas: ShkoOnline.EntityMetadata[]) {
        metadatas.forEach((metadata) => this.initSingleTable(metadata));
    }

    private initSingleTable(metadata: ShkoOnline.EntityMetadata) {
        const entityId = this._newId();
        const safeTableName = metadata.LogicalName.toLowerCase().replace(/\!/g, '_').replace(/\@/g, '_');

        if (!metadata.Attributes) {
            metadata.Attributes = [];
        }
        let attributes = metadata.Attributes;
        attributes.forEach((attribute) => {
            attribute.AttributeType = getAttributeTypeFromString(attribute.AttributeType);
        });

        if (!metadata.PrimaryIdAttribute) {
            let primaryAttribute = attributes.find((attr) => attr.AttributeType === AttributeType.Uniqueidentifier);
            if (primaryAttribute) {
                metadata.PrimaryIdAttribute = primaryAttribute.LogicalName;
            } else {
                metadata.PrimaryIdAttribute = safeTableName + 'id';
            }
        }

        if (!metadata.PrimaryNameAttribute) {
            let primaryAttribute = attributes.find((attr) => attr.AttributeType === AttributeType.EntityName);
            if (primaryAttribute) {
                metadata.PrimaryNameAttribute = primaryAttribute.LogicalName;
            } else {
                metadata.PrimaryNameAttribute = 'name';
            }
        }

        if (!attributes.find((attr) => attr.LogicalName === metadata.PrimaryIdAttribute)) {
            attributes.push({
                AttributeType: AttributeType.Uniqueidentifier,
                LogicalName: metadata.PrimaryIdAttribute,
                IsPrimaryId: true,
            } as ShkoOnline.AttributeMetadata);
        }

        const virtualAttributes: ShkoOnline.AttributeMetadata[] = [];
        attributes.forEach((attr) => {
            const virtualAttribute = attr.LogicalName + 'name';
            if (
                !(
                    attr.AttributeType === AttributeType.Boolean ||
                    attr.AttributeType === AttributeType.Lookup ||
                    attr.AttributeType === AttributeType.Picklist
                ) ||
                attributes.some((attrv) => attrv.LogicalName === virtualAttribute)
            ) {
                return;
            }
            virtualAttributes.push({
                AttributeOf: attr.LogicalName,
                AttributeType: AttributeType.Virtual,
                LogicalName: virtualAttribute,
                SchemaName: (attr.SchemaName || attr.LogicalName) + 'Name',
            } as ShkoOnline.AttributeMetadata);
        });

        metadata.Attributes = attributes.concat(virtualAttributes);
        attributes = metadata.Attributes;
        this.EntityMetadataSQL.AddEntityMetadata({
            EntityId: entityId,
            EntitySetName: metadata.EntitySetName,
            LogicalName: metadata.LogicalName,
            PrimaryIdAttribute: metadata.PrimaryIdAttribute,
            PrimaryNameAttribute: metadata.PrimaryNameAttribute,
            PrimaryImageAttribute: metadata.PrimaryImageAttribute,
        });

        const columns: string[] = [];
        attributes.forEach((attribute) => {
            this.createAttribute(entityId, attribute);
            columns.push(' [' + attribute.LogicalName + '] ' + getSqlTypeForAttribute(attribute.AttributeType));
            if (attribute.AttributeType === AttributeType.Lookup) {
                columns.push(' [' + attribute.LogicalName + 'type] string');
                columns.push(' [' + attribute.LogicalName + 'navigation] string');
            }
        });

        // Create Table
        const createTableQuery = `CREATE TABLE ${safeTableName} (${columns.join(',')})`;
        this.db.exec(createTableQuery);
    }

    /**
     * Get the metadata for a specific attribute
     * @param entity The target table
     * @param attribute The target attribute
     */
    getAttributeMetadata(entity: string, attribute: string) {
        var resultDB = this.AttributeMetadataSQL.SelectAttributeMetadata(attribute, entity);
        if (!resultDB) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for ${entity} ${attribute}`);
            }
            return null;
        }

        const result = {
            AttributeType: resultDB[0].AttributeType,
            LogicalName: resultDB[0].LogicalName,
            EntityLogicalName: entity,
            MetadataId: resultDB[0].AttributeId,
            AttributeOf: resultDB[0].AttributeOf,
            AttributeTypeName: {
                value: resultDB[0].AttributeTypeName,
            },
        } as ShkoOnline.AttributeMetadata;

        if (result.AttributeType === AttributeType.Picklist) {
            const optionsetDB = this.OptionSetMetadataSQL.SelectOptionSetMetadata(resultDB[0].OptionSetId || '');
            (result as ShkoOnline.PickListAttributeMetadata).OptionSet = {
                IsCustomOptionSet: optionsetDB[0].IsCustomOptionSet,
                MetadataId: optionsetDB[0].OptionSetId,
                Name: optionsetDB[0].LogicalName,
                OptionSetType: optionsetDB[0].OptionSetType,
                Options: {},
            };
        }
        return result;
    }

    /**
     * Get the metadata for a table
     * @param entity The target table
     */
    getTableMetadata(entity: string) {
        const tableMetadataDB = this.EntityMetadataSQL.SelectTableMetadata(entity);
        if (!tableMetadataDB || tableMetadataDB.length === 0) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for ${entity}`);
            }
            return;
        }
        const tableMetadata = {
            LogicalName: tableMetadataDB[0].LogicalName,
            EntitySetName: tableMetadataDB[0].EntitySetName,
            Attributes: [],
            PrimaryIdAttribute: tableMetadataDB[0].PrimaryIdAttribute,
            PrimaryNameAttribute: tableMetadataDB[0].PrimaryNameAttribute,
            PrimaryImageAttribute: tableMetadataDB[0].PrimaryNameAttribute,
        } as ShkoOnline.EntityMetadata;

        const attributesDB = this.AttributeMetadataSQL.SelectAttributeMetadataForTable(entity);
        attributesDB.forEach((attributeDB) => {
            const attribute = {
                AttributeType: attributeDB.AttributeType,
                EntityLogicalName: entity,
                MetadataId: attributeDB.AttributeId,
                LogicalName: attributeDB.LogicalName,
                AttributeOf: attributeDB.AttributeOf,
                AttributeTypeName: {
                    value: attributeDB.AttributeTypeName,
                },
                IsPrimaryId: attributeDB.LogicalName === tableMetadata.PrimaryIdAttribute,
                IsPrimaryName: attributeDB.LogicalName === tableMetadata.PrimaryNameAttribute,
            } as ShkoOnline.AttributeMetadata;

            if (attribute.AttributeType === AttributeType.Picklist) {
                const optionsetDB = this.OptionSetMetadataSQL.SelectOptionSetMetadata(attributeDB.OptionSetId || '');
                (attribute as ShkoOnline.PickListAttributeMetadata).DefaultFormValue =
                    attributeDB.DefaultFormValue as number;
                (attribute as ShkoOnline.PickListAttributeMetadata).OptionSet = {
                    IsCustomOptionSet: optionsetDB[0].IsCustomOptionSet,
                    MetadataId: optionsetDB[0].OptionSetId,
                    Name: optionsetDB[0].LogicalName,
                    OptionSetType: optionsetDB[0].OptionSetType,
                    Options: {},
                };
            }
            tableMetadata.Attributes?.push(attribute);
        });
        return tableMetadata;
    }

    /**
     * Update or Insert the metadata for a specific column of a table
     * @param entity The target table
     * @param attributeMetadata The target column
     * @returns
     */
    upsertAttributeMetadata(entity: string, attributeMetadata: ShkoOnline.AttributeMetadata) {
        const tableDB = this.EntityMetadataSQL.SelectTableMetadata(entity);
        if (!tableDB) {
            console.warn(`Could not find metadata for ${entity}`);
            return;
        }
        const safeTableName = tableDB[0].LogicalName.toLowerCase().replace(/\!/g, '_').replace(/\@/g, '_');
        const attributeDB = this.AttributeMetadataSQL.SelectAttributeMetadata(attributeMetadata.LogicalName, entity);
        if (!attributeDB || attributeDB.length == 0) {
            const virtualAttribute = attributeMetadata.LogicalName + 'name';

            if (
                attributeMetadata.AttributeType === AttributeType.Boolean ||
                attributeMetadata.AttributeType === AttributeType.Lookup ||
                attributeMetadata.AttributeType === AttributeType.Picklist
            ) {
                this.createAttribute(tableDB[0].EntityId, {
                    AttributeOf: attributeMetadata.LogicalName,
                    AttributeType: AttributeType.Virtual,
                    LogicalName: virtualAttribute,
                    SchemaName: (attributeMetadata.SchemaName || attributeMetadata.LogicalName) + 'Name',
                } as ShkoOnline.AttributeMetadata);
                this.db.exec('ALTER TABLE ' + safeTableName + ' ADD COLUMN [' + virtualAttribute + '] string');
            }

            this.createAttribute(tableDB[0].EntityId, attributeMetadata);

            this.db.exec(
                'ALTER TABLE ' +
                    safeTableName +
                    ' ADD COLUMN [' +
                    attributeMetadata.LogicalName +
                    '] ' +
                    getSqlTypeForAttribute(attributeMetadata.AttributeType),
            );

            if (attributeMetadata.AttributeType === AttributeType.Lookup) {
                this.db.exec(
                    'ALTER TABLE ' + safeTableName + ' ADD COLUMN [' + attributeMetadata.LogicalName + 'type] string',
                );
                this.db.exec(
                    'ALTER TABLE ' + safeTableName + ' ADD COLUMN [' + attributeMetadata.LogicalName + 'navigation] string',
                );
            }
        }
    }

    /**
     * Initialize the in-memory database with the items passed as param
     * @param items Object as returned from the Dataverse OData API
     */
    initItems(items: { '@odata.context': string; value: any[] }) {
        const entitySetName = items['@odata.context']?.substring(items['@odata.context'].indexOf('#') + 1);
        const tableMetadataDB = this.EntityMetadataSQL.SelectTableMetadataByEntitySet(entitySetName);
        if (!tableMetadataDB || tableMetadataDB.length === 0) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for entitySet ${entitySetName}`);
            }
            return;
        }

        const tableMetadata = this.getTableMetadata(tableMetadataDB[0].LogicalName);

        items.value.forEach((item) => {
            this.AddRow(tableMetadataDB[0].LogicalName, item, tableMetadata);
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

        const safeTableName = tableMetadata.LogicalName.toLowerCase().replace(/\!/g, '_').replace(/\@/g, '_');
        const params: string[] = [];
        const columns: string[] = [];
        let newID = null;
        tableMetadata.Attributes?.forEach((attribute) => {
            const key = attribute.LogicalName;

            if (attribute.AttributeType === AttributeType.Uniqueidentifier) {
                let value = item[attribute.LogicalName];
                if (!value && tableMetadata?.PrimaryIdAttribute === attribute?.LogicalName) {
                    value = this._newId();
                }
                if (tableMetadata?.PrimaryIdAttribute === attribute?.LogicalName) {
                    newID = value;
                }
                params.push(value);
            } else if (attribute.AttributeType === AttributeType.Lookup) {
                const lookupNameAttribute = tableMetadata?.Attributes?.find(
                    (attr) =>
                        attr.AttributeOf === attribute.LogicalName &&
                        attr.LogicalName !== attribute.LogicalName + 'yominame',
                );
                if (typeof item[key] === 'object') {
                    const lookup = item[key] as ComponentFramework.LookupValue;
                    params.push(lookup?.name as string);
                    columns.push('[' + lookupNameAttribute?.LogicalName + ']');
                    params.push(lookup?.entityType);
                    columns.push('[' + key + 'type]');
                    params.push(lookup?.id);
                } else {
                    params.push(item[`_${key}_value@OData.Community.Display.V1.FormattedValue`]);
                    columns.push('[' + lookupNameAttribute?.LogicalName + ']');
                    params.push(item[`_${key}_value@Microsoft.Dynamics.CRM.lookuplogicalname`]);
                    columns.push('[' + key + 'type]');
                    params.push(item[`_${key}_value@Microsoft.Dynamics.CRM.associatednavigationproperty`]);
                    columns.push('[' + key + 'navigation]');
                    params.push(item[`_${key}_value`]);
                }
            } else if (attribute.AttributeOf && attribute.LogicalName === attribute.AttributeOf + 'name') {
                const parentAttribute = tableMetadata?.Attributes?.find(
                    (attr) => attr.LogicalName === attribute.AttributeOf,
                );
                if (parentAttribute?.AttributeType === AttributeType.Lookup) {
                    return;
                }
                params.push(item[`${attribute.AttributeOf}@OData.Community.Display.V1.FormattedValue`]);
            }

            // `_${key}_value` in item) {
            //     row[key] = item[`_${key}_value`]
            //         ? ({
            //               entityType: item[`_${key}_value@Microsoft.Dynamics.CRM.lookuplogicalname`],
            //               id: item[`_${key}_value`],
            //               name: item[`_${key}_value@OData.Community.Display.V1.FormattedValue`],
            //           } as ComponentFramework.LookupValue)
            //         : null;
            //     if (`_${key}_value@Microsoft.Dynamics.CRM.associatednavigationproperty` in item)
            //         row[`_${key}_value@Microsoft.Dynamics.CRM.associatednavigationproperty`] =
            //             item[`_${key}_value@Microsoft.Dynamics.CRM.associatednavigationproperty`]; // Temporary hack
            else if (key in item) {
                let value =
                    attribute.AttributeType === AttributeType.DateTime && typeof item[key] === 'string'
                        ? new Date(item[key])
                        : item[key];
                if (value === null || value === undefined) {
                    return;
                }
                params.push(value);
            } else {
                return;
            }

            columns.push('[' + key + ']');
        });

        const insertSql = `INSERT INTO ${safeTableName} (${columns.join(',')}) VALUES (${params
            .map((p) => '?')
            .join(',')})`;
        this.db.exec(insertSql, params);
        return newID;
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
        const entityMetadata = this.getTableMetadata(entity);
        if (!entityMetadata) return { row: null, entityMetadata };
        const safeTableName = entity.toLowerCase().replace(/\!/g, '_').replace(/\@/g, '_');

        let selectQuery =
            'SELECT ' +
            (entityMetadata && entityMetadata.Attributes
                ? entityMetadata?.Attributes?.map((attr) =>
                      attr.AttributeType === AttributeType.Lookup
                          ? '[' +
                            attr.LogicalName +
                            '],[' +
                            attr.LogicalName +
                            'type],[' +
                            attr.LogicalName +
                            'navigation]'
                          : '[' + attr.LogicalName + ']',
                  ).join(',')
                : '*') +
            ' FROM ' +
            safeTableName;
        if (id) {
            selectQuery += ' WHERE [' + (entityMetadata?.PrimaryIdAttribute || 'id') + '] = ?';
        }

        const rowDB = this.db.exec(selectQuery, [id]) as { [attribute: string]: any }[];

        if (!rowDB || rowDB.length == 0) {
            console.warn('could not find row');
            return { row: null, entityMetadata };
        }

        const row = rowDB[0];
        entityMetadata?.Attributes?.forEach((attr) => {
            if (attr.AttributeType === AttributeType.Lookup) {
                if (row[attr.LogicalName]) {
                    const nameAttribute =
                        entityMetadata?.Attributes?.find((attrName) => attrName.AttributeOf === attr.LogicalName)
                            ?.LogicalName || attr.LogicalName + 'name';
                    row[attr.LogicalName] = {
                        id: row[attr.LogicalName],
                        entityType: row[attr.LogicalName + 'type'],
                        name: row[nameAttribute],
                    } as ComponentFramework.LookupValue;
                    delete row[attr.LogicalName + 'type'];
                    delete row[nameAttribute];
                }
            } else if (attr.AttributeType === AttributeType.Picklist) {
                if (typeof row[attr.LogicalName] === 'string') {
                    row[attr.LogicalName] = JSON.parse(row[attr.LogicalName]);
                }
            }
        });
        return { row, entityMetadata };
    }

    /**
     * Delete a row from the in-memory database
     * @param entity The target table
     * @param id The target row
     */
    RemoveRow(entity: string, id: string) {
        const entityMetadata = this.getTableMetadata(entity);
        const safeTableName = entity.toLowerCase().replace(/\!/g, '_').replace(/\@/g, '_');
        const selectQuery =
            'DELETE FROM ' + safeTableName + ' WHERE [' + (entityMetadata?.PrimaryIdAttribute || 'id') + '] = ?';

        this.db.exec(selectQuery, [id]);
    }

    /**
     * Gets a row from a table and the associated  metadata
     * @param entity The target table
     * @param id The target row
     * @returns
     */
    GetRowForAPI(entity: string, id?: string) {
        const result = this.GetRow(entity, id);
        if (!result.entityMetadata) {
            return result;
        }
        if (result.entityMetadata && result.entityMetadata.Attributes && result.row) {
            result.entityMetadata.Attributes?.filter((attr) => attr.AttributeType === AttributeType.Lookup).forEach(
                (lookupAttribute) => {
                    const key = lookupAttribute.LogicalName;
                    const lookupValue = result.row[key] as ComponentFramework.LookupValue;
                    delete result.row[key];
                    result.row[`_${key}_value`] = lookupValue;
                },
            );
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
        const attributeMetadata = result.entityMetadata?.Attributes?.find(
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
        const safeTableName = entity.toLowerCase().replace(/\!/g, '_').replace(/\@/g, '_');
        const rows = this.db.exec('SELECT * FROM ' + safeTableName) as { [attr: string]: any }[];
        return { rows, entityMetadata };
    }

    /**
     * Update the value stored in a specific column in the in-memory database
     * @param value The new value
     * @param entity The target table
     * @param attribute The target column
     * @param row The target row
     */
    UpdateValue<T>(value: T, entity: string, attribute: string, rowId?: string) {
        const tableMetadata = this.getTableMetadata(entity);
        if (!tableMetadata) {
            return;
        }
        const safeTableName = tableMetadata.LogicalName.toLowerCase().replace(/\!/g, '_').replace(/\@/g, '_');

        const attributeMetadata = tableMetadata.Attributes?.find((attr) => attr.LogicalName === attribute);
        if (!attributeMetadata) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for attribute '${attribute}' of table '${entity}'`);
            }
            return;
        }
        const statements: string[] = [];
        const params: (string | null)[] = [];
        if (attributeMetadata.AttributeType === AttributeType.Lookup) {
            const lookupNameAttribute =
                tableMetadata.Attributes?.find((attr) => attr.AttributeOf === attributeMetadata.LogicalName)
                    ?.LogicalName || attributeMetadata.LogicalName + 'name';
            const lookupValue = value as ComponentFramework.LookupValue;
            statements.push(` 
            SET [${attributeMetadata.LogicalName}] = ?, 
                [${attributeMetadata.LogicalName}type] = ?,
                [${lookupNameAttribute}] = ? `);

            params.push(lookupValue && lookupValue.id ? lookupValue.id : null);
            params.push(lookupValue && lookupValue.id ? lookupValue.entityType : null);
            params.push(lookupValue && lookupValue.id ? (lookupValue.name as string) : null);
        } else if (attributeMetadata.AttributeType === AttributeType.Picklist) {
            const picklistNameAttribute =
                tableMetadata?.Attributes?.find((attr) => attr.AttributeOf === attributeMetadata.LogicalName)
                    ?.LogicalName || attributeMetadata.LogicalName + 'name';
            statements.push(` 
            SET [${attributeMetadata.LogicalName}] = ?, 
                [${picklistNameAttribute}] = ? `);

            if (typeof value === 'object' && value instanceof Array) {
                // multiselect
                params.push(JSON.stringify(value));
            } else {
                params.push(value as string);
                const label = (attributeMetadata as ShkoOnline.PickListAttributeMetadata)?.OptionSet.Options[
                    value as number
                ]?.Label;
                if (!label) {
                    console.warn(`Picklist column ${attributeMetadata?.LogicalName} is missing option ${value}}`);
                }
                params.push(label || '');
            }
        } else {
            statements.push(` SET [${attributeMetadata.LogicalName}] = ? `);
            params.push(value as string);
        }

        if (rowId) {
            statements.push(` WHERE ${tableMetadata.PrimaryIdAttribute} = ? `);
            params.push(rowId);
        }

        this.db.exec(`UPDATE ${safeTableName} ${statements.join(' ')}`, params);
    }
}
