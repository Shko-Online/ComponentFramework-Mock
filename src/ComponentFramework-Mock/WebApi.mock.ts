/*
    Unless explicitly acquired and licensed from Licensor under another
    license, the contents of this file are subject to the Reciprocal Public
    License ("RPL") Version 1.5, or subsequent versions as allowed by the RPL,
    and You may not copy or use this file in either source code or executable
    form, except in compliance with the terms and conditions of the RPL.

    All software distributed under the RPL is provided strictly on an "AS
    IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND
    LICENSOR HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT
    LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
    PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT. See the RPL for specific
    language governing rights and limitations under the RPL. 
*/

import { SinonStub, stub } from "sinon";

export class WebApiMock implements ComponentFramework.WebApi {
    createRecord: SinonStub<[entityType: string, data: ComponentFramework.WebApi.Entity], Promise<ComponentFramework.LookupValue>>;
    deleteRecord: SinonStub<[entityType: string, id: string], Promise<ComponentFramework.LookupValue>>;
    updateRecord: SinonStub<[entityType: string, id: string, data: ComponentFramework.WebApi.Entity], Promise<ComponentFramework.LookupValue>>;
    retrieveMultipleRecords: SinonStub<[entityType: string, options?: string, maxPageSize?: number], Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>>;
    retrieveRecord: SinonStub<[entityType: string, id: string, options?: string], Promise<ComponentFramework.WebApi.Entity>>;
    constructor() {
        this.createRecord = stub();
        this.createRecord.callsFake((entityType: string, data: ComponentFramework.WebApi.Entity) => {
            return new Promise<ComponentFramework.LookupValue>((resolve) => {
                resolve({
                    id: "00000000-0000-0000-0000-000000000000",
                    name: "Any",
                    entityType: "any"
                })
            })
        })
        this.deleteRecord = stub();
        this.deleteRecord.callsFake((entityType: string, id: string) => {
            return new Promise<ComponentFramework.LookupValue>((resolve) => {
                resolve({
                    id: "00000000-0000-0000-0000-000000000000",
                    name: "Any",
                    entityType: "any"
                })
            })
        })
        this.updateRecord = stub();
        this.updateRecord.callsFake((entityType: string, id: string, data: ComponentFramework.WebApi.Entity) => {
            return new Promise<ComponentFramework.LookupValue>((resolve) => {
                resolve({
                    id: "00000000-0000-0000-0000-000000000000",
                    name: "Any",
                    entityType: "any"
                })
            })
        })

        this.retrieveMultipleRecords = stub();
        this.retrieveMultipleRecords.callsFake((entityType: string, options?: string, maxPageSize?: number) => {
            return new Promise<ComponentFramework.WebApi.RetrieveMultipleResponse>((resolve) => {
                resolve({
                    entities: [],
                    nextLink: "string"
                })
            })
        })
        this.retrieveRecord = stub();
        this.retrieveRecord.callsFake((entityType: string, id: string, options?: string) => {
            return new Promise<ComponentFramework.WebApi.Entity>((resolve) => {
                resolve({
                    [""]: []
                })
            })
        })

    }
}
