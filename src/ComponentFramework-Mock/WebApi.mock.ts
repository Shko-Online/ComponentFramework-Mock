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

        this.deleteRecord = stub();

        this.updateRecord = stub();

        this.retrieveMultipleRecords = stub();

        this.retrieveRecord = stub();

    }
}
