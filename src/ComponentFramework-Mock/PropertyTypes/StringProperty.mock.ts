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

import { PropertyMock } from
    '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';
import { StringMetadataMock } from
    '@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/StringMetadata.mock';
import { SinonStub, stub } from 'sinon';

export class StringPropertyMock
    extends PropertyMock
    implements ComponentFramework.PropertyTypes.StringProperty {
    raw: string | null;
    attributes: StringMetadataMock;
    setValue: SinonStub<[value: string|null],void>;
    constructor(defaultValue?: string) {
        super();
        this.raw = defaultValue;
        this.attributes = new StringMetadataMock();
        this.setValue = stub();
        this.setValue.callsFake((value)=>{
            this.raw = value;
            this.formatted = value;
        })
    }
}