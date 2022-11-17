import { it, expect, describe, beforeEach } from '@jest/globals';
import { FilteringMock, MetadataDB } from '../src';

type FilterExpression = ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;

describe('FilteringMock', () => {
    let filtering: FilteringMock;

    beforeEach(() => {
        filtering = new FilteringMock();
    });

    it('Filtering filters works as expected', () => {
        const defaultFilter = {
            conditions: [],
            filterOperator: 0,
        };
        expect(filtering.getFilter()).toEqual(defaultFilter);
        const newFilter = {
            conditions: [
                {
                    attributeName: 'name',
                    conditionOperator: 0,
                    value: 'Betim Beja',
                },
            ],
            filterOperator: 0,
        } as FilterExpression;
        filtering.setFilter(newFilter);
        expect(filtering.getFilter()).toEqual(newFilter);
        filtering.clearFilter();
        expect(filtering.getFilter()).toEqual(defaultFilter);
    });
});
