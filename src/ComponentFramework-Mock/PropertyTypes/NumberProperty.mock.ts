/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../../ShkoOnline';

import { stub } from 'sinon';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';
import { NumberMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';

export class NumberPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.NumberProperty {
    _SetValue: SinonStub<[value: number | null], void>;
    attributes?: NumberMetadataMock;
    raw: number | null;
    constructor(db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata, propertyName: string, skipMetadata: boolean = false) {
        const existingAttribute = entityMetadata.Attributes?.find(attribute => attribute.LogicalName === propertyName);
        if (!skipMetadata && existingAttribute && existingAttribute.AttributeType !== AttributeType.Decimal) {
            super(db, entityMetadata.LogicalName, `${propertyName}___${++MetadataDB.Collisions}`);
        } else {
            super(db, entityMetadata.LogicalName, propertyName);
        }
        this.raw = null;
        this._SetValue = stub();
        this._SetValue.callsFake((value) => {
            this._db.UpdateValue<number | null>(value, this._boundTable, this._boundColumn, this._boundRow);
        });
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

        if (!skipMetadata && (!existingAttribute || existingAttribute.AttributeType !== AttributeType.Decimal)) {
            const attribute = {
                AttributeType: AttributeType.Decimal,
                EntityLogicalName: entityMetadata.LogicalName,
                LogicalName: this._boundColumn,
            } as ShkoOnline.NumberAttributeMetadata;
            entityMetadata.Attributes?.push(attribute);
        }
    }
}
