/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';

import { stub } from 'sinon';
import { ODataQuery, parseOData } from '@shko.online/dataverse-odata';
import { MetadataDB } from '../ComponentFramework-Mock-Generator';
import { FormattingMock } from './Formatting.mock';
import { ShkoOnline } from '../ShkoOnline';
import { AttributeType } from './PropertyTypes';

export class WebApiMock implements ComponentFramework.WebApi {
    _Delay: number;
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

                    metadata.Attributes?.forEach(attribute=>{
                        if(attribute.AttributeOf || attribute.AttributeType === AttributeType.Virtual){
                            return;
                        }

                        const key = attribute.AttributeType === AttributeType.Lookup ? `_${attribute.LogicalName}_value` : attribute.LogicalName;

                        if(key in data){
                            db.UpdateValue(data[key], entityType, key, id);
                            console.log('updated ' + key);
                        }
                    })

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

                var entityMetadata = db.getTableMetadata(entityType);

                if (!entityMetadata) {
                    reject(`Table ${entityType} does not exist`);
                }

                if (parsed.fetchXml) {
                    var entities = db.SelectUsingFetchXml(parsed.fetchXml);
                    resolve({
                        entities,
                        nextLink: 'next'
                    });
                    return;
                }

                resolve({
                    entities: [],
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
                    const oldRow = result.row;
                    if (options) {
                        var parsed = parseOData(options);
                        if (parsed.$select) {
                            result.row = {};
                            parsed.$select.forEach((attribute) => {
                                result.row[attribute] = oldRow[attribute];
                            });
                        }
                    }
                    if (result.entityMetadata.Attributes) {
                        result.entityMetadata.Attributes.forEach((attribute) => {
                            const key = attribute.LogicalName;
                            if (
                                /* attribute.AttributeType === AttributeType.Uniqueidentifier ||*/
                                attribute.AttributeType === AttributeType.Boolean
                            ) {
                                if (result.row[key] === undefined || result.row[key] === null) {
                                    delete result.row[key];
                                }
                            } else if (attribute.AttributeType === AttributeType.Lookup) {
                                const key = `_${attribute.LogicalName}_value`;

                                const lookupValue = oldRow[key] as ComponentFramework.LookupValue;
                                if (key in result.row) {
                                    result.row[key] = lookupValue && lookupValue.id ? lookupValue.id : null;
                                    if (lookupValue && lookupValue.id) {
                                        result.row[`${key}@Microsoft.Dynamics.CRM.lookuplogicalname`] =
                                            lookupValue.entityType;
                                        if (lookupValue.name != null) {
                                            result.row[`${key}@OData.Community.Display.V1.FormattedValue`] =
                                                lookupValue.name;
                                        }
                                        if (oldRow[`${attribute.LogicalName}navigation`]) {
                                            result.row[`${key}@Microsoft.Dynamics.CRM.associatednavigationproperty`] =
                                                oldRow[`${attribute.LogicalName}navigation`];
                                        }
                                    }
                                }
                                delete result.row[`${attribute.LogicalName}type`];
                                delete result.row[`${attribute.LogicalName}navigation`];
                            } else if (attribute.AttributeType === AttributeType.DateTime) {
                                const dateValue = result.row[key] as Date;
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
                                    result.row[key] = `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}Z`;
                                    result.row[`${key}@OData.Community.Display.V1.FormattedValue`] = `${
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
                                    delete result.row[key];
                                }
                            } else if (
                                attribute.AttributeType === AttributeType.Integer ||
                                attribute.AttributeType === AttributeType.BigInt
                            ) {
                                if (result.row[key] !== null && result.row[key] !== undefined) {
                                    result.row[key + '@OData.Community.Display.V1.FormattedValue'] =
                                        formatting.formatInteger(result.row[key]);
                                }
                            }

                            if (!!attribute.AttributeOf) {
                                var original = result.entityMetadata.Attributes?.find(
                                    (att) => att.LogicalName == attribute.AttributeOf,
                                );
                                if (
                                    original?.AttributeType !== AttributeType.Lookup &&
                                    oldRow[original?.LogicalName as string] !== undefined &&
                                    oldRow[original?.LogicalName as string] !== null &&
                                    oldRow[key] !== null &&
                                    oldRow[key] !== undefined &&
                                    (original?.LogicalName as string) in result.row
                                ) {
                                    result.row[original?.LogicalName + '@OData.Community.Display.V1.FormattedValue'] =
                                        oldRow[key];
                                }
                                delete result.row[key];
                            }
                        });
                    }

                    Object.getOwnPropertyNames(result.row).forEach((key) => {
                        if (result.row[key] === undefined) {
                            result.row[key] = null;
                        }
                    });
                    resolve(result.row);
                }, this._Delay);
            });
        });
    }
}
