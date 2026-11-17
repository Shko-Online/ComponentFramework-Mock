/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { ODataQuery } from '@shko.online/dataverse-odata';
import type { EntityMetadata } from '../Metadata.types';
import type { MetadataStore, RelationshipMetadata } from '../MetadataStore';
import type { WebApiEntity, WebApiMetadata, WebApiPage, WireFormatter } from '../Wire';

import { parseOData } from '@shko.online/dataverse-odata';
import { AttributeType } from '../AttributeType';
import { DataverseErrorCode } from '../Errors';
import {
    ENTITY_NAVIGATION_PROPERTIES,
    getPage,
    MOCK_WEB_API_URL,
    pickMetadataProperties,
    pickWebApiProperties,
    toWebApiAttributeDefinition,
    toWebApiEntity,
    toWebApiEntityDefinition,
    toWebApiKeyDefinition,
    toWebApiPrivilege,
    toWebApiRelationshipDefinition,
} from '../Wire';

/**
 * The error raised by {@link DataverseWebApi}, shaped like the errors returned by the Dataverse Web API.
 */
export interface DataverseError {
    code?: string;
    message: string;
}

/**
 * Identifies the row affected by a create, update or delete.
 */
export interface RecordReference {
    entityType: string;
    id: string;
    name?: string;
}

/**
 * A collection returned by a Web API `GET` request.
 */
export interface WebApiCollection<T = WebApiEntity> {
    value: T[];
    /** Set only when there are more records */
    '@odata.nextLink'?: string;
}

export interface DataverseWebApiOptions {
    /** Formats the `@OData.Community.Display.V1.FormattedValue` annotations */
    formatter?: WireFormatter;
    /** Converts a row of the store to the Web API shape. Defaults to `toWebApiEntity` */
    serialize?: (row: WebApiEntity, tableMetadata: EntityMetadata) => WebApiEntity;
    /** Used to build `nextLink` */
    baseUrl?: string;
}

/**
 * The numeric error codes of the errors created by {@link DataverseWebApi}.
 * Kept out of the error objects so the PCF mock keeps returning `{ message, code? }`; read them with {@link getDataverseErrorCode}.
 */
const errorCodes = new WeakMap<object, number>();

const dataverseError = (message: string, errorCode: number, code?: string): DataverseError => {
    const error = code ? { code, message } : { message };
    errorCodes.set(error, errorCode);
    return error;
};

const entityDoesNotExist = (entityType: string) =>
    dataverseError(`Entity ${entityType} does not exist.`, DataverseErrorCode.InvalidRequest);

const resourceNotFound = (segment: string) =>
    dataverseError(`Resource not found for the segment '${segment}'.`, DataverseErrorCode.InvalidRequest, '0x80060888');

const notSupported = (feature: string) =>
    dataverseError(`${feature} is not supported by the mock.`, DataverseErrorCode.Unexpected);

const GUID = /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i;
const ODATA_TYPE_PREFIX = 'Microsoft.Dynamics.CRM.';

/** Splits `Segment(key)/rest`. The key can contain quoted values with parentheses and slashes. */
const splitSegment = (path: string) => {
    const invalidPath = () =>
        dataverseError(`Invalid path '${path}'.`, DataverseErrorCode.InvalidRequest, '0x80060888');
    const segment = /^[^/()]+/.exec(path)?.[0];
    if (!segment) throw invalidPath();
    let position = segment.length;
    let key: string | undefined;
    if (path.charAt(position) === '(') {
        let quoted = false;
        let end = position + 1;
        while (end < path.length && (quoted || path.charAt(end) !== ')')) {
            if (path.charAt(end) === "'") quoted = !quoted;
            end++;
        }
        if (end >= path.length) throw invalidPath();
        key = path.substring(position + 1, end);
        position = end + 1;
    }
    if (position === path.length) return { segment, key, rest: undefined as string | undefined };
    if (path.charAt(position) !== '/') throw invalidPath();
    return { segment, key, rest: path.substring(position + 1) as string | undefined };
};

/** Reads `<nameProperty>='x'` or a GUID key */
const parseMetadataKey = (key: string, nameProperty = 'LogicalName') => {
    const name = new RegExp(`^${nameProperty}='([^']*)'$`).exec(key);
    if (name) return { name: name[1] };
    if (GUID.test(key)) return { metadataId: key.replace(/[{}]/g, '').toLowerCase() };
    throw dataverseError(`Invalid key '${key}'.`, DataverseErrorCode.InvalidRequest, '0x80060888');
};

type AlternateKeyValue = string | number | boolean | null;

/** Reads the values of an alternate key: `name='Contoso',_primarycontactid_value=<guid>` */
const parseAlternateKey = (key: string) => {
    const invalidKey = () => dataverseError(`Invalid key '${key}'.`, DataverseErrorCode.InvalidRequest, '0x80060888');
    // Split on the commas outside the quoted values
    const pairs: string[] = [];
    let current = '';
    let quoted = false;
    for (let i = 0; i < key.length; i++) {
        const char = key.charAt(i);
        if (char === "'") quoted = !quoted;
        if (char === ',' && !quoted) {
            pairs.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    if (quoted) throw invalidKey();
    pairs.push(current);

    const values: { [attribute: string]: AlternateKeyValue } = {};
    pairs.forEach((pair) => {
        const separator = pair.indexOf('=');
        const name = pair.slice(0, separator).trim();
        const raw = pair.slice(separator + 1).trim();
        if (separator < 0 || !/^[A-Za-z_]\w*$/.test(name) || raw === '') throw invalidKey();
        // Lookups are referenced with their lookup property, the key definitions use the column
        const attribute = name.replace(/^_(.+)_value$/, '$1');
        if (/^'.*'$/.test(raw)) {
            values[attribute] = raw.slice(1, -1).replace(/''/g, "'");
        } else if (raw === 'null') {
            values[attribute] = null;
        } else if (raw === 'true' || raw === 'false') {
            values[attribute] = raw === 'true';
        } else if (GUID.test(raw)) {
            values[attribute] = raw.replace(/[{}]/g, '');
        } else if (!Number.isNaN(Number(raw))) {
            values[attribute] = Number(raw);
        } else {
            throw invalidKey();
        }
    });
    return values;
};

const sameKeyValue = (stored: unknown, value: AlternateKeyValue) => {
    if (value === null) return stored === null || stored === undefined;
    if (typeof value === 'string' && GUID.test(value) && typeof stored === 'string') {
        return stored.replace(/[{}]/g, '').toLowerCase() === value.toLowerCase();
    }
    return stored === value || (stored instanceof Date && typeof value === 'string' && stored.toISOString() === value);
};

/** Whether a definition is of the derived type `Microsoft.Dynamics.CRM.<type>` */
const hasODataType = (definition: WebApiMetadata, qualifiedType: string) =>
    definition['@odata.type'] === '#' + qualifiedType;

/** Describes how a metadata item was looked up, for the not found errors */
const describeMetadataKey = (nameProperty: string, name: string | undefined, metadataId: string | undefined) =>
    name !== undefined ? `${nameProperty} = '${name}'` : `MetadataId = '${metadataId}'`;

const sameId = (a: string | undefined, b: string) => !!a && a.replace(/[{}]/g, '').toLowerCase() === b;

/** The kind of metadata item exposed by a navigation property of a table, for the not found errors */
const metadataItemKind = (segment: string) => {
    if (segment === 'Attributes') return 'attribute';
    if (segment === 'Keys') return 'key';
    return 'relationship';
};

/** Applies the casts that follow a navigation property, e.g. `Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata` */
const castMetadataCollection = (items: WebApiMetadata[], segment: string, casts: string[]) => {
    let value = items;
    for (const cast of casts) {
        if (segment !== 'Attributes' || !cast.startsWith(ODATA_TYPE_PREFIX)) throw resourceNotFound(cast);
        value = value.filter((attribute) => hasODataType(attribute, cast));
    }
    return value;
};

/** Finds the item of a navigation property addressed by `key` */
const findMetadataItem = (items: WebApiMetadata[], segment: string, key: string, tableName: string) => {
    const nameProperty = segment === 'Attributes' || segment === 'Keys' ? 'LogicalName' : 'SchemaName';
    const { name, metadataId } = parseMetadataKey(key, nameProperty);
    const result = items.find((item) =>
        name === undefined ? sameId(item['MetadataId'], metadataId as string) : item[nameProperty] === name,
    );
    if (!result) {
        throw dataverseError(
            `Could not find ${metadataItemKind(segment)} with ${describeMetadataKey(nameProperty, name, metadataId)} on entity '${tableName}'.`,
            DataverseErrorCode.ObjectDoesNotExist,
            '0x80040217',
        );
    }
    return result;
};

/** Applies the casts and the `/OptionSet` navigation that follow an item of a navigation property */
const navigateMetadataItem = (item: WebApiMetadata, segment: string, parts: string[]) => {
    const isAttributes = segment === 'Attributes';
    let result = item;
    for (const part of parts) {
        if (isAttributes && part.startsWith(ODATA_TYPE_PREFIX)) {
            if (!hasODataType(result, part)) throw resourceNotFound(part);
        } else if (isAttributes && part === 'OptionSet' && result['OptionSet']) {
            result = result['OptionSet'] as WebApiMetadata;
        } else {
            throw resourceNotFound(part);
        }
    }
    return result;
};

const recordNotFound = (entityType: string, id: string) =>
    dataverseError(
        `Could not find record with id: '${id}' for entity: '${entityType}'.`,
        DataverseErrorCode.ObjectDoesNotExist,
    );

/**
 * Returns the numeric Dataverse error code of an error raised by {@link DataverseWebApi}:
 * the code it was created with, its hexadecimal `code`, its numeric `errorCode`,
 * or {@link DataverseErrorCode.Unexpected}.
 */
export const getDataverseErrorCode = (error: unknown): number => {
    if (error && typeof error === 'object') {
        const known = errorCodes.get(error);
        if (known !== undefined) return known;
        const { code, errorCode } = error as { code?: unknown; errorCode?: unknown };
        if (typeof errorCode === 'number') return errorCode;
        if (typeof code === 'string' && /^0x[0-9a-f]+$/i.test(code)) return Number.parseInt(code, 16);
    }
    return DataverseErrorCode.Unexpected;
};

/** Describes a thrown value that is neither an `Error` nor an error-like object */
const describeThrown = (e: unknown): string => {
    if (typeof e === 'object' && e !== null) {
        try {
            return JSON.stringify(e);
        } catch {
            return Object.prototype.toString.call(e);
        }
    }
    return String(e as string | number | boolean | bigint | symbol | null | undefined);
};

/**
 * Converts anything thrown while executing an operation to a {@link DataverseError}.
 */
export const toDataverseError = (e: unknown): DataverseError => {
    if (e instanceof Error) {
        return dataverseError(e.message, getDataverseErrorCode(e));
    }
    if (e && typeof e === 'object' && 'message' in e) {
        const error = e as DataverseError;
        if (!errorCodes.has(error)) errorCodes.set(error, getDataverseErrorCode(error));
        return error;
    }
    return dataverseError(describeThrown(e), DataverseErrorCode.Unexpected);
};

/**
 * The operations of the Dataverse Web API executed against a {@link MetadataStore}.
 * Synchronous and framework agnostic: the PCF `WebApi`, `Xrm.WebApi` and other mocks wrap it
 * with their promises, delays and return types.
 * Every method throws a {@link DataverseError} on failure.
 */
export class DataverseWebApi {
    private readonly store: MetadataStore;
    private readonly options: DataverseWebApiOptions;

    constructor(store: MetadataStore, options: DataverseWebApiOptions = {}) {
        this.store = store;
        this.options = options;
    }

    private execute<T>(operation: () => T): T {
        try {
            return operation();
        } catch (e) {
            throw toDataverseError(e);
        }
    }

    private getTableMetadata(entityType: string) {
        const tableMetadata = this.store.getTableMetadata(entityType);
        if (!tableMetadata) {
            throw entityDoesNotExist(entityType);
        }
        return tableMetadata;
    }

    private serialize(row: WebApiEntity, tableMetadata: EntityMetadata) {
        return this.options.serialize
            ? this.options.serialize(row, tableMetadata)
            : toWebApiEntity(row, tableMetadata, this.options.formatter);
    }

    /**
     * Creates a row. Lookups can be set with `<navigation>@odata.bind`.
     */
    createRecord(entityType: string, data: WebApiEntity): RecordReference {
        return this.execute(() => {
            const tableMetadata = this.getTableMetadata(entityType);
            const id = this.store.AddRow(entityType, data, tableMetadata) || '';
            return { entityType, id, name: data[tableMetadata.PrimaryNameAttribute || 'name'] };
        });
    }

    /**
     * Retrieves a row. Supports `$select` in `options`.
     */
    retrieveRecord(entityType: string, id: string, options?: string): WebApiEntity {
        return this.execute(() => {
            const { row, entityMetadata } = this.store.GetRow(entityType, id);
            if (!entityMetadata) {
                throw entityDoesNotExist(entityType);
            }
            if (!row) {
                throw recordNotFound(entityType, id);
            }
            const entity = this.serialize(row, entityMetadata);
            const select = options ? parseOData(options).$select : undefined;
            return select ? pickWebApiProperties(entity, select, entityMetadata.PrimaryIdAttribute) : entity;
        });
    }

    /**
     * Retrieves rows using OData (`$select`, `$filter`, `$orderby`, `$top`), `fetchXml`, `savedQuery` or `userQuery`.
     * OData results are paged with `maxPageSize` and `$skiptoken`.
     */
    retrieveMultipleRecords(entityType: string, options?: string, maxPageSize?: number): WebApiPage {
        return this.execute(() => {
            const parsed = options ? parseOData(options) : ({} as ODataQuery);
            if (parsed.error) {
                throw parsed.error;
            }
            const tableMetadata = this.getTableMetadata(entityType);

            let fetchXml = parsed.fetchXml;
            let storedQueryTable: 'userquery' | 'savedquery' | undefined;
            if (parsed.userQuery) {
                storedQueryTable = 'userquery';
            } else if (parsed.savedQuery) {
                storedQueryTable = 'savedquery';
            }
            if (storedQueryTable) {
                const queryId = (parsed.userQuery ?? parsed.savedQuery) as string;
                const storedQuery = this.store.GetRow(storedQueryTable, queryId);
                if (!storedQuery.row) {
                    throw dataverseError(
                        `Entity '${storedQueryTable}' With Id = ${queryId} Does Not Exist`,
                        DataverseErrorCode.ObjectDoesNotExist,
                        '0x80040217',
                    );
                }
                if (storedQuery.row['returnedtypecode'] !== tableMetadata.LogicalName) {
                    throw dataverseError(
                        'No Query View exists with the Given Query Id on the Entity Set.',
                        DataverseErrorCode.InvalidRequest,
                        '0x80060888',
                    );
                }
                fetchXml = parseOData('?fetchXml=' + encodeURIComponent(storedQuery.row['fetchxml'])).fetchXml;
                if (!fetchXml) {
                    throw dataverseError(
                        `Entity '${storedQueryTable}' with id ${queryId} contains wrong data`,
                        DataverseErrorCode.InvalidRequest,
                    );
                }
            }

            const rows = fetchXml
                ? this.store.SelectUsingFetchXml(fetchXml)
                : this.store.SelectUsingOData(tableMetadata, parsed);
            const entities = rows.map((row) => this.serialize(row, tableMetadata));

            // FetchXML paging works with paging cookies, the Web API doesn't return a nextLink
            return fetchXml
                ? { entities }
                : getPage(
                      entities,
                      tableMetadata.EntitySetName || tableMetadata.LogicalName,
                      options,
                      maxPageSize,
                      this.options.baseUrl ?? MOCK_WEB_API_URL,
                  );
        });
    }

    /**
     * Updates the columns present in `data`. Lookups can be set with `<navigation>@odata.bind`.
     */
    updateRecord(entityType: string, id: string, data: WebApiEntity): RecordReference {
        return this.execute(() => {
            const tableMetadata = this.getTableMetadata(entityType);
            if (!this.store.GetRow(entityType, id).row) {
                throw recordNotFound(entityType, id);
            }

            tableMetadata.Attributes?.forEach((attribute) => {
                if (attribute.AttributeOf || attribute.AttributeType === AttributeType.Virtual) {
                    return;
                }
                if (attribute.AttributeType === AttributeType.Lookup) {
                    const lookup = this.store.getLookupFromItem(data, attribute.LogicalName);
                    if (lookup !== undefined) {
                        this.store.UpdateValue(lookup, entityType, attribute.LogicalName, id);
                    }
                } else if (attribute.LogicalName in data) {
                    this.store.UpdateValue(data[attribute.LogicalName], entityType, attribute.LogicalName, id);
                }
            });

            const { row } = this.store.GetRow(entityType, id);
            return { entityType, id, name: row?.[tableMetadata.PrimaryNameAttribute || 'name'] };
        });
    }

    /**
     * Returns the entity set name of a table, e.g. `accounts` for `account`.
     */
    getEntitySetName(entityType: string): string {
        return this.execute(() => {
            const tableMetadata = this.getTableMetadata(entityType);
            return tableMetadata.EntitySetName || tableMetadata.LogicalName;
        });
    }

    /**
     * Retrieves the rows of a FetchXML query. The table is read from the `entity` element.
     */
    retrieveMultipleRecordsUsingFetchXml(fetchXml: string): WebApiPage {
        return this.execute(() => {
            const options = '?fetchXml=' + encodeURIComponent(fetchXml);
            const parsed = parseOData(options);
            if (parsed.error) {
                throw parsed.error;
            }
            const entityType = parsed.fetchXml?.getElementsByTagName('entity')[0]?.getAttribute('name');
            if (!entityType) {
                throw dataverseError(
                    'The FetchXML query does not have an entity element with a name.',
                    DataverseErrorCode.InvalidRequest,
                    '0x80060888',
                );
            }
            return this.retrieveMultipleRecords(entityType, options);
        });
    }

    /**
     * Executes a Web API `GET` request. `path` is relative to the Web API root, e.g.
     * `accounts?$select=name`, `accounts(<id>)`, `EntityDefinitions(LogicalName='account')/Attributes`.
     * Absolute URLs and paths starting with `api/data/v9.x/` are accepted too.
     * @param maxPageSize The `odata.maxpagesize` preference
     */
    get(path: string, maxPageSize?: number): WebApiEntity | WebApiCollection | WebApiMetadata {
        return this.execute(() => {
            const relative = path
                .trim()
                .replace(/^https?:\/\/[^/]+\//i, '')
                .replace(/^\/+/, '')
                .replace(/^api\/data\/v[\d.]+\//i, '');
            const queryStart = relative.indexOf('?');
            const resource = queryStart === -1 ? relative : relative.substring(0, queryStart);
            const query = queryStart === -1 ? '' : relative.substring(queryStart);
            const { segment, key, rest } = splitSegment(resource);

            if (segment === 'EntityDefinitions') {
                return this.getMetadata(key, rest, query);
            }
            if (segment === 'RelationshipDefinitions') {
                return this.getRelationshipMetadata(key, rest, query);
            }

            const tableMetadata = this.store.getTableMetadataByEntitySet(segment);
            if (!tableMetadata) {
                throw resourceNotFound(segment);
            }
            if (key === undefined) {
                if (rest !== undefined) throw resourceNotFound(rest);
                const page = this.retrieveMultipleRecords(tableMetadata.LogicalName, query || undefined, maxPageSize);
                const collection: WebApiCollection = { value: page.entities };
                if (page.nextLink) collection['@odata.nextLink'] = page.nextLink;
                return collection;
            }
            if (rest !== undefined) throw notSupported(`The navigation '${rest}'`);
            const id = GUID.test(key)
                ? key.replace(/[{}]/g, '')
                : this.findRecordIdByAlternateKey(tableMetadata.LogicalName, key);
            return this.retrieveRecord(tableMetadata.LogicalName, id, query || undefined);
        });
    }

    /**
     * Returns the id of the row identified by the values of an alternate key of the table.
     * @param key The values as in a Web API URL, `accountnumber='A1'` or `name='Contoso',_primarycontactid_value=<guid>`,
     * or as an object `{ accountnumber: 'A1' }`
     */
    findRecordIdByAlternateKey(entityType: string, key: string | { [attribute: string]: AlternateKeyValue }): string {
        return this.execute(() => {
            const tableMetadata = this.getTableMetadata(entityType);
            const values = typeof key === 'string' ? parseAlternateKey(key) : key;
            const attributes = Object.keys(values);
            const isKey = (tableMetadata.Keys ?? []).some(
                (entityKey) =>
                    entityKey.KeyAttributes.length === attributes.length &&
                    entityKey.KeyAttributes.every((attribute) => attributes.indexOf(attribute) !== -1),
            );
            if (!isKey) {
                throw dataverseError(
                    `The specified key attributes are not a defined key for the ${entityType} entity`,
                    DataverseErrorCode.EntityKeyNotDefined,
                    '0x80060890',
                );
            }
            const primaryKey = tableMetadata.PrimaryIdAttribute || 'id';
            const row = this.store
                .GetAllRows(entityType)
                .rows.find((candidate) =>
                    attributes.every((attribute) => sameKeyValue(candidate[attribute], values[attribute])),
                );
            if (!row) {
                throw dataverseError(
                    `A record with the specified key values does not exist in ${entityType} entity`,
                    DataverseErrorCode.RecordNotFoundByEntityKey,
                    '0x80060891',
                );
            }
            return row[primaryKey] as string;
        });
    }

    /** Reads `$select` and `$expand`, the only query options supported on the metadata entity sets */
    private readMetadataQuery(query: string, entitySet: string) {
        const params = new URLSearchParams(query);
        const unsupported: string[] = [];
        params.forEach((_value, name) => {
            if (name !== '$select' && name !== '$expand') unsupported.push(name);
        });
        if (unsupported.length > 0) {
            throw notSupported(`${unsupported.join(', ')} on ${entitySet}`);
        }
        const select = params.get('$select')?.split(',');
        // Nested options such as Attributes($select=LogicalName) are ignored
        const expand = (params.get('$expand')?.split(',') ?? []).map((e) => e.split('(')[0].trim());
        // The expanded properties are kept when selecting
        const selectWithExpand = select ? [...select, ...expand] : undefined;
        return { select: selectWithExpand, expand };
    }

    private getMetadata(key: string | undefined, rest: string | undefined, query: string) {
        const { select, expand } = this.readMetadataQuery(query, 'EntityDefinitions');
        const toDefinition = (tableMetadata: EntityMetadata) => {
            const definition = pickMetadataProperties(toWebApiEntityDefinition(tableMetadata), select);
            expand.forEach((property) => {
                if ((ENTITY_NAVIGATION_PROPERTIES as readonly string[]).indexOf(property) === -1) {
                    throw resourceNotFound(property);
                }
                definition[property] = this.getNavigationItems(tableMetadata, property);
            });
            return definition;
        };

        if (key === undefined) {
            if (rest !== undefined) throw resourceNotFound(rest);
            return {
                value: this.store.getTableNames().map((name) => toDefinition(this.findTableMetadata(name, true))),
            };
        }
        const { name, metadataId } = parseMetadataKey(key);
        const tableMetadata = this.findTableMetadata((name ?? metadataId) as string, name !== undefined);
        if (rest !== undefined) {
            // $expand=OptionSet on a column is always honored
            return this.getRelatedMetadata(tableMetadata.LogicalName, rest, select);
        }
        return toDefinition(tableMetadata);
    }

    /** The definitions of a navigation property of a table definition, in the Web API shape */
    private getNavigationItems(tableMetadata: EntityMetadata, property: string): WebApiMetadata[] {
        switch (property) {
            case 'Attributes':
                return (tableMetadata.Attributes ?? []).map((attribute) =>
                    toWebApiAttributeDefinition(attribute, tableMetadata.LogicalName),
                );
            case 'Keys':
                return (tableMetadata.Keys ?? []).map((key) => toWebApiKeyDefinition(key, tableMetadata.LogicalName));
            case 'OneToManyRelationships':
            case 'ManyToOneRelationships':
            case 'ManyToManyRelationships':
                return ((tableMetadata[property] ?? []) as RelationshipMetadata[]).map((relationship) =>
                    toWebApiRelationshipDefinition(relationship),
                );
            default:
                throw resourceNotFound(property);
        }
    }

    private getRelationshipMetadata(key: string | undefined, rest: string | undefined, query: string) {
        const { select, expand } = this.readMetadataQuery(query, 'RelationshipDefinitions');
        if (expand.length > 0) throw resourceNotFound(expand[0]);
        const casts = rest ? rest.split('/') : [];
        const definitions = this.store
            .getAllRelationshipMetadata()
            .map((relationship) => toWebApiRelationshipDefinition(relationship, true));
        const applyCasts = (value: WebApiMetadata[]) =>
            casts.reduce((filtered, cast) => {
                if (!cast.startsWith(ODATA_TYPE_PREFIX)) throw resourceNotFound(cast);
                return cast === `${ODATA_TYPE_PREFIX}RelationshipMetadataBase`
                    ? filtered
                    : filtered.filter((definition) => hasODataType(definition, cast));
            }, value);

        if (key === undefined) {
            return { value: applyCasts(definitions).map((definition) => pickMetadataProperties(definition, select)) };
        }
        const { name, metadataId } = parseMetadataKey(key, 'SchemaName');
        const definition = definitions.find((candidate) =>
            name !== undefined
                ? candidate['SchemaName'] === name
                : sameId(candidate['MetadataId'], metadataId as string),
        );
        if (!definition) {
            throw dataverseError(
                `Could not find relationship with ${describeMetadataKey('SchemaName', name, metadataId)}.`,
                DataverseErrorCode.ObjectDoesNotExist,
                '0x80040217',
            );
        }
        if (applyCasts([definition]).length === 0) throw resourceNotFound(casts.join('/'));
        return pickMetadataProperties(definition, select);
    }

    private findTableMetadata(nameOrId: string, byLogicalName: boolean) {
        if (byLogicalName) {
            const tableMetadata = this.store.getTableMetadata(nameOrId);
            if (tableMetadata) return tableMetadata;
        } else {
            const id = nameOrId.replace(/[{}]/g, '').toLowerCase();
            for (const name of this.store.getTableNames()) {
                const tableMetadata = this.store.getTableMetadata(name);
                if (sameId(tableMetadata?.MetadataId, id)) return tableMetadata as EntityMetadata;
            }
        }
        throw dataverseError(
            `Could not find entity with ${byLogicalName ? 'LogicalName' : 'MetadataId'} = '${nameOrId}'.`,
            DataverseErrorCode.ObjectDoesNotExist,
            '0x80040217',
        );
    }

    /**
     * Retrieves a table definition, as returned by `EntityDefinitions(LogicalName='<table>')`.
     * @param nameOrId The logical name, or the `MetadataId` when `byLogicalName` is `false`
     * @param select The properties to return. All the properties when missing.
     */
    getEntityDefinition(nameOrId: string, byLogicalName = true, select?: string[]): WebApiMetadata {
        return this.execute(() =>
            pickMetadataProperties(toWebApiEntityDefinition(this.findTableMetadata(nameOrId, byLogicalName)), select),
        );
    }

    /**
     * Retrieves the definitions of all the tables, as returned by `EntityDefinitions`.
     * @param select The properties to return. All the properties when missing.
     */
    getEntityDefinitions(select?: string[]): WebApiMetadata[] {
        return this.execute(() =>
            this.store.getTableNames().map((name) => this.getEntityDefinition(name, true, select)),
        );
    }

    /**
     * Retrieves metadata related to a table: the path after `EntityDefinitions(LogicalName='<table>')/`.
     * Supports the navigation properties `Attributes`, `Keys`, `OneToManyRelationships`, `ManyToOneRelationships`
     * and `ManyToManyRelationships`, and the `Privileges` property.
     * Items are addressed by `MetadataId`, by `LogicalName='<name>'` (columns and keys) or by `SchemaName='<name>'`
     * (relationships). Columns support casts such as `Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata`
     * and `/OptionSet`.
     * @returns A collection for a navigation property, a definition for an item
     */
    getRelatedMetadata(
        entityType: string,
        relatedPath: string,
        select?: string[],
    ): WebApiCollection<WebApiMetadata> | WebApiMetadata {
        return this.execute(() => {
            const tableMetadata = this.findTableMetadata(entityType, true);
            const { segment, key, rest } = splitSegment(relatedPath);
            if (segment === 'Privileges') {
                if (key !== undefined || rest !== undefined) throw resourceNotFound(relatedPath);
                return {
                    value: (tableMetadata.Privileges ?? []).map((privilege) =>
                        pickMetadataProperties(toWebApiPrivilege(privilege), select),
                    ),
                };
            }
            const items = this.getNavigationItems(tableMetadata, segment);
            const segments = rest ? rest.split('/') : [];

            if (key === undefined) {
                const value = castMetadataCollection(items, segment, segments);
                return { value: value.map((item) => pickMetadataProperties(item, select)) };
            }

            const item = findMetadataItem(items, segment, key, tableMetadata.LogicalName);
            return pickMetadataProperties(navigateMetadataItem(item, segment, segments), select);
        });
    }

    /**
     * Deletes a row.
     */
    deleteRecord(entityType: string, id: string): RecordReference {
        return this.execute(() => {
            const { row, entityMetadata } = this.store.GetRow(entityType, id);
            if (!entityMetadata) {
                throw entityDoesNotExist(entityType);
            }
            if (!row) {
                throw recordNotFound(entityType, id);
            }
            this.store.RemoveRow(entityType, id);
            return { entityType, id, name: row[entityMetadata.PrimaryNameAttribute || 'name'] };
        });
    }
}
