/*
    Unless explicitly acquired and licensed from Licensor under another
    license, the contents of this file are subject to the Reciprocal Public
    License ("RPL") Version 1.5, or subsequent versions as allowed by the RPL,
    and You may not copy or use this file in either source code or executable
    form, except in compliance with the terms and conditions of the RPL.

    All software distributed under the RPL is provided strictly on an "AS
    IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND
    LICENSOR HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT
    LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
    PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT. See the RPL for specific
    language governing rights and limitations under the RPL. 
*/

import { SinonStub } from 'sinon';
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
