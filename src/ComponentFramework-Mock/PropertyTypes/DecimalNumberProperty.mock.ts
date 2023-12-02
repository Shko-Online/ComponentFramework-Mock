/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../ShkoOnline';

import { AttributeType } from './AttributeType';
import { NumberPropertyMock } from './NumberProperty.mock';
import { DecimalNumberMetadataMock } from '../Metadata/DecimalNumberMetadata.mock';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator/Metadata.db';

export class DecimalNumberPropertyMock
    extends NumberPropertyMock
    implements ComponentFramework.PropertyTypes.DecimalNumberProperty
{
    attributes?: DecimalNumberMetadataMock;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(propertyName, db, entityMetadata);       
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } =
                this._db.GetValueAndMetadata<ShkoOnline.DecimalNumberAttributeMetadata>(
                    this._boundTable,                  
                    this._boundColumn,
                    this._boundRow,
                );
            if (attributeMetadata.AttributeType !== AttributeType.Decimal) {
                throw new Error('Type Error');
            }
            this.attributes = new DecimalNumberMetadataMock();
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.Precision = attributeMetadata.Precision;
            this.attributes.MaxValue = attributeMetadata.MaxValue;
            this.attributes.MinValue = attributeMetadata.MinValue;
            this.attributes.ImeMode = attributeMetadata.ImeMode;
            this.raw = value;
        });
        const attribute = {
            AttributeType: AttributeType.Decimal,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.DecimalNumberAttributeMetadata;
        if (!entityMetadata.Attributes?.some((att) => att.LogicalName === propertyName)) {
            entityMetadata.Attributes?.push(attribute);
        }
    }
}
