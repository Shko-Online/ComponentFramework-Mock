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

import { NumberMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';

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
