/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { ODataQuery } from '@shko.online/dataverse-odata';
import type { ShkoOnline } from '../../ShkoOnline';
import type { AttributeDB } from './SQLQueries';

import alasql from 'alasql';

import { AttributeMetadataSQL, EntityMetadataSQL, OptionSetMetadataSQL } from './SQLQueries';
import { getAttributeTypeFromString } from './getAttributeTypeFromString';
import { getSqlTypeForAttribute } from './getSQLTypeForAttribute';
import { AttributeType, OptionSetType } from './AttributeType';
import { SavedQueryMetadata } from './PlatformMetadata/SavedQuery.Metadata';
import { UserQueryMetadata } from './PlatformMetadata/UserQuery.Metadata';
import { cloneEntityMetadata, getNameAttribute, hasNameColumn, sqlIdentifier, toSqlTableName } from './SqlHelpers';
import { getOrderByFromOData, getWhereClauseFromODataFilter, resolveODataAttribute } from './Query/ODataToSql';
import {
    getFetchChildElements,
    getOrderByFromFetch,
    getWhereClauseFromFetchFilter,
    resolveFetchAttribute,
} from './Query/FetchXmlToSql';
import type { LookupReference } from './Wire';
import { parseODataBind, readFormattedValue, readLookupFromItem, readMultiSelectValue } from './Wire';
import { invalidRequestError } from './Errors';

export interface MetadataStoreOptions {
    /**
     * Generates the ids of new rows and metadata items. Defaults to alasql `NEWID()`.
     */
    newId?: () => string;
}

/**
 * A lookup value together with the navigation property used to set it.
 */
export type LookupValueWithNavigation = LookupReference;

type Row = { [attribute: string]: any };

const defaultFalseOption = () => ({ Color: '', Label: 'No', Value: 0 });
const defaultTrueOption = () => ({ Color: '', Label: 'Yes', Value: 1 });

/**
 * In-memory Dataverse: table metadata (entities, attributes, option sets) and rows, backed by alasql.
 * Free of PCF / sinon dependencies so it can back different API mocks (PCF WebApi, Xrm.WebApi, ...).
 */
export class MetadataStore {
    /**
     * Setting this to `true` will warn for missing metadata when doing operations.
     */
    _warnMissingInit: boolean;
    db: {
        databaseid: string;
        exec: typeof alasql;
        tables: { [table: string]: { columns: { columnid: string }[] } };
    };
    EntityMetadataSQL: EntityMetadataSQL;
    OptionSetMetadataSQL: OptionSetMetadataSQL;
    AttributeMetadataSQL: AttributeMetadataSQL;
    private _metadataCache: Map<string, ShkoOnline.EntityMetadata>;

    private _generateId: () => string;

    constructor(options?: MetadataStoreOptions) {
        this._warnMissingInit = false;
        this._metadataCache = new Map();
        this.db = new (alasql as any).Database();
        this.AttributeMetadataSQL = new AttributeMetadataSQL(this.db.exec.bind(this.db));
        this.EntityMetadataSQL = new EntityMetadataSQL(this.db.exec.bind(this.db));
        this.OptionSetMetadataSQL = new OptionSetMetadataSQL(this.db.exec.bind(this.db));

        this._generateId = options?.newId ?? (() => this.db.exec<{ ID: string }[]>('SELECT NEWID() as ID')[0]['ID']);
    }

    /**
     * Generates the ids of new rows and metadata items.
     */
    newId(): string {
        return this._generateId();
    }

    /**
     * Drops the cached table metadata. Call this if you modify the `Metadata__*` tables directly.
     */
    invalidateMetadataCache() {
        this._metadataCache.clear();
    }

    private warn(message: string) {
        if (this._warnMissingInit) {
            console.warn(message);
        }
    }

    createAttribute(entityId: string, attribute: ShkoOnline.AttributeMetadata) {
        this.invalidateMetadataCache();
        if (!attribute.MetadataId) attribute.MetadataId = this.newId();
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
                optionsetAttribute.OptionSet.MetadataId = this.newId();
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
                this.OptionSetMetadataSQL.AddOptionMetadata({
                    OptionId: this.newId(),
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
                    FalseOption: defaultFalseOption(),
                    TrueOption: defaultTrueOption(),
                };
            }
            if (!booleanAttribute.OptionSet.FalseOption) {
                booleanAttribute.OptionSet.FalseOption = defaultFalseOption();
            }
            if (!booleanAttribute.OptionSet.TrueOption) {
                booleanAttribute.OptionSet.TrueOption = defaultTrueOption();
            }
            if (!booleanAttribute.OptionSet.MetadataId) {
                booleanAttribute.OptionSet.MetadataId = this.newId();
            }
            OptionSetId = booleanAttribute.OptionSet.MetadataId;
            this.OptionSetMetadataSQL.AddOptionSetMetadata({
                IsCustomOptionSet: booleanAttribute.OptionSet.IsCustomOptionSet,
                LogicalName: booleanAttribute.OptionSet.Name,
                OptionSetId,
                OptionSetType: booleanAttribute.OptionSet.OptionSetType,
            });
            [booleanAttribute.OptionSet.FalseOption, booleanAttribute.OptionSet.TrueOption].forEach((option) => {
                this.OptionSetMetadataSQL.AddOptionMetadata({
                    OptionId: this.newId(),
                    OptionSetId: OptionSetId as string,
                    Color: option.Color,
                    Label: option.Label,
                    Value: option.Value,
                });
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
        this.invalidateMetadataCache();
        const entityId = this.newId();
        const safeTableName = toSqlTableName(metadata.LogicalName);

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
                !hasNameColumn(attr.AttributeType) ||
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
                DisplayName: metadata.DisplayName,
                DisplayCollectionName: metadata.DisplayCollectionName,
                LogicalCollectionName: metadata.LogicalCollectionName,
                Description: metadata.Description,
            });

            const columns: string[] = [];
            attributes.forEach((attribute) => {
                this.createAttribute(entityId, attribute);
                columns.push(
                    `${sqlIdentifier(attribute.LogicalName)} ${getSqlTypeForAttribute(attribute.AttributeType)}`,
                );
                if (attribute.AttributeType === AttributeType.Lookup) {
                    columns.push(`${sqlIdentifier(attribute.LogicalName + 'type')} string`);
                    columns.push(`${sqlIdentifier(attribute.LogicalName + 'navigation')} string`);
                }
            });

            // Create Table
            this.db.exec(`CREATE TABLE ${safeTableName} (${columns.join(',')})`);
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
     * @returns `undefined` when the table is missing, `null` when the attribute is missing
     */
    getAttributeMetadata(entity: string, attribute: string) {
        const tableMetadata = this.getTableMetadata(entity);
        if (!tableMetadata) {
            return;
        }
        const attributeMetadata = tableMetadata.Attributes?.find((attr) => attr.LogicalName === attribute);
        if (!attributeMetadata) {
            this.warn(`Missing init for ${entity} ${attribute}`);
            return null;
        }
        return attributeMetadata;
    }

    /**
     * Get the metadata for a table
     * @param entitySetName The entity set name of the target table
     */
    getTableMetadataByEntitySet(entitySetName: string) {
        const tableMetadataDB = this.EntityMetadataSQL.SelectTableMetadataByEntitySet(entitySetName);
        if (!tableMetadataDB || tableMetadataDB.length === 0) {
            this.warn(`Missing init for entitySet ${entitySetName}`);
            return;
        }

        return this.getTableMetadata(tableMetadataDB[0].LogicalName);
    }

    /**
     * Get the metadata for a table.
     * The result is a copy: changing it does not change the metadata stored in the database.
     * @param entity The target table
     */
    getTableMetadata(entity: string) {
        let tableMetadata = this._metadataCache.get(entity);
        if (!tableMetadata) {
            tableMetadata = this.loadTableMetadata(entity);
            if (!tableMetadata) {
                this.warn(`Missing init for ${entity}`);
                return;
            }
            this._metadataCache.set(entity, tableMetadata);
        }
        return cloneEntityMetadata(tableMetadata);
    }

    private loadTableMetadata(entity: string) {
        const tableMetadataDB = this.EntityMetadataSQL.SelectTableMetadata(entity);
        if (!tableMetadataDB || tableMetadataDB.length === 0) {
            return;
        }
        const tableMetadata = {
            LogicalName: tableMetadataDB[0].LogicalName,
            EntitySetName: tableMetadataDB[0].EntitySetName,
            Attributes: [],
            PrimaryIdAttribute: tableMetadataDB[0].PrimaryIdAttribute,
            PrimaryNameAttribute: tableMetadataDB[0].PrimaryNameAttribute,
            PrimaryImageAttribute: tableMetadataDB[0].PrimaryImageAttribute,
            DisplayName: tableMetadataDB[0].DisplayName,
            DisplayCollectionName: tableMetadataDB[0].DisplayCollectionName,
            LogicalCollectionName: tableMetadataDB[0].LogicalCollectionName,
            Description: tableMetadataDB[0].Description,
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

        const optionsetDB = attributeDB.OptionSetId
            ? this.OptionSetMetadataSQL.SelectOptionSetMetadata(attributeDB.OptionSetId)[0]
            : undefined;

        if (attribute.AttributeType === AttributeType.Picklist && optionsetDB) {
            const picklistAttribute = attribute as ShkoOnline.PickListAttributeMetadata;
            picklistAttribute.DefaultFormValue = attributeDB.DefaultFormValue as number;
            picklistAttribute.OptionSet = {
                IsCustomOptionSet: optionsetDB.IsCustomOptionSet,
                MetadataId: optionsetDB.OptionSetId,
                Name: optionsetDB.LogicalName,
                OptionSetType: optionsetDB.OptionSetType,
                Options: {},
            };
            this.OptionSetMetadataSQL.SelectOptionSetOptionMetadata(optionsetDB.OptionSetId).forEach((option) => {
                picklistAttribute.OptionSet.Options[option.Value] = {
                    Label: option.Label,
                    Value: option.Value,
                    Color: option.Color,
                };
            });
        } else if (attribute.AttributeType === AttributeType.Boolean && optionsetDB) {
            const booleanAttribute = attribute as ShkoOnline.BooleanAttributeMetadata;
            booleanAttribute.OptionSet = {
                IsCustomOptionSet: optionsetDB.IsCustomOptionSet,
                MetadataId: optionsetDB.OptionSetId,
                Name: optionsetDB.LogicalName,
                OptionSetType: optionsetDB.OptionSetType,
                DisplayName: '',
                FalseOption: defaultFalseOption(),
                TrueOption: defaultTrueOption(),
            };
            this.OptionSetMetadataSQL.SelectOptionSetOptionMetadata(optionsetDB.OptionSetId).forEach((option) => {
                booleanAttribute.OptionSet[option.Value ? 'TrueOption' : 'FalseOption'] = {
                    Label: option.Label,
                    Value: option.Value,
                    Color: option.Color,
                };
            });
        }
        return attribute;
    }

    /**
     * Adds a column to a physical table, unless it is already there.
     */
    private ensureColumn(safeTableName: string, column: string, sqlType: string) {
        if (this.db.tables[safeTableName]?.columns.some((c) => c.columnid === column)) {
            return;
        }
        this.db.exec(`ALTER TABLE ${safeTableName} ADD COLUMN ${sqlIdentifier(column)} ${sqlType}`);
    }

    private deleteAttributeMetadata(attribute: AttributeDB) {
        if (attribute.OptionSetId) {
            this.OptionSetMetadataSQL.DeleteOptionSetMetadata(attribute.OptionSetId);
        }
        this.AttributeMetadataSQL.DeleteAttributeMetadata(attribute.AttributeId);
    }

    /**
     * Update or Insert the metadata for a specific column of a table
     * @param entity The target table
     * @param attributeMetadata The target column
     * @returns
     */
    upsertAttributeMetadata(entity: string, attributeMetadata: ShkoOnline.AttributeMetadata) {
        const tableDB = this.EntityMetadataSQL.SelectTableMetadata(entity);
        if (!tableDB || tableDB.length === 0) {
            console.warn(`Could not find metadata for ${entity}`);
            return;
        }
        this.invalidateMetadataCache();
        const table = tableDB[0];
        const safeTableName = toSqlTableName(table.LogicalName);
        attributeMetadata.AttributeType = getAttributeTypeFromString(attributeMetadata.AttributeType);

        // Remove the previous definition, matched by name or by id (within the same table)
        const existing = this.AttributeMetadataSQL.SelectAttributeMetadata(attributeMetadata.LogicalName, entity);
        if (attributeMetadata.MetadataId) {
            this.AttributeMetadataSQL.SelectAttributeMetadataById(attributeMetadata.MetadataId)
                .filter(
                    (byId) =>
                        byId.EntityLogicalName === table.LogicalName &&
                        !existing.some((byName) => byName.AttributeId === byId.AttributeId),
                )
                .forEach((byId) => existing.push(byId));
        }
        existing.forEach((attribute) => this.deleteAttributeMetadata(attribute));

        // The caller may reuse the option set id of the previous definition
        if (
            attributeMetadata.AttributeType === AttributeType.Boolean ||
            attributeMetadata.AttributeType === AttributeType.Picklist
        ) {
            const optionSetId = (attributeMetadata as ShkoOnline.PickListAttributeMetadata).OptionSet?.MetadataId;
            if (optionSetId) {
                this.OptionSetMetadataSQL.DeleteOptionSetMetadata(optionSetId);
            }
        }

        this.createAttribute(table.EntityId, attributeMetadata);
        this.ensureColumn(
            safeTableName,
            attributeMetadata.LogicalName,
            getSqlTypeForAttribute(attributeMetadata.AttributeType),
        );
        if (attributeMetadata.AttributeType === AttributeType.Lookup) {
            this.ensureColumn(safeTableName, attributeMetadata.LogicalName + 'type', 'string');
            this.ensureColumn(safeTableName, attributeMetadata.LogicalName + 'navigation', 'string');
        }

        if (hasNameColumn(attributeMetadata.AttributeType)) {
            const virtualAttribute = attributeMetadata.LogicalName + 'name';
            if (this.AttributeMetadataSQL.SelectAttributeMetadata(virtualAttribute, entity).length === 0) {
                this.createAttribute(table.EntityId, {
                    AttributeOf: attributeMetadata.LogicalName,
                    AttributeType: AttributeType.Virtual,
                    LogicalName: virtualAttribute,
                    SchemaName: (attributeMetadata.SchemaName || attributeMetadata.LogicalName) + 'Name',
                } as ShkoOnline.AttributeMetadata);
            }
            this.ensureColumn(safeTableName, virtualAttribute, 'string');
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
            this.warn(`Missing init for entitySet ${entitySetName}`);
            return;
        }

        const tableMetadata = this.getTableMetadata(tableMetadataDB[0].LogicalName);

        items.value.forEach((item) => {
            this.AddRow(tableMetadataDB[0].LogicalName, item, tableMetadata);
        });
    }

    /**
     * Resolves a Web API `@odata.bind` reference (e.g. `/contacts(00000000-0000-0000-0000-000000000001)`)
     * to a lookup value.
     */
    resolveODataBind(bind: string | null): LookupValueWithNavigation | null {
        if (bind === null || bind === undefined) {
            return null;
        }
        const { entitySetName, id } = parseODataBind(bind);
        return this.resolveRowReference(entitySetName, id);
    }

    private resolveRowReference(entitySetName: string, id: string): LookupValueWithNavigation {
        const targetMetadata = this.getTableMetadataByEntitySet(entitySetName);
        if (!targetMetadata) {
            console.warn(`@odata.bind references the entity set '${entitySetName}' that was not initialized`);
            return { id, entityType: undefined as unknown as string };
        }
        const target = this.GetRow(targetMetadata.LogicalName, id).row;
        return {
            id,
            entityType: targetMetadata.LogicalName,
            name: target?.[targetMetadata.PrimaryNameAttribute || 'name'] ?? undefined,
        };
    }

    /**
     * Reads the value of a lookup column from an item in any of the supported formats:
     * * a {@link LookupReference} stored in `item[logicalName]`
     * * a Web API `<navigation>@odata.bind` reference
     * * the Web API `_<logicalName>_value` property with its annotations
     * @returns `undefined` when the item doesn't contain the lookup
     */
    getLookupFromItem(item: Row, logicalName: string): LookupValueWithNavigation | null | undefined {
        return readLookupFromItem(item, logicalName, (entitySetName, id) =>
            this.resolveRowReference(entitySetName, id),
        );
    }

    /**
     * Computes the formatted value (label) of a Yes/No or Choice(s) column.
     */
    getFormattedValue(attribute: ShkoOnline.AttributeMetadata | undefined, value: unknown): string | undefined {
        if (!attribute || value === null || value === undefined) {
            return undefined;
        }
        if (attribute.AttributeType === AttributeType.Boolean) {
            const optionSet = (attribute as ShkoOnline.BooleanAttributeMetadata).OptionSet;
            return (value ? optionSet?.TrueOption : optionSet?.FalseOption)?.Label;
        }
        if (attribute.AttributeType === AttributeType.Picklist) {
            const options = (attribute as ShkoOnline.PickListAttributeMetadata).OptionSet?.Options ?? {};
            if (Array.isArray(value)) {
                return value.map((v) => options[v]?.Label ?? v).join('; ');
            }
            return options[value as number]?.Label;
        }
        return undefined;
    }

    /**
     * Add a new row to the table
     * @param entity The target table
     * @param item The data
     * @param tableMetadata The table metadata
     * @returns The id of the new row
     */
    AddRow(entity: string, item: any, tableMetadata?: ShkoOnline.EntityMetadata) {
        if (!tableMetadata) {
            tableMetadata = this.getTableMetadata(entity);
        }
        if (!tableMetadata) {
            const platformMetadata =
                entity === 'savedquery' ? SavedQueryMetadata : entity === 'userquery' ? UserQueryMetadata : undefined;
            if (!platformMetadata) {
                this.warn(`Missing init for entitySet ${entity}`);
                return;
            }
            this.initMetadata([cloneEntityMetadata(platformMetadata)]);
            tableMetadata = this.getTableMetadata(entity) as ShkoOnline.EntityMetadata;
        }
        const metadata = tableMetadata;

        const params: unknown[] = [];
        const columns: string[] = [];
        const addColumn = (column: string, value: unknown) => {
            columns.push(sqlIdentifier(column));
            params.push(value);
        };
        let newID = null;
        metadata.Attributes?.forEach((attribute) => {
            const key = attribute.LogicalName;

            if (attribute.AttributeType === AttributeType.Uniqueidentifier) {
                let value = item[key];
                if (!value && metadata.PrimaryIdAttribute === key) {
                    value = this.newId();
                }
                if (metadata.PrimaryIdAttribute === key) {
                    newID = value;
                }
                addColumn(key, value);
            } else if (attribute.AttributeType === AttributeType.Lookup) {
                const lookup = this.getLookupFromItem(item, key);
                if (lookup === undefined) {
                    return;
                }
                const nameAttribute = getNameAttribute(metadata, attribute);
                if (nameAttribute) {
                    addColumn(nameAttribute, lookup?.name ?? null);
                }
                addColumn(key + 'type', lookup?.entityType ?? null);
                addColumn(key + 'navigation', lookup?.navigation ?? null);
                addColumn(key, lookup?.id ?? null);
            } else if (attribute.AttributeOf && key === attribute.AttributeOf + 'name') {
                const parentAttribute = metadata.Attributes?.find((attr) => attr.LogicalName === attribute.AttributeOf);
                if (parentAttribute?.AttributeType === AttributeType.Lookup) {
                    return; // handled together with the lookup
                }
                const formattedValue =
                    readFormattedValue(item, attribute.AttributeOf) ??
                    this.getFormattedValue(
                        parentAttribute,
                        parentAttribute?.AttributeType === AttributeType.Picklist
                            ? readMultiSelectValue(item[attribute.AttributeOf])
                            : item[attribute.AttributeOf],
                    );
                if (formattedValue === undefined) {
                    return;
                }
                addColumn(key, formattedValue);
            } else if (key in item) {
                const value =
                    attribute.AttributeType === AttributeType.DateTime && typeof item[key] === 'string'
                        ? new Date(item[key])
                        : attribute.AttributeType === AttributeType.Picklist
                          ? readMultiSelectValue(item[key])
                          : item[key];
                if (value === null || value === undefined) {
                    return;
                }
                addColumn(key, value);
            }
        });

        const insertSql = `INSERT INTO ${toSqlTableName(metadata.LogicalName)} (${columns.join(',')}) VALUES (${params
            .map(() => '?')
            .join(',')})`;
        this.db.exec(insertSql, params);
        return newID;
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

        const columns = entityMetadata.Attributes?.length
            ? entityMetadata.Attributes.map((attr) =>
                  attr.AttributeType === AttributeType.Lookup
                      ? [attr.LogicalName, attr.LogicalName + 'type', attr.LogicalName + 'navigation']
                            .map(sqlIdentifier)
                            .join(',')
                      : sqlIdentifier(attr.LogicalName),
              ).join(',')
            : '*';
        let selectQuery = `SELECT ${columns} FROM ${toSqlTableName(entityMetadata.LogicalName)}`;
        if (id) {
            selectQuery += ` WHERE ${sqlIdentifier(entityMetadata.PrimaryIdAttribute || 'id')} = ?`;
        }

        const rowDB = this.db.exec<Row[]>(selectQuery, [id]);

        if (!rowDB || rowDB.length == 0) {
            this.warn(`Could not find row '${id}' in table '${entity}'`);
            return { row: null, entityMetadata };
        }

        const row = this.toStoreRow(rowDB[0], entityMetadata);
        return { row, entityMetadata };
    }

    /**
     * Delete a row from the in-memory database
     * @param entity The target table
     * @param id The target row
     */
    RemoveRow(entity: string, id: string) {
        const entityMetadata = this.getTableMetadata(entity);
        this.db.exec(
            `DELETE FROM ${toSqlTableName(entity)} WHERE ${sqlIdentifier(entityMetadata?.PrimaryIdAttribute || 'id')} = ?`,
            [id],
        );
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
        const rows = this.db.exec<Row[]>('SELECT * FROM ' + toSqlTableName(entity));
        return { rows, entityMetadata };
    }

    /**
     * Update the value stored in a specific column in the in-memory database
     * @param value The new value
     * @param entity The target table
     * @param attribute The target column
     * @param rowId The target row. When omitted all the rows are updated.
     */
    UpdateValue<T>(value: T, entity: string, attribute: string, rowId?: string) {
        const tableMetadata = this.getTableMetadata(entity);
        if (!tableMetadata) {
            return;
        }

        const attributeMetadata = tableMetadata.Attributes?.find((attr) => attr.LogicalName === attribute);
        if (!attributeMetadata) {
            this.warn(`Missing init for attribute '${attribute}' of table '${entity}'`);
            return;
        }
        const assignments: string[] = [];
        const params: unknown[] = [];
        const set = (column: string, columnValue: unknown) => {
            assignments.push(`${sqlIdentifier(column)} = ?`);
            params.push(columnValue);
        };

        if (attributeMetadata.AttributeType === AttributeType.Lookup) {
            const lookupValue = value as unknown as LookupReference | null;
            const hasValue = !!lookupValue?.id;
            set(attributeMetadata.LogicalName, hasValue ? lookupValue?.id : null);
            set(attributeMetadata.LogicalName + 'type', hasValue ? lookupValue?.entityType : null);
            set(
                getNameAttribute(tableMetadata, attributeMetadata) || attributeMetadata.LogicalName + 'name',
                hasValue ? lookupValue?.name : null,
            );
        } else if (
            attributeMetadata.AttributeType === AttributeType.Picklist ||
            attributeMetadata.AttributeType === AttributeType.Boolean
        ) {
            set(attributeMetadata.LogicalName, Array.isArray(value) ? JSON.stringify(value) : value);
            const label = this.getFormattedValue(attributeMetadata, value);
            if (
                attributeMetadata.AttributeType === AttributeType.Picklist &&
                value !== null &&
                value !== undefined &&
                !Array.isArray(value) &&
                label === undefined
            ) {
                console.warn(`Picklist column ${attributeMetadata.LogicalName} is missing option ${value}`);
            }
            const nameAttribute = getNameAttribute(tableMetadata, attributeMetadata);
            if (nameAttribute) {
                set(nameAttribute, label ?? null);
            }
        } else {
            set(attributeMetadata.LogicalName, value);
        }

        let updateSql = `UPDATE ${toSqlTableName(tableMetadata.LogicalName)} SET ${assignments.join(', ')}`;
        if (rowId) {
            updateSql += ` WHERE ${sqlIdentifier(tableMetadata.PrimaryIdAttribute)} = ?`;
            params.push(rowId);
        }

        this.db.exec(updateSql, params);
    }

    /**
     * Builds the column list for a SELECT statement.
     * The primary id is always included, lookups bring their type, navigation and name columns along,
     * choices bring their formatted value column along.
     * @param requested The logical names of the columns to select. `undefined` selects all the columns.
     */
    private getSelectColumns(tableMetadata: ShkoOnline.EntityMetadata, requested?: string[]) {
        if (!requested) {
            return ['*'];
        }
        const columns: string[] = [];
        const add = (column: string) => {
            const identifier = sqlIdentifier(column);
            if (!columns.includes(identifier)) columns.push(identifier);
        };
        tableMetadata.Attributes?.forEach((attribute) => {
            if (
                attribute.LogicalName !== tableMetadata.PrimaryIdAttribute &&
                !requested.includes(attribute.LogicalName)
            ) {
                return;
            }
            add(attribute.LogicalName);
            if (attribute.AttributeType === AttributeType.Lookup) {
                add(attribute.LogicalName + 'type');
                add(attribute.LogicalName + 'navigation');
            }
            if (hasNameColumn(attribute.AttributeType)) {
                const nameAttribute = getNameAttribute(tableMetadata, attribute);
                if (nameAttribute) add(nameAttribute);
            }
        });
        return columns;
    }

    /**
     * Converts a row read from a physical table to the shape used by the store:
     * lookups become a {@link LookupReference} (or `null`) in `<logicalname>`,
     * dropping the helper `type` and `name` columns, and multi-select choices become arrays.
     * The `navigation` column is kept for the Web API serializer.
     */
    private toStoreRow(row: Row, tableMetadata: ShkoOnline.EntityMetadata) {
        tableMetadata.Attributes?.forEach((attribute) => {
            const key = attribute.LogicalName;
            if (!(key in row)) {
                return;
            }
            if (attribute.AttributeType === AttributeType.Lookup) {
                const nameAttribute = getNameAttribute(tableMetadata, attribute);
                row[key] = row[key]
                    ? ({
                          id: row[key],
                          entityType: row[key + 'type'],
                          name: nameAttribute ? row[nameAttribute] : undefined,
                      } as LookupReference)
                    : null;
                delete row[key + 'type'];
                if (nameAttribute) delete row[nameAttribute];
            } else if (attribute.AttributeType === AttributeType.Picklist && typeof row[key] === 'string') {
                try {
                    row[key] = JSON.parse(row[key]);
                } catch {
                    row[key] = readMultiSelectValue(row[key]);
                }
            }
        });
        return row;
    }

    /**
     * Executes a FetchXML query against the in-memory database.
     * Supports attributes, all-attributes, filters (nested, and/or), order, top/count, distinct and aggregates.
     * `link-entity` is not supported yet and is ignored.
     * @throws when the table or one of the attributes doesn't exist or an operator isn't supported
     */
    SelectUsingFetchXml(fetchXml: XMLDocument): Row[] {
        const fetchNode = fetchXml.documentElement;
        const entityNode = getFetchChildElements(fetchNode, 'entity')[0];
        if (!entityNode) {
            throw invalidRequestError('Fetch does not contain the entity node');
        }
        const entityName = entityNode.getAttribute('name') ?? '';
        const tableMetadata = this.getTableMetadata(entityName);
        if (!tableMetadata) {
            throw invalidRequestError(`Entity ${entityName} does not exist.`);
        }
        if (getFetchChildElements(entityNode, 'link-entity').length > 0) {
            console.warn('link-entity is not supported by the mock and will be ignored');
        }

        const attributeNodes = getFetchChildElements(entityNode, 'attribute');
        const isAggregate = fetchNode.getAttribute('aggregate') === 'true';
        let selectList: string[];
        let groupBy = '';
        if (isAggregate) {
            const groups: string[] = [];
            selectList = attributeNodes.map((node) => {
                const attribute = resolveFetchAttribute(tableMetadata, node.getAttribute('name'));
                const column = sqlIdentifier(attribute.LogicalName);
                const alias = sqlIdentifier(node.getAttribute('alias') ?? attribute.LogicalName);
                if (node.getAttribute('groupby') === 'true') {
                    groups.push(column);
                    return `${column} AS ${alias}`;
                }
                const distinct = node.getAttribute('distinct') === 'true' ? 'DISTINCT ' : '';
                const aggregate = (node.getAttribute('aggregate') ?? '').toLowerCase();
                switch (aggregate) {
                    case 'count':
                        return `COUNT(${distinct ? distinct + column : '*'}) AS ${alias}`;
                    case 'countcolumn':
                        return `COUNT(${distinct}${column}) AS ${alias}`;
                    case 'sum':
                    case 'avg':
                    case 'min':
                    case 'max':
                        return `${aggregate.toUpperCase()}(${distinct}${column}) AS ${alias}`;
                    default:
                        throw invalidRequestError(`Aggregate '${aggregate}' is not supported`);
                }
            });
            if (groups.length > 0) {
                groupBy = ' GROUP BY ' + groups.join(',');
            }
        } else {
            const requested =
                getFetchChildElements(entityNode, 'all-attributes').length > 0
                    ? undefined
                    : attributeNodes.map(
                          (node) => resolveFetchAttribute(tableMetadata, node.getAttribute('name')).LogicalName,
                      );
            selectList = this.getSelectColumns(tableMetadata, requested);
        }

        const params: unknown[] = [];
        const conditions = getFetchChildElements(entityNode, 'filter')
            .map((filter) => getWhereClauseFromFetchFilter(filter, tableMetadata, params))
            .filter((condition) => condition !== '');
        const where = conditions.length > 0 ? ' WHERE ' + conditions.map((c) => `(${c})`).join(' AND ') : '';
        const orderBy = getOrderByFromFetch(entityNode, tableMetadata);
        const top = parseInt(fetchNode.getAttribute('top') ?? fetchNode.getAttribute('count') ?? '', 10);
        const limit = top > 0 ? ` LIMIT ${top}` : '';
        const distinct = fetchNode.getAttribute('distinct') === 'true' ? 'DISTINCT ' : '';

        const rows = this.db.exec<Row[]>(
            `SELECT ${distinct}${selectList.join(',')} FROM ${toSqlTableName(
                tableMetadata.LogicalName,
            )}${where}${groupBy}${orderBy}${limit}`,
            params,
        );
        return isAggregate ? rows : rows.map((row) => this.toStoreRow(row, tableMetadata));
    }

    /**
     * Executes a parsed OData query (`$select`, `$filter`, `$orderby`, `$top`) against the in-memory database.
     * Rows are returned in the store shape, use `toWebApiEntity` to convert them to the Web API shape.
     * @throws when `$filter` or `$orderby` reference a column that doesn't exist or an operator isn't supported
     */
    SelectUsingOData(tableMetadata: ShkoOnline.EntityMetadata, query: ODataQuery) {
        const requested = query.$select
            ?.map((property) => {
                try {
                    return resolveODataAttribute(tableMetadata, property).LogicalName;
                } catch (e) {
                    this.warn((e as Error).message);
                    return undefined;
                }
            })
            .filter((logicalName): logicalName is string => !!logicalName);
        const columns = this.getSelectColumns(tableMetadata, requested);

        const params: unknown[] = [];
        const where = query.$filter
            ? ' WHERE ' + getWhereClauseFromODataFilter(query.$filter, tableMetadata, params)
            : '';
        const orderBy = getOrderByFromOData(query.$orderby, tableMetadata);
        const limit = query.$top && query.$top > 0 ? ` LIMIT ${Math.floor(query.$top)}` : '';

        const rows = this.db.exec<Row[]>(
            `SELECT ${columns.join(',')} FROM ${toSqlTableName(tableMetadata.LogicalName)}${where}${orderBy}${limit}`,
            params,
        );
        return rows.map((row) => this.toStoreRow(row, tableMetadata));
    }
}
