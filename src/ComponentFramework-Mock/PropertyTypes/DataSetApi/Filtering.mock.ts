/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { stub } from 'sinon';
import type { SinonStub }from 'sinon';

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
