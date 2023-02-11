/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';

import { stub } from 'sinon';
import { parseOData } from '@shko.online/dataverse-odata'
import { MetadataDB } from '../ComponentFramework-Mock-Generator';

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
    constructor(db: MetadataDB) {
        this._Delay = 200;
        this.createRecord = stub();
        this.createRecord.callsFake((entityType: string, data: ComponentFramework.WebApi.Entity) => {
            return new Promise<ComponentFramework.LookupValue>((resolve) => {
                resolve({
                    id: '00000000-0000-0000-0000-000000000001',
                    name: 'Any',
                    entityType: 'any',
                });
            });
        });
        this.deleteRecord = stub();
        this.deleteRecord.callsFake((entityType: string, id: string) => {
            return new Promise<ComponentFramework.LookupValue>((resolve) => {
                resolve({
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'Any',
                    entityType: 'any',
                });
            });
        });
        this.updateRecord = stub();
        this.updateRecord.callsFake((entityType: string, id: string, data: ComponentFramework.WebApi.Entity) => {
            return new Promise<ComponentFramework.LookupValue>((resolve) => {
                resolve({
                    id: '00000000-0000-0000-0000-000000000000',
                    name: 'Any',
                    entityType: 'any',
                });
            });
        });

        this.retrieveMultipleRecords = stub();
        this.retrieveMultipleRecords.callsFake((entityType: string, options?: string, maxPageSize?: number) => {
            return new Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>((resolve) => {
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
                    if(options){
                       var parsed = parseOData(options);
                       if(parsed.$select){
                       const oldRow = result.row;
                       result.row = {};
                       parsed.$select.forEach(attribute=>{
                        result.row[attribute] = oldRow[attribute];
                       })
                       }
                    }
                    resolve(result.row);
                }, this._Delay);
            });
        });
    }
}
