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
