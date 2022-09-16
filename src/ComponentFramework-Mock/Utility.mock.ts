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
export class UtilityMock implements ComponentFramework.Utility {
    getEntityMetadata: SinonStub<[entityName: string, attributes?: string[]], Promise<ComponentFramework.PropertyHelper.EntityMetadata>>;
    hasEntityPrivilege: SinonStub<[entityTypeName: string, privilegeType: ComponentFramework.PropertyHelper.Types.PrivilegeType, privilegeDepth: ComponentFramework.PropertyHelper.Types.PrivilegeDepth], boolean>;
    lookupObjects: SinonStub<[lookupOptions: ComponentFramework.UtilityApi.LookupOptions], Promise<ComponentFramework.LookupValue[]>>;
    constructor() {
        this.getEntityMetadata = stub();
        this.getEntityMetadata.callsFake((entityName: string, attributes?: string[]) =>{
            return new Promise<ComponentFramework.PropertyHelper.EntityMetadata>((resolve)=>{

                resolve({
                    [""] :  []
                })
            })
        })
        
        this.hasEntityPrivilege = stub();
        this.hasEntityPrivilege.callsFake((entityTypeName: string, privilegeType: ComponentFramework.PropertyHelper.Types.PrivilegeType, privilegeDepth: ComponentFramework.PropertyHelper.Types.PrivilegeDepth)=>{
            return true;
        })

        this.lookupObjects = stub();
        this.lookupObjects.callsFake((lookupOptions: ComponentFramework.UtilityApi.LookupOptions) => {
            return new Promise<ComponentFramework.LookupValue[]>((resolve) => {
                resolve([{
                    entityType: lookupOptions.entityTypes ? lookupOptions.entityTypes[0] : 'mocked_entity',
                    id: "00000000-0000-0000-0000-000000000001",
                    name: "Fake Lookup Result"
                }])
            });
        })
    }
}
