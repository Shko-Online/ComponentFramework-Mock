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

import { MetadataDB } from '../../ComponentFramework-Mock-Generator';
import { WholeNumberMetadataMock } from '../Metadata';
import { AttributeType } from './AttributeType';
import { NumberPropertyMock } from './NumberProperty.mock';

export class WholeNumberPropertyMock
    extends NumberPropertyMock
    implements ComponentFramework.PropertyTypes.WholeNumberProperty
{
    attributes?: WholeNumberMetadataMock;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(propertyName, db, entityMetadata);
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
        const attribute = {
            AttributeType: AttributeType.Integer,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.IntegerNumberAttributeMetadata;
        entityMetadata.Attributes?.push(attribute);
    }
}
