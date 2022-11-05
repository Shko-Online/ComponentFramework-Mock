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

import { stub, SinonStub } from 'sinon';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';
import { LookupMetadataMock } from '../Metadata';
import { PropertyMock } from './Property.mock';
import { AttributeType } from './AttributeType';

export class LookupPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.LookupProperty {
    raw: ComponentFramework.LookupValue[];
    getTargetEntityType: SinonStub<[], string>;
    getViewId: SinonStub<[], string>;
    setValue: SinonStub<[value: ComponentFramework.LookupValue[]], void>;
    attributes?: LookupMetadataMock;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super();
        this._db = db;
        this._Bind(entityMetadata.LogicalName, propertyName);
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.LookupAttributeMetadata>(
                this._boundTable,
                this._boundRow,
                this._boundColumn,
            );
            if (attributeMetadata.AttributeType !== AttributeType.Lookup) {
                throw new Error('Type Error');
            }
            this.attributes = new LookupMetadataMock();
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.Targets = attributeMetadata.Targets;
            this.raw = [value];
        });
        const attribute = {
            AttributeType: AttributeType.Lookup,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.LookupAttributeMetadata;
        entityMetadata.Attributes.push(attribute);

        this.getTargetEntityType = stub();
        this.getTargetEntityType.returns('mocked_entity');
        this.getViewId = stub();
        this.getViewId.returns('00000000-0000-0000-0000-000000000000');
        this.setValue = stub();
        this.setValue.callsFake((value) => {
            this.raw = value;
            this.formatted = value?.map((lookup) => lookup.name).join(',');
        });
    }
}
