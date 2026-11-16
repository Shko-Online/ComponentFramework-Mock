/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { ODataQuery } from '@shko.online/dataverse-odata';
import type { EntityMetadata } from '../Metadata.types';
import type { MetadataStore } from '../MetadataStore';
import type { WebApiEntity, WebApiPage, WireFormatter } from '../Wire';

import { parseOData } from '@shko.online/dataverse-odata';
import { AttributeType } from '../AttributeType';
import { DataverseErrorCode } from '../Errors';
import { getPage, MOCK_WEB_API_URL, pickWebApiProperties, toWebApiEntity } from '../Wire';

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
