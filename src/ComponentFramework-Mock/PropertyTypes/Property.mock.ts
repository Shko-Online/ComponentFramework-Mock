/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { SinonStub, stub } from 'sinon';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';

export class PropertyMock implements ComponentFramework.PropertyTypes.Property {
    _boundColumn: string;
    _boundRow?: string;
    _boundTable: string;
    _db: MetadataDB;
    _Refresh: SinonStub<[], void>;
    _Bind: SinonStub<[boundTable: string, boundColumn: string, boundRow?: string], void>;
    error: boolean;
    errorMessage: string;
    formatted?: string;
    security?: ComponentFramework.PropertyHelper.SecurityValues;
    raw: any;
    type: string;
    attributes?: ComponentFramework.PropertyHelper.FieldPropertyMetadata.Metadata;
    constructor(db: MetadataDB, boundTable: string, boundColumn: string) {
        this._db = db;
        this._boundTable = boundTable;
        this._boundColumn = boundColumn;
        this._boundRow = undefined;     
        this._Refresh = stub();
        this._Bind = stub();
        this._Bind.callsFake((boundTable: string, boundColumn: string, boundRow?: string) => {
            this._boundColumn = boundColumn;
            this._boundRow = boundRow;
            this._boundTable = boundTable;
        });
        this.raw = null;
        this.error = false;
        this.errorMessage = '';
        this.type = '';
    }
}
