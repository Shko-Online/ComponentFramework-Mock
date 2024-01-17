/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../ShkoOnline';
import { AttributeType } from './AttributeType';
import { NumberPropertyMock } from './NumberProperty.mock';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';
import { WholeNumberMetadataMock } from '../Metadata';

export class WholeNumberPropertyMock
    extends NumberPropertyMock
    implements ComponentFramework.PropertyTypes.WholeNumberProperty {
    attributes?: WholeNumberMetadataMock;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        const existingAttribute = entityMetadata.Attributes?.find(attribute => attribute.LogicalName === propertyName);
        if (existingAttribute && existingAttribute.AttributeType !== AttributeType.Integer) {
            super(db, entityMetadata, `${propertyName}___${++MetadataDB.Collisions}`, true);
        } else {
            super(db, entityMetadata, propertyName, true);
        }
        this._db = db;
        this._Bind(entityMetadata.LogicalName, propertyName);
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } =
                this._db.GetValueAndMetadata<ShkoOnline.IntegerNumberAttributeMetadata>(
                    this._boundTable,
                    this._boundColumn,
                    this._boundRow,
                );
            if (
                attributeMetadata.AttributeType !== AttributeType.Integer &&
                attributeMetadata.AttributeType !== AttributeType.Decimal &&
                attributeMetadata.AttributeType !== AttributeType.Double &&
                attributeMetadata.AttributeType !== AttributeType.BigInt
            ) {
                //ToDo: Fix AutoMetadata generation
                throw new Error('Type Error');
            }
            this.attributes = new WholeNumberMetadataMock();
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.MaxValue = attributeMetadata.MaxValue;
            this.attributes.MinValue = attributeMetadata.MinValue;
            this.attributes.Format = attributeMetadata.Format;
            this.raw = value;
            this.formatted = value === undefined || value === null ? '' : '' + value;
        });
        if (!existingAttribute || existingAttribute.AttributeType !== AttributeType.Integer) {
            const attribute = {
                AttributeType: AttributeType.Integer,
                EntityLogicalName: entityMetadata.LogicalName,
                LogicalName: this._boundColumn,
            } as ShkoOnline.IntegerNumberAttributeMetadata;
            entityMetadata.Attributes?.push(attribute);
        }
    }
}
