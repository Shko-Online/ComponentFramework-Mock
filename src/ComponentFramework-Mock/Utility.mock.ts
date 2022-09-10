import { SinonStub, stub } from "sinon";
export class UtilityMock implements ComponentFramework.Utility {
    getEntityMetadata: SinonStub<[entityName: string, attributes?: string[]], Promise<ComponentFramework.PropertyHelper.EntityMetadata>>;
    hasEntityPrivilege: SinonStub<[entityTypeName: string, privilegeType: ComponentFramework.PropertyHelper.Types.PrivilegeType, privilegeDepth: ComponentFramework.PropertyHelper.Types.PrivilegeDepth], boolean>;
    lookupObjects: SinonStub<[lookupOptions: ComponentFramework.UtilityApi.LookupOptions], Promise<ComponentFramework.LookupValue[]>>;
    constructor() {
        //to-do
    }
}
