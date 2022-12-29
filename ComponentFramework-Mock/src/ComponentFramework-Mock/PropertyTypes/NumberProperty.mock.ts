/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../ShkoOnline';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';
import { NumberMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';

export class NumberPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.NumberProperty {
    attributes?: NumberMetadataMock;
    raw: number | null;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(db, entityMetadata.LogicalName, propertyName);
        this.raw = null;
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.NumberAttributeMetadata>(
                this._boundTable,
                this._boundColumn,
                this._boundRow,
            );
            if (
                !(
                    attributeMetadata.AttributeType === AttributeType.Integer ||
                    attributeMetadata.AttributeType === AttributeType.BigInt ||
                    attributeMetadata.AttributeType === AttributeType.Decimal ||
                    attributeMetadata.AttributeType === AttributeType.Double
                )
            ) {
                throw new Error('Type Error');
            }
            this.attributes = new NumberMetadataMock();
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.DisplayName = attributeMetadata.DisplayName;
            this.attributes.MaxValue = attributeMetadata.MaxValue;
            this.attributes.MinValue = attributeMetadata.MinValue;
            this.raw = value;
            this.formatted = value === null || value === undefined ? '' : '' + value;
        });
        const attribute = {
            AttributeType: AttributeType.Decimal,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.NumberAttributeMetadata;
        entityMetadata.Attributes?.push(attribute);
    }
}
