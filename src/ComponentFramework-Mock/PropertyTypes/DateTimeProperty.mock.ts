/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { PropertyMock } from './Property.mock';
import { AttributeType } from './AttributeType';
import { DateTimeMetadataMock } from '../Metadata/DateTimeMetadata.mock';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator/Metadata.db';

export class DateTimePropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.DateTimeProperty {
    raw: Date | null;
    attributes?: DateTimeMetadataMock;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(db, entityMetadata.LogicalName, propertyName);
        this.raw = null;
        const attribute = {
            AttributeType: AttributeType.DateTime,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.DateTimeAttributeMetadata;
        entityMetadata.Attributes?.push(attribute);
        this.attributes = new DateTimeMetadataMock();
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
