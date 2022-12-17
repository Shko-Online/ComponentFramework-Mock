/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { SinonStub, stub } from 'sinon';

export class WebApiMock implements ComponentFramework.WebApi {
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
    constructor() {
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
            return new Promise<ComponentFramework.WebApi.Entity>((resolve) => {
                resolve({
                    ['']: [],
                });
            });
        });
    }
}
