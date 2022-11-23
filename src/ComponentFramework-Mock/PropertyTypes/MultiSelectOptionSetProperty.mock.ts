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

import { PropertyMock } from './Property.mock';
import { OptionMetadataMock, OptionSetMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';
import { AttributeType } from './AttributeType';

export class MultiSelectOptionSetPropertyMock
    extends PropertyMock
    implements ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty
{
    raw: number[] | null;
    attributes?: OptionSetMetadataMock;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(db,entityMetadata.LogicalName, propertyName);      
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.PickListAttributeMetadata>(
                this._boundTable,               
                this._boundColumn,
                this._boundRow,
            );
            if (attributeMetadata === null || attributeMetadata.AttributeType !== AttributeType.Picklist) {
                throw new Error('Type Error');
            }
            const attributes = new OptionSetMetadataMock();
            attributes.LogicalName = attributeMetadata.LogicalName;
            attributes.Options = Object.getOwnPropertyNames(attributeMetadata.OptionSet.Options).map((value) => {
                const metadata = attributeMetadata.OptionSet.Options[value];
                return new OptionMetadataMock(metadata.Value, metadata.Label, metadata.Color);
            });
            attributes.DefaultValue = attributeMetadata.DefaultFormValue;
            this.raw = value === null || value === undefined ? null : [...value];
            this.formatted = ((value as number[]) || [])
                .map((optionValue) => attributes.Options.find((option) => option.Value === optionValue)?.Label)
                .join(',');
            this.attributes = attributes;
        });
        const attribute = {
            AttributeType: AttributeType.Picklist,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.PickListAttributeMetadata; // ToDO: Find right metadata
        entityMetadata.Attributes?.push(attribute);
        this.attributes = new OptionSetMetadataMock();
        this.raw = null;
    }
}
