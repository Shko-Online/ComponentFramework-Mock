/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';

import { stub } from 'sinon';
import { ODataQuery, parseOData } from '@shko.online/dataverse-odata';
import { MetadataDB } from '../ComponentFramework-Mock-Generator';
import { FormattingMock } from './Formatting.mock';
import { AttributeType } from './PropertyTypes';
import { ShkoOnline } from '../ShkoOnline';
import { DelayedPromise } from '../utils/DelayedPromise';

const MOCK_WEB_API_URL = 'https://localhost/api/data/v9.2/';
const DEFAULT_PAGE_SIZE = 5000;

/**
 * Returns the page requested by the `$skiptoken` in `options`.
 * `nextLink` is set only when there are more records, the same way Dataverse does.
 * The query part of `nextLink` can be passed back as `options` to get the next page.
 */
const getPage = (
    entities: ComponentFramework.WebApi.Entity[],
    entityMetadata: ShkoOnline.EntityMetadata,
    options?: string,
    maxPageSize?: number,
): ComponentFramework.WebApi.RetrieveMultipleResponse => {
    const params = new URLSearchParams(options ?? '');
    const skip = Math.max(parseInt(params.get('$skiptoken') ?? '0', 10) || 0, 0);
    const pageSize = maxPageSize && maxPageSize > 0 ? maxPageSize : DEFAULT_PAGE_SIZE;
    let nextLink: string | undefined;
    if (skip + pageSize < entities.length) {
        params.set('$skiptoken', String(skip + pageSize));
        nextLink = `${MOCK_WEB_API_URL}${entityMetadata.EntitySetName || entityMetadata.LogicalName}?${params.toString()}`;
    }
    return { entities: entities.slice(skip, skip + pageSize), nextLink: nextLink as string };
};

export class WebApiMock implements ComponentFramework.WebApi {
    _Delay: number = 200;
    _ConvertRowToOData: SinonStub<[row: any, entityMetadata: ShkoOnline.EntityMetadata], void>;
    createRecord: SinonStub<
        [entityType: string, data: ComponentFramework.WebApi.Entity],
        Promise<ComponentFramework.LookupValue>
    >;
    deleteRecord: SinonStub<[entityType: string, id: string], Promise<ComponentFramework.LookupValue>>;
    updateRecord: SinonStub<
        [entityType: string, id: string, data: ComponentFramework.WebApi.Entity],
        Promise<ComponentFramework.LookupValue>
    >;
    retrieveMultipleRecords: SinonStub<
        [entityType: string, options?: string, maxPageSize?: number],
        Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>
    >;
    retrieveRecord: SinonStub<
        [entityType: string, id: string, options?: string],
        Promise<ComponentFramework.WebApi.Entity>
    >;
    constructor(db: MetadataDB, formatting: FormattingMock) {
        this._ConvertRowToOData = stub();
        this._ConvertRowToOData.callsFake((row: any, entityMetadata: ShkoOnline.EntityMetadata) => {
            const oldRow = row;
            if (entityMetadata.Attributes) {
                entityMetadata.Attributes.forEach((attribute) => {
                    const key = attribute.LogicalName;
                    if (
                        /* attribute.AttributeType === AttributeType.Uniqueidentifier ||*/
                        attribute.AttributeType === AttributeType.Boolean
                    ) {
                        if (row[key] === undefined || row[key] === null) {
                            delete row[key];
                        }
                    } else if (attribute.AttributeType === AttributeType.Lookup) {
                        const key = `_${attribute.LogicalName}_value`;

                        const lookupValue = oldRow[key] as ComponentFramework.LookupValue;
                        if (key in row) {
                            row[key] = lookupValue?.id ?? null;
                            if (lookupValue?.id) {
                                row[`${key}@Microsoft.Dynamics.CRM.lookuplogicalname`] = lookupValue.entityType;
                                if (lookupValue.name != null) {
                                    row[`${key}@OData.Community.Display.V1.FormattedValue`] = lookupValue.name;
                                }
                                if (oldRow[`${attribute.LogicalName}navigation`]) {
                                    row[`${key}@Microsoft.Dynamics.CRM.associatednavigationproperty`] =
                                        oldRow[`${attribute.LogicalName}navigation`];
                                }
                            }
                        }
                        delete row[`${attribute.LogicalName}type`];
                        delete row[`${attribute.LogicalName}navigation`];
                    } else if (attribute.AttributeType === AttributeType.DateTime) {
                        const dateValue = row[key] as Date;
                        if (dateValue) {
                            const YYYY = dateValue.getFullYear();
                            let MM = '0' + (dateValue.getMonth() + 1);
                            MM = MM.substring(MM.length - 2);
                            let DD = '0' + dateValue.getDate();
                            DD = DD.substring(DD.length - 2);
                            let HH = '0' + dateValue.getUTCHours();
                            HH = HH.substring(HH.length - 2);
                            let mm = '0' + dateValue.getMinutes();
                            mm = mm.substring(mm.length - 2);
                            let ss = '0' + dateValue.getSeconds();
                            ss = ss.substring(ss.length - 2);
                            row[key] = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}Z`;
                            row[`${key}@OData.Community.Display.V1.FormattedValue`] = `${
                                dateValue.getUTCMonth() + 1
                            }/${dateValue.getUTCDate()}/${dateValue.getUTCFullYear()} ${
                                ((dateValue.getUTCHours() - 1) % 12) + 1
                            }:${dateValue.getUTCMinutes()} ${
                                dateValue.getUTCHours() > 12 ||
                                (dateValue.getUTCHours() == 12 && dateValue.getMinutes() > 0)
                                    ? 'PM'
                                    : 'AM'
                            }`;
                        } else {
                            delete row[key];
                        }
                    } else if (
                        attribute.AttributeType === AttributeType.Integer ||
                        attribute.AttributeType === AttributeType.BigInt
                    ) {
                        if (row[key] !== null && row[key] !== undefined) {
                            row[key + '@OData.Community.Display.V1.FormattedValue'] = formatting.formatInteger(
                                row[key],
                            );
                        }
                    }

                    if (!!attribute.AttributeOf) {
                        const original = entityMetadata.Attributes?.find(
                            (att) => att.LogicalName == attribute.AttributeOf,
                        );
                        if (
                            original?.AttributeType !== AttributeType.Lookup &&
                            oldRow[original?.LogicalName ?? ''] !== undefined &&
                            oldRow[original?.LogicalName ?? ''] !== null &&
                            oldRow[key] !== null &&
                            oldRow[key] !== undefined &&
                            original?.LogicalName! in row
                        ) {
                            row[original?.LogicalName! + '@OData.Community.Display.V1.FormattedValue'] = oldRow[key];
                        }
                        delete row[key];
                    }
                });
            }

            Object.getOwnPropertyNames(row).forEach((key) => {
                if (row[key] === undefined) {
                    row[key] = null;
                }
            });
        });

        this.createRecord = stub();
        this.createRecord.callsFake((entityType: string, data: ComponentFramework.WebApi.Entity) => {
            const metadata = db.getTableMetadata(entityType);
            if (!metadata) {
                return DelayedPromise.rejectAfterDelay<ComponentFramework.LookupValue>(
                    { message: `Entity ${entityType} does not exist.` },
                    this._Delay,
                );
            }

            let id: string;
            try {
                id = db.AddRow(entityType, data, metadata) || '';
            } catch (e) {
                return DelayedPromise.rejectAfterDelay<ComponentFramework.LookupValue>(
                    { message: (e as Error).message },
                    this._Delay,
                );
            }

            return DelayedPromise.resolveAfterDelay<ComponentFramework.LookupValue>(
                {
                    id,
                    name: data[metadata.PrimaryNameAttribute || 'name'],
                    entityType: entityType,
                },
                this._Delay,
            );
        });

        this.deleteRecord = stub();
        this.deleteRecord.callsFake((entityType: string, id: string) => {
            return new Promise<ComponentFramework.LookupValue>((resolve, reject) => {
                setTimeout(() => {
                    const result = db.GetRow(entityType, id);
                    if (!result.entityMetadata) {
                        return reject({ message: `Entity ${entityType} does not exist.` });
                    }
                    if (!result.row) {
                        return reject({
                            message: `Could not find record with id: '${id}' for entity: '${entityType}'.`,
                        });
                    }
                    db.RemoveRow(entityType, id);
                    resolve({
                        id,
                        name: result.row?.[result.entityMetadata.PrimaryNameAttribute || 'name'],
                        entityType,
                    });
                }, this._Delay);
            });
        });
        this.updateRecord = stub();
        this.updateRecord.callsFake((entityType: string, id: string, data: ComponentFramework.WebApi.Entity) => {
            const attributeHandler = (attribute: ShkoOnline.AttributeMetadata) => {
                if (attribute.AttributeOf || attribute.AttributeType === AttributeType.Virtual) {
                    return;
                }

                if (attribute.AttributeType === AttributeType.Lookup) {
                    // Supports `<navigation>@odata.bind`, `_<logicalname>_value` and LookupValue objects
                    const lookup = db.getLookupFromItem(data, attribute.LogicalName);
                    if (lookup !== undefined) {
                        db.UpdateValue(lookup, entityType, attribute.LogicalName, id);
                    }
                } else if (attribute.LogicalName in data) {
                    db.UpdateValue(data[attribute.LogicalName], entityType, attribute.LogicalName, id);
                }
            };

            const metadata = db.getTableMetadata(entityType);
            if (!metadata) {
                return DelayedPromise.rejectAfterDelay<ComponentFramework.LookupValue>(
                    { message: `Entity ${entityType} does not exist.` },
                    this._Delay,
                );
            }
            if (!db.GetRow(entityType, id).row) {
                return DelayedPromise.rejectAfterDelay<ComponentFramework.LookupValue>(
                    { message: `Could not find record with id: '${id}' for entity: '${entityType}'.` },
                    this._Delay,
                );
            }
            try {
                metadata.Attributes?.forEach(attributeHandler);
            } catch (e) {
                return DelayedPromise.rejectAfterDelay<ComponentFramework.LookupValue>(
                    { message: (e as Error).message },
                    this._Delay,
                );
            }
            const result = db.GetRow(entityType, id);

            return DelayedPromise.resolveAfterDelay<ComponentFramework.LookupValue>(
                {
                    id,
                    name: result.row?.[metadata.PrimaryNameAttribute || 'name'],
                    entityType,
                },
                this._Delay,
            );
        });

        this.retrieveMultipleRecords = stub();
        this.retrieveMultipleRecords.callsFake((entityType: string, options?: string, maxPageSize?: number) => {
            return new Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>((resolve, reject) => {
                const parsed = options ? parseOData(options) : ({} as ODataQuery);

                if (parsed.error) {
                    reject(parsed.error);
                    return;
                }

                const entityMetadata = db.getTableMetadata(entityType);

                if (!entityMetadata) {
                    reject({ message: `Entity ${entityType} does not exist.` });
                    return;
                }

                try {
                    let fetchXml = parsed.fetchXml;
                    const storedQueryTable = parsed.userQuery
                        ? 'userquery'
                        : parsed.savedQuery
                          ? 'savedquery'
                          : undefined;
                    if (storedQueryTable) {
                        const queryId = (parsed.userQuery ?? parsed.savedQuery) as string;
                        const storedQuery = db.GetRow(storedQueryTable, queryId);
                        if (!storedQuery.row) {
                            reject({
                                code: '0x80040217',
                                message: `Entity '${storedQueryTable}' With Id = ${queryId} Does Not Exist`,
                            });
                            return;
                        }

                        if (storedQuery.row['returnedtypecode'] !== entityMetadata.LogicalName) {
                            reject({
                                code: '0x80060888',
                                message: 'No Query View exists with the Given Query Id on the Entity Set.',
                            });
                            return;
                        }

                        fetchXml = parseOData('?fetchXml=' + encodeURIComponent(storedQuery.row['fetchxml'])).fetchXml;
                        if (!fetchXml) {
                            reject({ message: `Entity '${storedQueryTable}' with id ${queryId} contains wrong data` });
                            return;
                        }
                    }

                    // FetchXML paging works with paging cookies, the Web API doesn't return a nextLink
                    const entities = fetchXml
                        ? db.SelectUsingFetchXml(fetchXml)
                        : (db.SelectUsingOData(entityMetadata, parsed) as ComponentFramework.WebApi.Entity[]);

                    entities.forEach((row) => {
                        this._ConvertRowToOData(row, entityMetadata);
                    });

                    resolve(
                        fetchXml
                            ? { entities, nextLink: undefined as unknown as string }
                            : getPage(entities, entityMetadata, options, maxPageSize),
                    );
                } catch (e) {
                    reject({ message: (e as Error).message });
                }
            });
        });
        this.retrieveRecord = stub();
        this.retrieveRecord.callsFake((entityType: string, id: string, options?: string) => {
            return new Promise<ComponentFramework.WebApi.Entity>((resolve, reject) => {
                setTimeout(() => {
                    const result = db.GetRowForAPI(entityType, id);
                    if (!result.entityMetadata) {
                        return reject({ message: `Entity ${entityType} does not exist.` });
                    }
                    if (!result.row) {
                        return reject({
                            message: `Could not find record with id: '${id}' for entity: '${entityType}'.`,
                        });
                    }
                    if (options) {
                        var parsed = parseOData(options);
                        if (parsed.$select) {
                            const oldRow = result.row;
                            result.row = {};
                            const copy = (key: string) => {
                                if (key in oldRow) result.row[key] = oldRow[key];
                            };
                            parsed.$select.forEach((attribute) => {
                                result.row[attribute] = oldRow[attribute];
                                // Keep the hidden columns used to build the annotations
                                const logicalName = /^_(.+)_value$/.exec(attribute)?.[1] ?? attribute;
                                copy(logicalName + 'navigation');
                                result.entityMetadata?.Attributes?.filter(
                                    (attr) =>
                                        attr.AttributeOf === logicalName && attr.LogicalName === logicalName + 'name',
                                ).forEach((attr) => copy(attr.LogicalName));
                            });
                            if (
                                result.entityMetadata.PrimaryIdAttribute !== undefined &&
                                !parsed.$select.includes(result.entityMetadata.PrimaryIdAttribute)
                            ) {
                                result.row[result.entityMetadata.PrimaryIdAttribute] =
                                    oldRow[result.entityMetadata.PrimaryIdAttribute];
                            }
                        }
                    }
                    this._ConvertRowToOData(result.row, result.entityMetadata);
                    resolve(result.row);
                }, this._Delay);
            });
        });
    }
}
