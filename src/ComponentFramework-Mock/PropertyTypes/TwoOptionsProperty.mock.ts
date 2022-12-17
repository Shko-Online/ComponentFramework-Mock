/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

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
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(db, entityMetadata.LogicalName, propertyName);
        this.raw = false;
        this.attributes = new TwoOptionMetadataMock();
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.BooleanAttributeMetadata>(
                this._boundTable,
                this._boundColumn,
                this._boundRow,
            );
            if (attributeMetadata ===null || attributeMetadata.AttributeType !== AttributeType.Boolean) {
                throw new Error('Type Error');
            }
            const attributes = new TwoOptionMetadataMock();
            attributes.LogicalName = attributeMetadata.LogicalName;
            attributes.DefaultValue = attributeMetadata.DefaultFormValue;
            attributes.DisplayName = attributeMetadata.DisplayName;
            attributes.Options[1] = new OptionMetadataMock(
                attributeMetadata.OptionSet.TrueOption.Value,
                attributeMetadata.OptionSet.TrueOption.Label,
                attributeMetadata.OptionSet.TrueOption.Color||undefined,
            );
            attributes.Options[0] = new OptionMetadataMock(
                attributeMetadata.OptionSet.FalseOption.Value,
                attributeMetadata.OptionSet.FalseOption.Label,
                attributeMetadata.OptionSet.FalseOption.Color||undefined,
            );
            this.raw = value;
            this.formatted = attributes.Options[value ? 1 : 0].Label;
            this.attributes = attributes;
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
        entityMetadata.Attributes?.push(attribute);
    }
}
