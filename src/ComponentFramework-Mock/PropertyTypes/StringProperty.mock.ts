/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../../ShkoOnline';

import { stub } from 'sinon';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';
import { StringMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';

export class StringPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.StringProperty {
    _SetValue: SinonStub<[value: string | null], void>;
    attributes: StringMetadataMock;
    raw: string | null;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        const existingAttribute = entityMetadata.Attributes?.find(
            (attribute) => attribute.LogicalName === propertyName,
        );
        if (existingAttribute && existingAttribute.AttributeType !== AttributeType.String) {
            super(db, entityMetadata.LogicalName, `${propertyName}___${++MetadataDB.Collisions}`);
        } else {
            super(db, entityMetadata.LogicalName, propertyName);
        }
        this.type = 'SingleLine.Text';
        this.raw = null;
        this._SetValue = stub();
        this._SetValue.callsFake((value) => {
            this._db.UpdateValue<string | null>(value, this._boundTable, this._boundColumn, this._boundRow);
        });
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
        if (!existingAttribute || existingAttribute.AttributeType !== AttributeType.String) {
            const attribute = {
                AttributeType: AttributeType.String,
                EntityLogicalName: entityMetadata.LogicalName,
                LogicalName: this._boundColumn,
            } as ShkoOnline.StringAttributeMetadata;
            entityMetadata.Attributes?.push(attribute);
        }
        this.attributes = new StringMetadataMock();
    }
}
