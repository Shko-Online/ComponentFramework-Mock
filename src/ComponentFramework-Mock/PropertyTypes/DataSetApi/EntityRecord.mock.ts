/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../../ShkoOnline';
import type { SinonStub } from 'sinon';
import { MetadataDB } from '../../../ComponentFramework-Mock-Generator';
import { stub } from 'sinon';

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
    _isDirty: boolean;
    _isValid: boolean;
    _updateView?: () => void;
    getFormattedValue: SinonStub<[columnName: string], string>;
    getRecordId: SinonStub<[], string>;
    getValue: SinonStub<[columnName: string], ColumnReturnValue>;
    getNamedReference: SinonStub<[], ComponentFramework.EntityReference>;
    isDirty: SinonStub<[], boolean>;
    isValid: SinonStub<[], boolean>;
    save: SinonStub<[], Promise<void>>;
    setValue: SinonStub<[columnName: string, value: ColumnReturnValue], Promise<void>>;
    constructor(db: MetadataDB, etn: string, id: string, updateView?: () => void) {
        this._updateView = updateView;
        this._db = db;
        this._boundTable = etn;
        this._boundRow = id;
        this._isDirty = false;
        this._isValid = true;
        this.getFormattedValue = stub();
        this.getFormattedValue.callsFake((columnName) => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.DateTimeAttributeMetadata>(
                this._boundTable,
                columnName,
                this._boundRow,
            );
            return value === undefined ? value : '' + value;
        });
        this.getNamedReference = stub();
        this.getNamedReference.callsFake(() => {
            const { row, entityMetadata } = this._db.GetRow(this._boundTable, this._boundRow);
            if (!row) {
                return { id: { guid: '' }, name: '' };
            }
            const id = {
                guid: row?.[
                    entityMetadata ? entityMetadata.PrimaryIdAttribute || entityMetadata.LogicalName + 'id' : 'id'
                ] as string,
            };
            const etn = entityMetadata?.LogicalName;
            const name = row?.[entityMetadata?.PrimaryNameAttribute || 'name'] as string;
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
        this.isDirty = stub();
        this.isDirty.callsFake(() => this._isDirty);
        this.isValid = stub();
        this.isValid.callsFake(() => this._isValid);
        this.save = stub();
        this.save.callsFake(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    this._isDirty = false;
                    if (this._updateView) {
                        this._updateView();
                    }
                    resolve();
                }, 10);
            });
        });
        this.setValue = stub();
        this.setValue.callsFake((columnName, value) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    this._db.UpdateValue(value, this._boundTable, columnName, this._boundRow);
                    this._isDirty = true;
                    if (this._updateView) {
                        this._updateView();
                    }
                    resolve();
                }, 10);
            });
        });
    }
}
