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

import { PropertyMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';
import { OptionSetMetadataMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/Metadata/OptionSetMetadata.mock';
import { SinonStub, stub } from 'sinon';
import { MetadataDB } from '@shko.online/componentframework-mock/ComponentFramework-Mock-Generator/Metadata.db';
import { OptionMetadataMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/Metadata/OptionMetadata.mock';
import { AttributeType } from '@shko.online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/AttributeType';

export class MultiSelectOptionSetPropertyMock
    extends PropertyMock
    implements ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty
{
    raw: number[] | null;
    originalRaw: number[] | null;
    attributes?: OptionSetMetadataMock;
    setValue: SinonStub<[value: number[] | null], void>;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super();
        this._db = db;
        this._Bind(entityMetadata.LogicalName, propertyName);
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.PickListAttributeMetadata>(
                this._boundTable,
                this._boundRow,
                this._boundColumn,
            );
            if (attributeMetadata.AttributeType !== AttributeType.Picklist) {
                throw new Error('Type Error');
            }
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.Options = Object.getOwnPropertyNames(attributeMetadata.OptionSet.Options).map((value) => {
                const metadata = attributeMetadata.OptionSet.Options[value];
                return new OptionMetadataMock(metadata.Value, metadata.Label, metadata.Color);
            });
            this.attributes.DefaultValue = attributeMetadata.DefaultFormValue;
            this.raw = value === null || value === undefined ? null : [...value];
            this.formatted = ((value as number[]) || [])
                .map((optionValue) => this.attributes.Options.find((option) => option.Value === optionValue).Label)
                .join(',');
        });
        const attribute = {
            AttributeType: AttributeType.Picklist,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.PickListAttributeMetadata; // ToDO: Find right metadata
        entityMetadata.Attributes.push(attribute);

        this.setValue = stub();
        this.setValue.callsFake((value) => {
            this.raw = value != null ? [...value] : null;
            this.originalRaw = value != null ? [...value] : null;
            if (this.attributes && value != null) {
                this.formatted = this.attributes.Options.filter((option) =>
                    value.some((selectedOption) => selectedOption === option.Value),
                )
                    .map((option) => option.Label)
                    .join(',');
            } else {
                this.formatted = '';
            }
        });
        this.attributes = new OptionSetMetadataMock();
    }
}
