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

type FilterExpression = ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;

export class FilteringMock implements ComponentFramework.PropertyHelper.DataSetApi.Filtering {
    _Filter: FilterExpression;
    getFilter: SinonStub<[], FilterExpression>;
    setFilter: SinonStub<[expression: FilterExpression], void>;
    clearFilter: SinonStub<[], void>;

    constructor() {
        const defaultFilter = {
            conditions: [],
            filterOperator: 0,
        } as FilterExpression;
        this._Filter = defaultFilter;
        this.clearFilter = stub();
        this.clearFilter.callsFake(() => {
            this._Filter = defaultFilter;
        });
        this.getFilter = stub();
        this.getFilter.callsFake(() => ({ ...this._Filter }));
        this.setFilter = stub();
        this.setFilter.callsFake((filter) => {
            this._Filter = { ...filter };
        });
    }
}
