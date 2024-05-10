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

export class WebApiMock implements ComponentFramework.WebApi {
    _Delay: number;
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
        this._Delay = 200;
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
                            row[key] = lookupValue && lookupValue.id ? lookupValue.id : null;
                            if (lookupValue && lookupValue.id) {
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
                        var original = entityMetadata.Attributes?.find(
                            (att) => att.LogicalName == attribute.AttributeOf,
                        );
                        if (
                            original?.AttributeType !== AttributeType.Lookup &&
                            oldRow[original?.LogicalName as string] !== undefined &&
                            oldRow[original?.LogicalName as string] !== null &&
                            oldRow[key] !== null &&
                            oldRow[key] !== undefined &&
                            (original?.LogicalName as string) in row
                        ) {
                            row[original?.LogicalName + '@OData.Community.Display.V1.FormattedValue'] = oldRow[key];
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
            return new Promise<ComponentFramework.LookupValue>((resolve, reject) => {
                setTimeout(() => {
                    const metadata = db.getTableMetadata(entityType);
                    if (!metadata) {
                        return reject({ message: `Entity ${entityType} does not exist.` });
                    }
                    resolve({
                        id: db.AddRow(entityType, data, metadata) || '',
                        name: data[metadata.PrimaryNameAttribute || 'name'],
                        entityType: entityType,
                    });
                }, this._Delay);
            });
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
            return new Promise<ComponentFramework.LookupValue>((resolve, reject) => {
                setTimeout(() => {
                    const metadata = db.getTableMetadata(entityType);
                    if (!metadata) {
                        return reject({ message: `Entity ${entityType} does not exist.` });
                    }

                    metadata.Attributes?.forEach((attribute) => {
                        if (attribute.AttributeOf || attribute.AttributeType === AttributeType.Virtual) {
                            return;
                        }

                        const key =
                            attribute.AttributeType === AttributeType.Lookup
                                ? `_${attribute.LogicalName}_value`
                                : attribute.LogicalName;

                        if (key in data) {
                            db.UpdateValue(data[key], entityType, key, id);
                        }
                    });

                    var result = db.GetRow(entityType, id);

                    resolve({
                        id,
                        name: result.row?.[metadata.PrimaryNameAttribute || 'name'],
                        entityType,
                    });
                }, this._Delay);
            });
        });

        this.retrieveMultipleRecords = stub();
        this.retrieveMultipleRecords.callsFake((entityType: string, options?: string, maxPageSize?: number) => {
            return new Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>((resolve, reject) => {
                const parsed = options ? parseOData(options) : ({} as ODataQuery);

                if (parsed.error) {
                    reject(parsed.error);
                }

                const entityMetadata = db.getTableMetadata(entityType);

                if (!entityMetadata) {
                    reject(`Table ${entityType} does not exist`);
                    return;
                }

                if (parsed.userQuery) {
                    const userQuery = db.GetRow('userquery', parsed.userQuery);
                    if (!userQuery.row) {
                        reject({
                            code: '0x80040217',
                            message: `Entity 'userquery' With Id = ${parsed.userQuery} Does Not Exist`,
                        });
                        return;
                    }

                    if (userQuery.row['returnedtypecode'] !== entityMetadata.LogicalName) {
                        reject({
                            code: '0x80060888',
                            message: 'No Query View exists with the Given Query Id on the Entity Set.',
                        });
                        return;
                    }

                    const parsedUserQuery = parseOData('?fetchXml=' + encodeURIComponent(userQuery.row['fetchxml']));
                    if (!parsedUserQuery.fetchXml) {
                        throw new Error(`User Query with id ${parsed.userQuery} contains wrong data`);
                    }
                    const entities = db.SelectUsingFetchXml(parsedUserQuery.fetchXml);
                    resolve({
                        entities,
                        nextLink: 'next',
                    });
                    return;
                }

                if (parsed.savedQuery) {
                    const savedQuery = db.GetRow('savedquery', parsed.savedQuery);
                    if (!savedQuery.row) {
                        reject({
                            code: '0x80040217',
                            message: `Entity 'savedquery' With Id = ${parsed.savedQuery} Does Not Exist`,
                        });
                        return;
                    }

                    if (savedQuery.row['returnedtypecode'] !== entityMetadata.LogicalName) {
                        reject({
                            code: '0x80060888',
                            message: 'No Query View exists with the Given Query Id on the Entity Set.',
                        });
                        return;
                    }

                    const parsedSavedQuery = parseOData('?fetchXml=' + encodeURIComponent(savedQuery.row['fetchxml']));
                    if (!parsedSavedQuery.fetchXml) {
                        throw new Error(`Saved Query with id ${parsed.savedQuery} contains wrong data`);
                    }
                    const entities = db.SelectUsingFetchXml(parsedSavedQuery.fetchXml);
                    resolve({
                        entities,
                        nextLink: 'next',
                    });
                    return;
                }

                if (parsed.fetchXml) {
                    const entities = db.SelectUsingFetchXml(parsed.fetchXml);
                    resolve({
                        entities,
                        nextLink: 'next',
                    });
                    return;
                }

                const entities = db.SelectUsingOData(entityMetadata, parsed) as any[];

                entities.forEach((row) => {
                    this._ConvertRowToOData(row, entityMetadata);
                });

                resolve({
                    entities,
                    nextLink: 'string',
                });
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
                            parsed.$select.forEach((attribute) => {
                                result.row[attribute] = oldRow[attribute];
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
