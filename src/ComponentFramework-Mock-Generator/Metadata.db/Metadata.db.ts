/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../../ShkoOnline';
import type { AttributeDB } from './SQLQueries';

import alasql from 'alasql';
import { stub } from 'sinon';

import { AttributeMetadataSQL, EntityMetadataSQL, OptionSetMetadataSQL } from './SQLQueries';
import { getAttributeTypeFromString } from './getAttributeTypeFromString';
import { getSqlTypeForAttribute } from './getSQLTypeForAttribute';
import { AttributeType, OptionSetType } from '../../ComponentFramework-Mock';
import { SavedQueryMetadata } from './PlatformMetadata/SavedQuery.Metadata';
import { UserQueryMetadata } from './PlatformMetadata/UserQuery.Metadata';
import { ODataQuery } from '@shko.online/dataverse-odata';

export class MetadataDB {
    static readonly CanvasLogicalName = '!CanvasApp';
    static Collisions = 0;

    /**
     * Setting this to `true` will warn for missing metadata when doing operations.
     */
    _warnMissingInit: boolean;
    db: { databaseid: string; exec: typeof alasql };
    _newId: SinonStub<[], string>;
    EntityMetadataSQL: EntityMetadataSQL;
    OptionSetMetadataSQL: OptionSetMetadataSQL;
    AttributeMetadataSQL: AttributeMetadataSQL;
    constructor() {
        this._warnMissingInit = false;
        this.db = new (alasql as any).Database();
        this.AttributeMetadataSQL = new AttributeMetadataSQL(this.db.exec.bind(this.db));
        this.EntityMetadataSQL = new EntityMetadataSQL(this.db.exec.bind(this.db));
        this.OptionSetMetadataSQL = new OptionSetMetadataSQL(this.db.exec.bind(this.db));

        this._newId = stub();
        this._newId.callsFake(() => this.db.exec('SELECT NEWID() as ID')[0]['ID']);
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
                OptionSetId,
                OptionSetType: optionsetAttribute.OptionSet.OptionSetType,
            });
            for (let optionValue in optionsetAttribute.OptionSet.Options) {
                const option = optionsetAttribute.OptionSet.Options[optionValue];
                const optionId = this._newId();

                this.OptionSetMetadataSQL.AddOptionMetadata({
                    OptionId: optionId,
                    OptionSetId,
                    Color: option.Color,
                    Label: option.Label,
                    Value: option.Value,
                });
            }
        } else if (attribute.AttributeType === AttributeType.Boolean) {
            const booleanAttribute = attribute as ShkoOnline.BooleanAttributeMetadata;
            if (!booleanAttribute.OptionSet) {
                booleanAttribute.OptionSet = {
                    MetadataId: '',
                    IsCustomOptionSet: false,
                    Name: booleanAttribute.LogicalName,
                    OptionSetType: OptionSetType.Boolean,
                    DisplayName: '',
                    FalseOption: {
                        Color: '',
                        Label: 'No',
                        Value: 0,
                    },
                    TrueOption: {
                        Color: '',
                        Label: 'Yes',
                        Value: 1,
                    },
                };
            }
            if (!booleanAttribute.OptionSet.FalseOption) {
                booleanAttribute.OptionSet.FalseOption = {
                    Color: '',
                    Label: 'No',
                    Value: 0,
                };
            }
            if (!booleanAttribute.OptionSet.TrueOption) {
                booleanAttribute.OptionSet.TrueOption = {
                    Color: '',
                    Label: 'Yes',
                    Value: 1,
                };
            }
            if (!booleanAttribute.OptionSet.MetadataId) {
                booleanAttribute.OptionSet.MetadataId = this._newId();
            }
            OptionSetId = booleanAttribute.OptionSet.MetadataId;
            this.OptionSetMetadataSQL.AddOptionSetMetadata({
                IsCustomOptionSet: booleanAttribute.OptionSet.IsCustomOptionSet,
                LogicalName: booleanAttribute.OptionSet.Name,
                OptionSetId,
                OptionSetType: booleanAttribute.OptionSet.OptionSetType,
            });

            let OptionId = this._newId();
            let option = booleanAttribute.OptionSet.FalseOption;
            this.OptionSetMetadataSQL.AddOptionMetadata({
                OptionId,
                OptionSetId,
                Color: option.Color,
                Label: option.Label,
                Value: option.Value,
            });
            OptionId = this._newId();
            option = booleanAttribute.OptionSet.TrueOption;
            this.OptionSetMetadataSQL.AddOptionMetadata({
                OptionId,
                OptionSetId,
                Color: option.Color,
                Label: option.Label,
                Value: option.Value,
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
        if (this.EntityMetadataSQL.SelectTableMetadata(metadata.LogicalName).length == 0) {
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
        } else {
            attributes.forEach((attribute) => {
                this.upsertAttributeMetadata(metadata.LogicalName, attribute);
            });
        }
    }

    /**
     * Get the metadata for a specific attribute
     * @param entity The target table
     * @param attribute The target attribute
     */
    getAttributeMetadata(entity: string, attribute: string) {
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
            PrimaryImageAttribute: tableMetadataDB[0].PrimaryImageAttribute,
        } as ShkoOnline.EntityMetadata;

        var resultDB = this.AttributeMetadataSQL.SelectAttributeMetadata(attribute, entity);
        if (!resultDB || resultDB.length === 0) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for ${entity} ${attribute}`);
            }
            return null;
        }

        return this.mapAttributeFromAttributeDB(tableMetadata, resultDB[0]);
    }

    /**
     * Get the metadata for a table
     * @param entity The target table
     */
    getTableMetadataByEntitySet(entitySetName: string) {
        const tableMetadataDB = this.EntityMetadataSQL.SelectTableMetadataByEntitySet(entitySetName);
        if (!tableMetadataDB || tableMetadataDB.length === 0) {
            if (this._warnMissingInit) {
                console.warn(`Missing init for entitySet ${entitySetName}`);
            }
            return;
        }

        return this.getTableMetadata(tableMetadataDB[0].LogicalName);
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
            PrimaryImageAttribute: tableMetadataDB[0].PrimaryImageAttribute,
        } as ShkoOnline.EntityMetadata;

        const attributesDB = this.AttributeMetadataSQL.SelectAttributeMetadataForTable(entity);
        attributesDB.forEach((attributeDB) => {
            const attribute = this.mapAttributeFromAttributeDB(tableMetadata, attributeDB);
            tableMetadata.Attributes?.push(attribute);
        });
        return tableMetadata;
    }

    private mapAttributeFromAttributeDB(tableMetadata: ShkoOnline.EntityMetadata, attributeDB: AttributeDB) {
        const attribute = {
            AttributeType: attributeDB.AttributeType,
            EntityLogicalName: tableMetadata.LogicalName,
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
            const optionsDB = this.OptionSetMetadataSQL.SelectOptionSetOptionMetadata(attributeDB.OptionSetId || '');
            optionsDB.forEach((option) => {
                (attribute as ShkoOnline.PickListAttributeMetadata).OptionSet.Options[option.Value] = {
                    Label: option.Label,
                    Value: option.Value,
                    Color: option.Color,
                };
            });
        } else if (attribute.AttributeType === AttributeType.Boolean) {
            const optionsetDB = this.OptionSetMetadataSQL.SelectOptionSetMetadata(attributeDB.OptionSetId || '');
            (attribute as ShkoOnline.BooleanAttributeMetadata).OptionSet = {
                IsCustomOptionSet: optionsetDB[0].IsCustomOptionSet,
                MetadataId: optionsetDB[0].OptionSetId,
                Name: optionsetDB[0].LogicalName,
                OptionSetType: optionsetDB[0].OptionSetType,
                DisplayName: '',
                FalseOption: {
                    Color: '',
                    Label: 'No',
                    Value: 0,
                },
                TrueOption: {
                    Color: '',
                    Label: 'Yes',
                    Value: 1,
                },
            };
            const optionsDB = this.OptionSetMetadataSQL.SelectOptionSetOptionMetadata(attributeDB.OptionSetId || '');
            optionsDB.forEach((option) => {
                (attribute as ShkoOnline.BooleanAttributeMetadata).OptionSet[
                    option.Value ? 'TrueOption' : 'FalseOption'
                ] = {
                    Label: option.Label,
                    Value: option.Value,
                    Color: option.Color,
                };
            });
        }
        return attribute;
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

        let attributeDB = this.AttributeMetadataSQL.SelectAttributeMetadata(attributeMetadata.LogicalName, entity);
        if (attributeMetadata.MetadataId) {
            attributeDB = attributeDB.concat(
                this.AttributeMetadataSQL.SelectAttributeMetadataById(attributeMetadata.MetadataId),
            );
        }

        if (attributeDB && attributeDB.length > 0) {
            attributeDB.forEach((attribute) => {
                if (
                    (attributeMetadata.AttributeType === AttributeType.Boolean ||
                        attributeMetadata.AttributeType === AttributeType.Lookup ||
                        attributeMetadata.AttributeType === AttributeType.Picklist ||
                        attributeMetadata.AttributeType === AttributeType.State ||
                        attributeMetadata.AttributeType == AttributeType.Status) &&
                    attribute.OptionSetId
                ) {
                    this.db.exec('DELETE FROM Metadata__Optionset WHERE OptionSetId = ?', [attribute.OptionSetId]);
                    this.db.exec('DELETE FROM Metadata__Optionset_Option WHERE OptionSetId = ?', [
                        attribute.OptionSetId,
                    ]);
                }
                if (attribute.AttributeId)
                    this.db.exec('DELETE FROM Metadata__Attribute WHERE AttributeId = ?', [attribute.AttributeId]);
            });
        }

        const virtualAttribute = attributeMetadata.LogicalName + 'name';
        this.createAttribute(tableDB[0].EntityId, attributeMetadata);

        if (
            attributeMetadata.AttributeType === AttributeType.Boolean ||
            attributeMetadata.AttributeType === AttributeType.Lookup ||
            attributeMetadata.AttributeType === AttributeType.Picklist ||
            attributeMetadata.AttributeType === AttributeType.State ||
            attributeMetadata.AttributeType == AttributeType.Status
        ) {
            let optionsetMetadata = attributeMetadata as ShkoOnline.PickListAttributeMetadata;
            if (optionsetMetadata.OptionSet && optionsetMetadata.OptionSet.MetadataId) {
                this.db.exec('DELETE FROM Metadata__Optionset WHERE OptionSetId = ?', [
                    optionsetMetadata.OptionSet.MetadataId,
                ]);
                this.db.exec('DELETE FROM Metadata__Optionset_Option WHERE OptionSetId = ?', [
                    optionsetMetadata.OptionSet.MetadataId,
                ]);
            }
            this.createAttribute(tableDB[0].EntityId, {
                AttributeOf: attributeMetadata.LogicalName,
                AttributeType: AttributeType.Virtual,
                LogicalName: virtualAttribute,
                SchemaName: (attributeMetadata.SchemaName || attributeMetadata.LogicalName) + 'Name',
            } as ShkoOnline.AttributeMetadata);
            if (!(attributeDB && attributeDB.length > 0))
                this.db.exec('ALTER TABLE ' + safeTableName + ' ADD COLUMN [' + virtualAttribute + '] string');

            if (optionsetMetadata.OptionSet) {
                this.OptionSetMetadataSQL.AddOptionSetMetadata({
                    IsCustomOptionSet: optionsetMetadata.OptionSet.IsCustomOptionSet,
                    LogicalName: optionsetMetadata.OptionSet.Name,
                    OptionSetId: optionsetMetadata.OptionSet.MetadataId,
                    OptionSetType: optionsetMetadata.OptionSet.OptionSetType,
                });
                for (let optionValue in optionsetMetadata.OptionSet.Options) {
                    const option = optionsetMetadata.OptionSet.Options[optionValue];
                    const optionId = this._newId();
                    this.OptionSetMetadataSQL.AddOptionMetadata({
                        OptionId: optionId,
                        OptionSetId: optionsetMetadata.OptionSet.MetadataId,
                        Color: option.Color,
                        Label: option.Label,
                        Value: option.Value,
                    });
                }
            }
        }

        if (!(attributeDB && attributeDB.length > 0)) {
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
                    'ALTER TABLE ' +
                        safeTableName +
                        ' ADD COLUMN [' +
                        attributeMetadata.LogicalName +
                        'navigation] string',
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
            if (
                tableMetadataDB[0].LogicalName === MetadataDB.CanvasLogicalName &&
                this.db.exec('SELECT Count(1) as Records FROM _canvasapp')[0].Records > 0
            ) {
                tableMetadata?.Attributes?.forEach((attribute) => {
                    if (attribute.LogicalName in item) {
                        this.UpdateValue(
                            item[attribute.LogicalName as unknown as keyof typeof item],
                            MetadataDB.CanvasLogicalName,
                            attribute.LogicalName,
                        );
                    }
                });
            } else {
                this.AddRow(tableMetadataDB[0].LogicalName, item, tableMetadata);
            }
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
            if (entity === 'savedquery') {
                tableMetadata = SavedQueryMetadata;
                this.initMetadata([tableMetadata]);
            } else if (entity === 'userquery') {
                tableMetadata = UserQueryMetadata;
                this.initMetadata([tableMetadata]);
            } else {
                if (this._warnMissingInit) {
                    console.warn(`Missing init for entitySet ${entity}`);
                }
                return;
            }
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
            result.entityMetadata.Attributes.filter((attr) => attr.AttributeType === AttributeType.Lookup).forEach(
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

    SelectUsingFetchXml(fetchXml: XMLDocument) {
        var fetchNode = fetchXml.documentElement;
        var entityNode = fetchNode.firstElementChild;
        if (!entityNode) {
            throw new Error('Fetch does not contain the entity node');
        }

        var attributesX = entityNode.getElementsByTagName('attribute');
        const attributes: string[] = [];

        if (fetchNode.getAttribute('aggregate') === 'true') {
            for (let i = 0; i < attributesX.length; i++) {
                const attribute = attributesX[i].getAttribute('name') as string;
                const aggregate = attributesX[i].getAttribute('aggregate') as string;
                const alias = attributesX[i].getAttribute('alias') as string;
                attributes.push(`${aggregate}(${attribute}) as [${alias}]`);
            }
        } else {
            for (let i = 0; i < attributesX.length; i++) {
                attributes.push(attributesX[i].getAttribute('name') as string);
            }
        }

        return this.db.exec(`SELECT ${attributes.join(',')} FROM ${entityNode.getAttribute('name')}`);
    }

    SelectUsingOData(tableMetadata: ShkoOnline.EntityMetadata, query: ODataQuery) {
        const safeTableName = tableMetadata.LogicalName.toLowerCase().replace(/\!/g, '_').replace(/\@/g, '_');

        const attributes: string[] = [];

        if (query.$select && tableMetadata.Attributes) {
            tableMetadata.Attributes.forEach((attribute) => {
                if (
                    attribute.AttributeType === AttributeType.Lookup &&
                    query.$select?.find((a) => a === `_${attribute.LogicalName}_value`)
                ) {
                    attributes.push(attribute.LogicalName);
                    attributes.push(attribute.LogicalName + 'name');
                    attributes.push(attribute.LogicalName + 'type');
                } else if (query.$select?.find((a) => a === attribute.LogicalName)) {
                    attributes.push(attribute.LogicalName);
                    if (
                        attribute.AttributeType === AttributeType.Boolean ||
                        attribute.AttributeType === AttributeType.Picklist ||
                        attribute.AttributeType === AttributeType.State ||
                        attribute.AttributeType === AttributeType.Status
                    ) {
                        attributes.push(attribute.LogicalName + 'name');
                    }
                }
            });
        }

        return this.db.exec(`SELECT ${attributes.join(',')} FROM ${safeTableName}`);
    }
}
