/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../../ShkoOnline';

import { stub } from 'sinon';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';
import { DateTimeMetadataMock } from '../Metadata/DateTimeMetadata.mock';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator/Metadata.db/Metadata.db';

export class DateTimePropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.DateTimeProperty {
    _SetValue: SinonStub<[value: Date | null], void>;
    attributes?: DateTimeMetadataMock;
    raw: Date | null;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        const existingAttribute = entityMetadata.Attributes?.find(
            (attribute) => attribute.LogicalName === propertyName,
        );
        if (existingAttribute && existingAttribute.AttributeType !== AttributeType.DateTime) {
            super(db, entityMetadata.LogicalName, `${propertyName}___${++MetadataDB.Collisions}`);
        } else {
            super(db, entityMetadata.LogicalName, propertyName);
        }
        this.type = 'DateAndTime.DateAndTime';
        this.raw = null;
        if (!existingAttribute || existingAttribute.AttributeType !== AttributeType.DateTime) {
            const attribute = {
                AttributeType: AttributeType.DateTime,
                EntityLogicalName: entityMetadata.LogicalName,
                LogicalName: this._boundColumn,
            } as ShkoOnline.DateTimeAttributeMetadata;
            entityMetadata.Attributes?.push(attribute);
        }
        this.attributes = new DateTimeMetadataMock();
        this._SetValue = stub();
        this._SetValue.callsFake((value) => {
            this._db.UpdateValue<Date | null>(value, this._boundTable, this._boundColumn, this._boundRow);
        });
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.DateTimeAttributeMetadata>(
                this._boundTable,
                this._boundColumn,
                this._boundRow,
            );
            if (attributeMetadata.AttributeType !== AttributeType.DateTime) {
                throw new Error('Type Error');
            }
            this.attributes = new DateTimeMetadataMock();
            this.attributes.Behavior = attributeMetadata.Behaviour;
            this.attributes.Description = attributeMetadata.Description?.UserLocalizedLabel?.Label;
            this.attributes.Format = attributeMetadata.Format;
            this.attributes.ImeMode = attributeMetadata.ImeMode;
            this.attributes.IsSecured = attributeMetadata.IsSecured;
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.RequiredLevel = attributeMetadata.RequiredLevel?.Value;
            this.attributes.SourceType = attributeMetadata.SourceType;
            this.raw = value;
            this.formatted = value?.toLocaleTimeString(); //ToDo: Format date
        });
    }
}
