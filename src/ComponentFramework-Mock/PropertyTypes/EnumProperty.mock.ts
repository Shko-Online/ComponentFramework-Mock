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

import { MetadataDB } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/Metadata.db';
import { SinonStub, stub } from 'sinon';

export class EnumPropertyMock<EnumType extends string>
    implements ComponentFramework.PropertyTypes.EnumProperty<EnumType>
{
    _boundColumn: string;
	_boundTable: string;
	_boundRow: string;
	_db: MetadataDB;
    _Bind: SinonStub<[boundTable: string, boundColumn: string, boundRow?: string], void>;
    _Refresh: SinonStub<[], void>;
    raw: EnumType;
    type: string;
    setValue: SinonStub<[value: EnumType | null], void>;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        this._db = db;       
        this._Refresh = stub();
        this._Bind = stub();
		this._Bind.callsFake((boundTable: string, boundColumn: string, boundRow?: string) => {
			this._boundColumn = boundColumn;
			this._boundRow = boundRow;
			this._boundTable = boundTable;
		});
        this._Bind(entityMetadata.LogicalName, propertyName);
        this._Refresh.callsFake(()=>{
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.PickListAttributeMetadata>(
                this._boundTable,
                this._boundRow,
                this._boundColumn,
            );
            if (attributeMetadata.AttributeType !== ShkoOnline.AttributeType.Picklist) {
                throw new Error('Type Error');
            }
            this.raw = value;
        })
        const attribute = {
            AttributeType: ShkoOnline.AttributeType.Picklist,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName
        } as ShkoOnline.EnumTypeAttributeMetadata;
        entityMetadata.Attributes.push(attribute);

        this.setValue = stub();
        this.setValue.callsFake((value) => {
            this.raw = value;
            this.type = '' + value;
        });
    }
}
