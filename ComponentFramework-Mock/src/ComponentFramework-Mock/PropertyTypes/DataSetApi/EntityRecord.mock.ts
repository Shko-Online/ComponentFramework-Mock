/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { MetadataDB } from '../../../ComponentFramework-Mock-Generator/Metadata.db';
import { stub } from 'sinon';
import type { SinonStub }from 'sinon';

type ColumnReturnValue =
    | string
    | number
    | boolean
    | number[]
    | ComponentFramework.EntityReference
    | ComponentFramework.EntityReference[]
    | Date
    | ComponentFramework.LookupValue
    | ComponentFramework.LookupValue[];

export class EntityRecordMock implements ComponentFramework.PropertyHelper.DataSetApi.EntityRecord {
    _db: MetadataDB;
    _boundRow: string;
    _boundTable: string;
    getFormattedValue: SinonStub<[columnName: string], string>;
    getRecordId: SinonStub<[], string>;
    getValue: SinonStub<[columnName: string], ColumnReturnValue>;
    getNamedReference: SinonStub<[], ComponentFramework.EntityReference>;
    constructor(db: MetadataDB, etn: string, id: string) {
        this._db = db;
        this._boundTable = etn;
        this._boundRow = id;
        this.getFormattedValue = stub();
        this.getFormattedValue.callsFake((columnName) => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.DateTimeAttributeMetadata>(
                this._boundTable,              
                columnName,
                this._boundRow,
            );
            return value===undefined ? value : '' + value;
        });
        this.getNamedReference = stub();
        this.getNamedReference.callsFake(() => {
            const { row, entityMetadata } = this._db.GetRow(this._boundTable, this._boundRow);
            if (row === null) {              
                return {id: {guid: ''},  name: ''};
            }
            const id = { guid: row?.[entityMetadata.PrimaryIdAttribute || (entityMetadata.LogicalName + 'id')] as string };
            const etn = entityMetadata.LogicalName;
            const name = row?.[entityMetadata.PrimaryNameAttribute || 'name'] as string;
            return { id, etn, name };
        });
        this.getRecordId = stub();
        this.getRecordId.callsFake(() => id);
        this.getValue = stub();
        this.getValue.callsFake((columnName) => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.DateTimeAttributeMetadata>(
                this._boundTable,              
                columnName,
                this._boundRow,
            );
            return value;
        });
    }
}
