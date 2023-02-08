/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../../ShkoOnline';

import { stub } from 'sinon';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';
import { AttributeType } from './AttributeType';

export class EnumPropertyMock<EnumType extends string>
    implements ComponentFramework.PropertyTypes.EnumProperty<EnumType>
{
    _boundColumn: string;
    _boundTable: string;
    _boundRow?: string;
    _db: MetadataDB;
    _Bind: SinonStub<[boundTable: string, boundColumn: string, boundRow?: string], void>;
    _Refresh: SinonStub<[], void>;
    _SetValue: SinonStub<[value: EnumType | null], void>;
    raw: EnumType;
    type: string;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        this.raw = '' as EnumType;
        this._db = db;
        this._boundColumn = propertyName;
        this._boundTable = entityMetadata.LogicalName;
        this._Refresh = stub();
        this._Bind = stub();
        this._Bind.callsFake((boundTable: string, boundColumn: string, boundRow?: string) => {
            this._boundTable = boundTable;
            this._boundColumn = boundColumn;
            this._boundRow = boundRow;
        });
        this._Bind(entityMetadata.LogicalName, propertyName);
        this._SetValue = stub();
        this._SetValue.callsFake((value) => {
            this._db.UpdateValue<EnumType | null>(value, this._boundTable, this._boundColumn, this._boundRow);
        });
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.PickListAttributeMetadata>(
                this._boundTable,
                this._boundColumn,
                this._boundRow,
            );
            if (attributeMetadata.AttributeType !== AttributeType.Picklist) {
                throw new Error('Type Error');
            }
            this.raw = value;
        });
        const attribute = {
            AttributeType: AttributeType.Picklist,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.EnumTypeAttributeMetadata;
        entityMetadata.Attributes?.push(attribute);
        this.type = 'EnumProperty';
    }
}
