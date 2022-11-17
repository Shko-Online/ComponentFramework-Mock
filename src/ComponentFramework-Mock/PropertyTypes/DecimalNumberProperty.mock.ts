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

import { SinonStub, stub } from 'sinon';
import { AttributeType } from './AttributeType';
import { NumberPropertyMock } from './NumberProperty.mock';
import { DecimalNumberMetadataMock } from '../Metadata/DecimalNumberMetadata.mock';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator/Metadata.db';

export class DecimalNumberPropertyMock
    extends NumberPropertyMock
    implements ComponentFramework.PropertyTypes.DecimalNumberProperty
{
    attributes?: DecimalNumberMetadataMock;
    setValue: SinonStub<[value: number | null], void>;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(propertyName, db, entityMetadata);       
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } =
                this._db.GetValueAndMetadata<ShkoOnline.DecimalNumberAttributeMetadata>(
                    this._boundTable,                  
                    this._boundColumn,
                    this._boundRow,
                );
            if (attributeMetadata.AttributeType !== AttributeType.Decimal) {
                throw new Error('Type Error');
            }
            this.attributes = new DecimalNumberMetadataMock();
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.Precision = attributeMetadata.Precision;
            this.attributes.MaxValue = attributeMetadata.MaxValue;
            this.attributes.MinValue = attributeMetadata.MinValue;
            this.attributes.ImeMode = attributeMetadata.ImeMode;
            this.raw = value;
        });
        const attribute = {
            AttributeType: AttributeType.Decimal,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.DecimalNumberAttributeMetadata;
        entityMetadata.Attributes?.push(attribute);

        this.setValue = stub();
        this.setValue.callsFake((value) => {
            this.raw = value;
            this.formatted = '' + value;
        });
    }
}
