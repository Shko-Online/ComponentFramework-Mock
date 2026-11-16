/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { MetadataStore } from '../ComponentFramework-Mock-Generator/Metadata.db/MetadataStore';
import type { DataverseWebApiOptions } from '../ComponentFramework-Mock-Generator/Metadata.db/Api/DataverseWebApi';
import type { WebApiEntity } from '../ComponentFramework-Mock-Generator/Metadata.db/Wire';

import { stub } from 'sinon';
import {
    DataverseWebApi,
    getDataverseErrorCode,
} from '../ComponentFramework-Mock-Generator/Metadata.db/Api/DataverseWebApi';
import { DataverseErrorCode } from '../ComponentFramework-Mock-Generator/Metadata.db/Errors';

/**
 * The error `Xrm.WebApi` rejects with.
 */
export interface XrmError {
    /** The Dataverse error code, e.g. `0x80040217` (2147746327) when the row does not exist */
    errorCode: number;
    message: string;
}

/**
 * Converts an error raised by the store to the shape used by `Xrm.WebApi`.
 */
export const toXrmError = (error: unknown): XrmError => ({
    errorCode: getDataverseErrorCode(error),
    message:
        error && typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : String(error),
});

/**
 * The object returned by `createRecord`, `updateRecord` and `deleteRecord`.
 */
export interface XrmRecordReference {
    entityType: string;
    id: string;
    /** Returned by `deleteRecord` only (deprecated by Microsoft) */
    name?: string;
}

export interface XrmRetrieveMultipleResult {
    entities: WebApiEntity[];
    /** Set only when there are more records */
    nextLink?: string;
}

type CreateRecord = SinonStub<[entityLogicalName: string, record: WebApiEntity], Promise<XrmRecordReference>>;
type DeleteRecord = SinonStub<[entityLogicalName: string, id: string], Promise<XrmRecordReference>>;
type RetrieveRecord = SinonStub<[entityLogicalName: string, id: string, options?: string], Promise<WebApiEntity>>;
type RetrieveMultipleRecords = SinonStub<
    [entityLogicalName: string, options?: string, maxPageSize?: number],
    Promise<XrmRetrieveMultipleResult>
>;
type UpdateRecord = SinonStub<[entityLogicalName: string, id: string, data: WebApiEntity], Promise<XrmRecordReference>>;

export interface XrmWebApiOnlineMock {
    createRecord: CreateRecord;
    deleteRecord: DeleteRecord;
    retrieveRecord: RetrieveRecord;
    retrieveMultipleRecords: RetrieveMultipleRecords;
    updateRecord: UpdateRecord;
    /**
     * Executes an action or a function. Not implemented: stub it with `execute.callsFake(...)`.
     */
    execute: SinonStub<[request: any], Promise<any>>;
    /**
     * Executes a batch of requests. Not implemented: stub it with `executeMultiple.callsFake(...)`.
     */
    executeMultiple: SinonStub<[requests: any[]], Promise<any[]>>;
}

/**
 * Mock of `Xrm.WebApi`, backed by an in-memory {@link MetadataStore}.
 * Use it to test model-driven form scripts, ribbon commands and web resources.
 *
 * Every operation runs after `_Delay` milliseconds. Failures reject with an {@link XrmError}: `{ errorCode, message }`.
 * All methods are sinon stubs, so they can be inspected or overridden.
 */
export class XrmWebApiMock {
    _Delay: number = 200;
    createRecord: CreateRecord;
    deleteRecord: DeleteRecord;
    retrieveRecord: RetrieveRecord;
    retrieveMultipleRecords: RetrieveMultipleRecords;
    updateRecord: UpdateRecord;
    isAvailableOffline: SinonStub<[entityLogicalName: string], boolean>;
    online: XrmWebApiOnlineMock;
    offline: Omit<XrmWebApiOnlineMock, 'execute' | 'executeMultiple'>;

    constructor(store: MetadataStore, options?: DataverseWebApiOptions) {
        const api = new DataverseWebApi(store, options);

        const runAfterDelay = <T>(operation: () => T) =>
            new Promise<T>((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(operation());
                    } catch (e) {
                        reject(toXrmError(e));
                    }
                }, this._Delay);
            });

        this.createRecord = stub();
        this.createRecord.callsFake((entityLogicalName, record) =>
            runAfterDelay(() => {
                const { entityType, id } = api.createRecord(entityLogicalName, record);
                return { entityType, id };
            }),
        );

        this.deleteRecord = stub();
        this.deleteRecord.callsFake((entityLogicalName, id) =>
            runAfterDelay(() => api.deleteRecord(entityLogicalName, id)),
        );

        this.retrieveRecord = stub();
        this.retrieveRecord.callsFake((entityLogicalName, id, options) =>
            runAfterDelay(() => api.retrieveRecord(entityLogicalName, id, options)),
        );

        this.retrieveMultipleRecords = stub();
        this.retrieveMultipleRecords.callsFake((entityLogicalName, options, maxPageSize) =>
            runAfterDelay(() => api.retrieveMultipleRecords(entityLogicalName, options, maxPageSize)),
        );

        this.updateRecord = stub();
        this.updateRecord.callsFake((entityLogicalName, id, data) =>
            runAfterDelay(() => {
                const { entityType, id: updatedId } = api.updateRecord(entityLogicalName, id, data);
                return { entityType, id: updatedId };
            }),
        );

        this.isAvailableOffline = stub();
        this.isAvailableOffline.returns(false);

        const notSupported = (method: string) => () =>
            Promise.reject<never>({
                errorCode: DataverseErrorCode.Unexpected,
                message: `Xrm.WebApi.online.${method} is not supported by the mock. Stub it with ${method}.callsFake(...)`,
            } as XrmError);
        const execute: XrmWebApiOnlineMock['execute'] = stub();
        execute.callsFake(notSupported('execute'));
        const executeMultiple: XrmWebApiOnlineMock['executeMultiple'] = stub();
        executeMultiple.callsFake(notSupported('executeMultiple'));

        // online and offline share the stubs of the top level methods
        const crud = {
            createRecord: this.createRecord,
            deleteRecord: this.deleteRecord,
            retrieveRecord: this.retrieveRecord,
            retrieveMultipleRecords: this.retrieveMultipleRecords,
            updateRecord: this.updateRecord,
        };
        this.online = { ...crud, execute, executeMultiple };
        this.offline = { ...crud };
    }
}
