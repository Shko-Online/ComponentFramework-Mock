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

import { SinonStub, stub } from 'sinon';
import { OptionMetadataMock, OptionSetMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';

export class OptionSetPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.OptionSetProperty {
    raw: number | null;
    attributes: OptionSetMetadataMock;

    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(db, entityMetadata.LogicalName, propertyName);
        this.raw = null;
        this.attributes = new OptionSetMetadataMock();
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.PickListAttributeMetadata>(
                this._boundTable,               
                this._boundColumn,
                this._boundRow,
            );
            if (attributeMetadata === null || attributeMetadata.AttributeType !== AttributeType.Picklist) {
                throw new Error('Type Error');
            }
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.Options = Object.getOwnPropertyNames(attributeMetadata.OptionSet.Options).map((value) => {
                const metadata = attributeMetadata.OptionSet.Options[value];
                return new OptionMetadataMock(metadata.Value, metadata.Label, metadata.Color);
            });
            this.attributes.DefaultValue = attributeMetadata.DefaultFormValue;
            this.raw = value;
        });
        const attribute = {
            AttributeType: AttributeType.Picklist,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.PickListAttributeMetadata;
        entityMetadata.Attributes?.push(attribute);
    }
}
