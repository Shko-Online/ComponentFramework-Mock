/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { ODataQuery } from '@shko.online/dataverse-odata';
import type { EntityMetadata } from '../Metadata.types';
import type { MetadataStore } from '../MetadataStore';
import type { WebApiEntity, WebApiMetadata, WebApiPage, WireFormatter } from '../Wire';

import { parseOData } from '@shko.online/dataverse-odata';
import { AttributeType } from '../AttributeType';
import { DataverseErrorCode } from '../Errors';
import {
    getPage,
    MOCK_WEB_API_URL,
    pickMetadataProperties,
    pickWebApiProperties,
    toWebApiAttributeDefinition,
    toWebApiEntity,
    toWebApiEntityDefinition,
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

/** Splits `Segment(key)/rest` */
const splitSegment = (path: string) => {
    const match = /^([^/()]+)(?:\(([^)]*)\))?(?:\/(.*))?$/.exec(path);
    if (!match) {
        throw dataverseError(`Invalid path '${path}'.`, DataverseErrorCode.InvalidRequest, '0x80060888');
    }
    return { segment: match[1], key: match[2] as string | undefined, rest: match[3] as string | undefined };
};

/** Reads `LogicalName='x'` or a GUID key */
const parseMetadataKey = (key: string) => {
    const logicalName = /^LogicalName='([^']*)'$/.exec(key);
    if (logicalName) return { logicalName: logicalName[1] };
    if (GUID.test(key)) return { metadataId: key.replace(/[{}]/g, '').toLowerCase() };
    throw dataverseError(`Invalid key '${key}'.`, DataverseErrorCode.InvalidRequest, '0x80060888');
};

const sameId = (a: string | undefined, b: string) => !!a && a.replace(/[{}]/g, '').toLowerCase() === b;

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
        if (typeof code === 'string' && /^0x[0-9a-f]+$/i.test(code)) return parseInt(code, 16);
    }
    return DataverseErrorCode.Unexpected;
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
    return dataverseError(String(e), DataverseErrorCode.Unexpected);
};

/**
 * The operations of the Dataverse Web API executed against a {@link MetadataStore}.
 * Synchronous and framework agnostic: the PCF `WebApi`, `Xrm.WebApi` and other mocks wrap it
 * with their promises, delays and return types.
 * Every method throws a {@link DataverseError} on failure.
 */
export class DataverseWebApi {
    private store: MetadataStore;
    private options: DataverseWebApiOptions;

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
            const storedQueryTable = parsed.userQuery ? 'userquery' : parsed.savedQuery ? 'savedquery' : undefined;
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
            if (!GUID.test(key)) throw notSupported(`The key '${key}'`);
            if (rest !== undefined) throw notSupported(`The navigation '${rest}'`);
            return this.retrieveRecord(tableMetadata.LogicalName, key.replace(/[{}]/g, ''), query || undefined);
        });
    }

    private getMetadata(key: string | undefined, rest: string | undefined, query: string) {
        const params = new URLSearchParams(query);
        const unsupported: string[] = [];
        params.forEach((_value, name) => {
            if (name !== '$select' && name !== '$expand') unsupported.push(name);
        });
        if (unsupported.length > 0) {
            throw notSupported(`${unsupported.join(', ')} on EntityDefinitions`);
        }
        const select = params.get('$select')?.split(',');
        // $expand=Attributes and $expand=OptionSet are always honored: keep them when selecting
        const expand = params.get('$expand')?.split(',') ?? [];
        const selectWithExpand = select ? [...select, ...expand.map((e) => e.split('(')[0])] : undefined;

        if (key === undefined) {
            if (rest !== undefined) throw resourceNotFound(rest);
            return { value: this.getEntityDefinitions(selectWithExpand) };
        }
        const { logicalName, metadataId } = parseMetadataKey(key);
        const tableMetadata = this.findTableMetadata((logicalName ?? metadataId) as string, logicalName !== undefined);
        if (rest !== undefined) {
            return this.getRelatedMetadata(tableMetadata.LogicalName, rest, selectWithExpand);
        }
        const definition = pickMetadataProperties(toWebApiEntityDefinition(tableMetadata), selectWithExpand);
        if (expand.some((e) => e.split('(')[0] === 'Attributes')) {
            definition['Attributes'] = (
                this.getRelatedMetadata(tableMetadata.LogicalName, 'Attributes') as WebApiCollection<WebApiMetadata>
            ).value;
        }
        return definition;
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
     * Supports `Attributes`, `Attributes(LogicalName='<column>')` or `Attributes(<MetadataId>)`,
     * casts such as `Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata` and `/OptionSet`.
     * @returns A collection for `Attributes`, a definition otherwise
     */
    getRelatedMetadata(
        entityType: string,
        relatedPath: string,
        select?: string[],
    ): WebApiCollection<WebApiMetadata> | WebApiMetadata {
        return this.execute(() => {
            const tableMetadata = this.findTableMetadata(entityType, true);
            const { segment, key, rest } = splitSegment(relatedPath);
            if (segment !== 'Attributes') {
                throw notSupported(`EntityDefinitions/${segment}`);
            }
            const segments = rest ? rest.split('/') : [];
            const attributes = (tableMetadata.Attributes ?? []).map((attribute) =>
                toWebApiAttributeDefinition(attribute, tableMetadata.LogicalName),
            );

            if (key === undefined) {
                let value = attributes;
                segments.forEach((cast) => {
                    if (!cast.startsWith(ODATA_TYPE_PREFIX)) throw resourceNotFound(cast);
                    value = value.filter((attribute) => attribute['@odata.type'] === '#' + cast);
                });
                return { value: value.map((attribute) => pickMetadataProperties(attribute, select)) };
            }

            const { logicalName, metadataId } = parseMetadataKey(key);
            let result: WebApiMetadata | undefined = attributes.find((attribute) =>
                logicalName !== undefined
                    ? attribute['LogicalName'] === logicalName
                    : sameId(attribute['MetadataId'], metadataId as string),
            );
            if (!result) {
                throw dataverseError(
                    `Could not find attribute with ${logicalName !== undefined ? `LogicalName = '${logicalName}'` : `MetadataId = '${metadataId}'`} on entity '${tableMetadata.LogicalName}'.`,
                    DataverseErrorCode.ObjectDoesNotExist,
                    '0x80040217',
                );
            }
            for (const part of segments) {
                if (part.startsWith(ODATA_TYPE_PREFIX)) {
                    if (result['@odata.type'] !== '#' + part) throw resourceNotFound(part);
                } else if (part === 'OptionSet' && result['OptionSet']) {
                    result = result['OptionSet'] as WebApiMetadata;
                } else {
                    throw resourceNotFound(part);
                }
            }
            return pickMetadataProperties(result, select);
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
