export class WebApiMock implements ComponentFramework.WebApi{
    createRecord(entityType: string, data: ComponentFramework.WebApi.Entity): Promise<ComponentFramework.LookupValue> {
        throw new Error("Method not implemented.");
    }
    deleteRecord(entityType: string, id: string): Promise<ComponentFramework.LookupValue> {
        throw new Error("Method not implemented.");
    }
    updateRecord(entityType: string, id: string, data: ComponentFramework.WebApi.Entity): Promise<ComponentFramework.LookupValue> {
        throw new Error("Method not implemented.");
    }
    retrieveMultipleRecords(entityType: string, options?: string, maxPageSize?: number): Promise<ComponentFramework.WebApi.RetrieveMultipleResponse> {
        throw new Error("Method not implemented.");
    }
    retrieveRecord(entityType: string, id: string, options?: string): Promise<ComponentFramework.WebApi.Entity> {
        throw new Error("Method not implemented.");
    }
}
