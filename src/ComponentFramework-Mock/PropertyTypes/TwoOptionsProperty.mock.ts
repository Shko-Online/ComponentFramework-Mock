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
import { OptionMetadataMock, TwoOptionMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator/Metadata.db';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';

export class TwoOptionsPropertyMock
    extends PropertyMock
    implements ComponentFramework.PropertyTypes.TwoOptionsProperty
{
    raw: boolean;
    attributes?: TwoOptionMetadataMock;
    setValue: SinonStub<[value: boolean], void>;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super();
        this.attributes = new TwoOptionMetadataMock();
        this._db = db;
        this._Bind(entityMetadata.LogicalName, propertyName);
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.BooleanAttributeMetadata>(
                this._boundTable,
                this._boundRow,
                this._boundColumn,
            );
            if (attributeMetadata.AttributeType !== AttributeType.Boolean) {
                throw new Error('Type Error');
            }
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.DefaultValue = attributeMetadata.DefaultFormValue;
            this.attributes.DisplayName = attributeMetadata.DisplayName;
            this.attributes.Options[1] = new OptionMetadataMock(
                attributeMetadata.OptionSet.TrueOption.Value,
                attributeMetadata.OptionSet.TrueOption.Label,
                attributeMetadata.OptionSet.TrueOption.Color,
            );
            this.attributes.Options[0] = new OptionMetadataMock(
                attributeMetadata.OptionSet.FalseOption.Value,
                attributeMetadata.OptionSet.FalseOption.Label,
                attributeMetadata.OptionSet.FalseOption.Color,
            );
            this.raw = value;
            this.formatted = this.attributes.Options[value ? 1 : 0].Label;
        });
        const attribute = {
            AttributeType: AttributeType.Boolean,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
            OptionSet: {
                FalseOption: {
                    Value: 0,
                    Label: 'No',
                },
                TrueOption: {
                    Value: 1,
                    Label: 'Yes',
                },
            },
        } as ShkoOnline.BooleanAttributeMetadata;
        entityMetadata.Attributes.push(attribute);

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
}
