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
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';

export class PropertyMock implements ComponentFramework.PropertyTypes.Property {
    _boundColumn: string;
    _boundRow: string;
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
    constructor() {
        this._Refresh = stub();
        this._Bind = stub();
        this._Bind.callsFake((boundTable: string, boundColumn: string, boundRow?: string) => {
            this._boundColumn = boundColumn;
            this._boundRow = boundRow;
            this._boundTable = boundTable;
        });
    }
}
