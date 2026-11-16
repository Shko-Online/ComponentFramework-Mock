/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { MetadataDB } from '../ComponentFramework-Mock-Generator';
import type { FormattingMock } from './Formatting.mock';
import type { ShkoOnline } from '../ShkoOnline';

import { stub } from 'sinon';
import { DelayedPromise } from '../utils/DelayedPromise';
import { DataverseWebApi } from '../ComponentFramework-Mock-Generator/Metadata.db/Api/DataverseWebApi';
import { toWebApiEntity } from '../ComponentFramework-Mock-Generator/Metadata.db/Wire';

/**
 * Mock of the PCF `context.webAPI`, backed by the in-memory {@link MetadataDB}.
 */
export class WebApiMock implements ComponentFramework.WebApi {
    _Delay: number = 200;
    /**
     * Converts a row of the database to the Web API shape, in place.
     */
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
            const entity = toWebApiEntity(row, entityMetadata, formatting);
            Object.keys(row).forEach((key) => delete row[key]);
            Object.assign(row, entity);
        });

        const api = new DataverseWebApi(db, {
            // Goes through the stub so that overrides of _ConvertRowToOData keep working
            serialize: (row, entityMetadata) => {
                this._ConvertRowToOData(row, entityMetadata);
                return row;
            },
        });

        /** Runs the operation now and settles the promise after the delay */
        const settleAfterDelay = <T>(operation: () => T) => {
            try {
                return DelayedPromise.resolveAfterDelay<T>(operation(), this._Delay);
            } catch (e) {
                return DelayedPromise.rejectAfterDelay<T>(e, this._Delay);
            }
        };

        /** Runs the operation after the delay */
        const runAfterDelay = <T>(operation: () => T) =>
            new Promise<T>((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(operation());
                    } catch (e) {
                        reject(e);
                    }
                }, this._Delay);
            });

        this.createRecord = stub();
        this.createRecord.callsFake((entityType: string, data: ComponentFramework.WebApi.Entity) =>
            settleAfterDelay<ComponentFramework.LookupValue>(() => api.createRecord(entityType, data)),
        );

        this.deleteRecord = stub();
        this.deleteRecord.callsFake((entityType: string, id: string) =>
            runAfterDelay<ComponentFramework.LookupValue>(() => api.deleteRecord(entityType, id)),
        );

        this.updateRecord = stub();
        this.updateRecord.callsFake((entityType: string, id: string, data: ComponentFramework.WebApi.Entity) =>
            settleAfterDelay<ComponentFramework.LookupValue>(() => api.updateRecord(entityType, id, data)),
        );

        this.retrieveMultipleRecords = stub();
        this.retrieveMultipleRecords.callsFake(
            (entityType: string, options?: string, maxPageSize?: number) =>
                new Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>((resolve, reject) => {
                    try {
                        resolve(
                            api.retrieveMultipleRecords(
                                entityType,
                                options,
                                maxPageSize,
                            ) as ComponentFramework.WebApi.RetrieveMultipleResponse,
                        );
                    } catch (e) {
                        reject(e);
                    }
                }),
        );

        this.retrieveRecord = stub();
        this.retrieveRecord.callsFake((entityType: string, id: string, options?: string) =>
            runAfterDelay<ComponentFramework.WebApi.Entity>(() => api.retrieveRecord(entityType, id, options)),
        );
    }
}
