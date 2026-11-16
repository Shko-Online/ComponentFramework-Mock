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
import { getPage, pickWebApiProperties, toWebApiEntity } from '../ComponentFramework-Mock-Generator/Metadata.db/Wire';

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
            // Converts in place, so overrides of this stub keep working
            const entity = toWebApiEntity(row, entityMetadata, formatting);
            Object.keys(row).forEach((key) => delete row[key]);
            Object.assign(row, entity);
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
                        : db.SelectUsingOData(entityMetadata, parsed);

                    entities.forEach((row) => {
                        this._ConvertRowToOData(row, entityMetadata);
                    });

                    resolve(
                        (fetchXml
                            ? { entities }
                            : getPage(
                                  entities,
                                  entityMetadata.EntitySetName || entityMetadata.LogicalName,
                                  options,
                                  maxPageSize,
                              )) as ComponentFramework.WebApi.RetrieveMultipleResponse,
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
                    const result = db.GetRow(entityType, id);
                    if (!result.entityMetadata) {
                        return reject({ message: `Entity ${entityType} does not exist.` });
                    }
                    if (!result.row) {
                        return reject({
                            message: `Could not find record with id: '${id}' for entity: '${entityType}'.`,
                        });
                    }
                    const entity: ComponentFramework.WebApi.Entity = result.row;
                    this._ConvertRowToOData(entity, result.entityMetadata);
                    const select = options ? parseOData(options).$select : undefined;
                    resolve(
                        select
                            ? pickWebApiProperties(entity, select, result.entityMetadata.PrimaryIdAttribute)
                            : entity,
                    );
                }, this._Delay);
            });
        });
    }
}
