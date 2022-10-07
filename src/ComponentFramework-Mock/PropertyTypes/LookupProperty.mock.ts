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

import { MetadataDB } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/Metadata.db';
import { stub, SinonStub } from 'sinon';
import { LookupMetadataMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/LookupMetadata.mock';
import { PropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';

export class LookupPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.LookupProperty {
    boundTableName: string;
    boundRowId: string;
    boundColumn: string;
    db: MetadataDB;

    raw: ComponentFramework.LookupValue[];
    getTargetEntityType: SinonStub<[], string>;
    getViewId: SinonStub<[], string>;
    setValue: SinonStub<[value: ComponentFramework.LookupValue[]], void>;
    attributes?: LookupMetadataMock;
    constructor() {
        super();
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
    Bind(columnName) {
        this.boundColumn = columnName;
        const { value, attributeMetadata } = this.db.RefreshValue<ShkoOnline.LookupAttributeMetadata>(
            this.boundTableName,
            this.boundRowId,
            columnName,
        );
        if (attributeMetadata.AttributeType !== ShkoOnline.AttributeType.Lookup) {
            throw new Error('Type Error');
        }
        this.attributes.LogicalName = attributeMetadata.LogicalName;
        this.attributes.Targets = attributeMetadata.Targets;
        this.raw = value;
    }
}
