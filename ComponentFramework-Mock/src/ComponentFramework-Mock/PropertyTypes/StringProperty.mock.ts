/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../ShkoOnline';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';
import { StringMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';

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
