import { it, expect, describe, beforeEach } from '@jest/globals';
import { PagingMock, MetadataDB } from '../src';

describe('PagingSetMock', () => {
    let paging: PagingMock;

    beforeEach(() => {
        paging = new PagingMock();
    });

    it('Can load next page if it has next page', () => {
        expect(paging.loadNextPage()).toEqual(paging.hasNextPage);
    });

    it('Can load previous page if it has previous page', () => {
        expect(paging.loadPreviousPage()).toEqual(paging.hasPreviousPage);
    });
});
