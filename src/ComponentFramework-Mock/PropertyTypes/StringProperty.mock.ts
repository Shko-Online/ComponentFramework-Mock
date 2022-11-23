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

import { StringMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';

export class StringPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.StringProperty {
    raw: string | null;
    attributes: StringMetadataMock;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(db, entityMetadata.LogicalName, propertyName);
        this.raw = null;
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.StringAttributeMetadata>(
                this._boundTable,             
                this._boundColumn,
                this._boundRow,
            );
            if (attributeMetadata.AttributeType !== AttributeType.String) {
                throw new Error('Type Error');
            }
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.DisplayName = attributeMetadata.DisplayName;
            this.attributes.MaxLength = attributeMetadata.MaxLength;
            this.attributes.Format = attributeMetadata.Format;
            this.attributes.ImeMode = attributeMetadata.ImeMode;
            this.raw = value;
        });
        const attribute = {
            AttributeType: AttributeType.String,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.StringAttributeMetadata;
        entityMetadata.Attributes?.push(attribute);
        this.attributes = new StringMetadataMock();
    }
}
