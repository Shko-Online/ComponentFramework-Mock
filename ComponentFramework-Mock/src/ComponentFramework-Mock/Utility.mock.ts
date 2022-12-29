/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { stub } from 'sinon';
import type { SinonStub }from 'sinon';
export class UtilityMock implements ComponentFramework.Utility {
    getEntityMetadata: SinonStub<[entityName: string, attributes?: string[]], Promise<ShkoOnline.EntityMetadata>>;
    hasEntityPrivilege: SinonStub<
        [
            entityTypeName: string,
            privilegeType: ComponentFramework.PropertyHelper.Types.PrivilegeType,
            privilegeDepth: ComponentFramework.PropertyHelper.Types.PrivilegeDepth,
        ],
        boolean
    >;
    lookupObjects: SinonStub<
        [lookupOptions: ComponentFramework.UtilityApi.LookupOptions],
        Promise<ComponentFramework.LookupValue[]>
    >;
    constructor() {
        this.getEntityMetadata = stub();
        this.hasEntityPrivilege = stub();
        this.hasEntityPrivilege.callsFake(
            (
                entityTypeName: string,
                privilegeType: ComponentFramework.PropertyHelper.Types.PrivilegeType,
                privilegeDepth: ComponentFramework.PropertyHelper.Types.PrivilegeDepth,
            ) => {
                return true;
            },
        );

        this.lookupObjects = stub();
        this.lookupObjects.callsFake((lookupOptions: ComponentFramework.UtilityApi.LookupOptions) => {
            return new Promise<ComponentFramework.LookupValue[]>((resolve) => {
                resolve([
                    {
                        entityType: lookupOptions.entityTypes ? lookupOptions.entityTypes[0] : 'mocked_entity',
                        id: '00000000-0000-0000-0000-000000000001',
                        name: 'Fake Lookup Result',
                    },
                ]);
            });
        });
    }
}
