/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../../ShkoOnline';

import { stub } from 'sinon';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';
import { OptionMetadataMock, OptionSetMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';

export class OptionSetPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.OptionSetProperty {
    _SetValue: SinonStub<[value: number | null], void>;
    attributes: OptionSetMetadataMock;
    raw: number | null;

    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        const existingAttribute = entityMetadata.Attributes?.find(attribute => attribute.LogicalName === propertyName);
        if (existingAttribute && existingAttribute.AttributeType !== AttributeType.Picklist) {
            super(db, entityMetadata.LogicalName, `${propertyName}___${++MetadataDB.Collisions}`);
        } else {
            super(db, entityMetadata.LogicalName, propertyName);
        }
        this.raw = null;
        this.attributes = new OptionSetMetadataMock();
        this._SetValue = stub();
        this._SetValue.callsFake((value) => {
            this._db.UpdateValue<number | null>(value, this._boundTable, this._boundColumn, this._boundRow);
        });
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.PickListAttributeMetadata>(
                this._boundTable,
                this._boundColumn,
                this._boundRow,
            );
            if (attributeMetadata === null || attributeMetadata.AttributeType !== AttributeType.Picklist) {
                throw new Error('Type Error');
            }
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.Options = Object.getOwnPropertyNames(attributeMetadata.OptionSet.Options).map((value) => {
                const metadata = attributeMetadata.OptionSet.Options[value];
                return new OptionMetadataMock(metadata.Value, metadata.Label, metadata.Color);
            });
            this.attributes.DefaultValue = attributeMetadata.DefaultFormValue;
            this.raw = value;
        });
        if (!existingAttribute || existingAttribute.AttributeType !== AttributeType.Picklist) {
            const attribute = {
                AttributeType: AttributeType.Picklist,
                EntityLogicalName: entityMetadata.LogicalName,
                LogicalName: this._boundColumn,
            } as ShkoOnline.PickListAttributeMetadata;
            entityMetadata.Attributes?.push(attribute);
        }
    }
}
