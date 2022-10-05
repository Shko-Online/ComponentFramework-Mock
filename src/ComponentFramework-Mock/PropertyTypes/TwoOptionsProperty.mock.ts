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

import { PropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';
import { TwoOptionMetadataMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/TwoOptionMetadata.mock';
import { SinonStub, stub } from 'sinon';
import { MetadataDB } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/Metadata.db';

import { OptionMetadataMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/OptionMetadata.mock';
export class TwoOptionsPropertyMock
    extends PropertyMock
    implements ComponentFramework.PropertyTypes.TwoOptionsProperty
{
    boundTableName: string;
    boundRowId: string;
    boundColumn: string;
    db: MetadataDB;

    raw: boolean;
    attributes?: TwoOptionMetadataMock;
    setValue: SinonStub<[value: boolean], void>;
    constructor(defaultValue?: boolean) {
        super();

        this.raw = defaultValue;
        this.attributes = new TwoOptionMetadataMock();
        this.setValue = stub();
        this.setValue.callsFake((value) => {
            this.raw = value;
            if (this.attributes) {
                this.formatted = this.attributes.Options[value ? 1 : 0].Label;
            } else {
                this.formatted = '' + value;
            }
        });
    }
    Bind(columnName: string) {
        this.boundColumn = columnName;
        const { value, attributeMetadata } = this.db.RefreshValue<ShkoOnline.BooleanAttributeMetadata>(
            this.boundTableName,
            this.boundRowId,
            columnName,
        );
        if (attributeMetadata.AttributeType != ShkoOnline.AttributeType.Boolean) {
            throw new Error('Type Error');
        }
        this.attributes.LogicalName = attributeMetadata.LogicalName;
        this.attributes.DefaultValue = attributeMetadata.DefaultFormValue;
        this.attributes.DisplayName = attributeMetadata.DisplayName;
        this.attributes.Options[1] = new OptionMetadataMock(
            attributeMetadata.OptionSet.TrueOption.Value,
            attributeMetadata.OptionSet.TrueOption.Label.UserLocalizedLabel.Label,
            attributeMetadata.OptionSet.TrueOption.Color,
        );
        this.attributes.Options[0] = new OptionMetadataMock(
            attributeMetadata.OptionSet.FalseOption.Value,
            attributeMetadata.OptionSet.FalseOption.Label.UserLocalizedLabel.Label,
            attributeMetadata.OptionSet.FalseOption.Color,
        );
		this.raw = value;
    }
}
