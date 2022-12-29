/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { stub } from 'sinon';
import type { SinonStub }from 'sinon';

export class PagingMock implements ComponentFramework.PropertyHelper.DataSetApi.Paging {
    _pageSize: number;
    totalResultCount: number;
    firstPageNumber: number;
    lastPageNumber: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    loadNextPage: SinonStub<[loadOnlyNewPage?: boolean], void>;
    loadPreviousPage: SinonStub<[loadOnlyNewPage?: boolean], void>;
    reset: SinonStub<[], void>;
    setPageSize: SinonStub<[pageSize: number], void>;
    loadExactPage: SinonStub<[pageNumber: number], void>;

    constructor() {
        this.totalResultCount = -1;
        this.firstPageNumber = 1;
        this.lastPageNumber = 1;
        this.hasNextPage = false;
        this.hasPreviousPage = false;
        this._pageSize = 10;
        this.pageSize = 10;
        this.loadNextPage = stub();
        this.loadNextPage.callsFake(() => this.hasNextPage);
        this.loadPreviousPage = stub();
        this.loadPreviousPage.callsFake(() => this.hasPreviousPage);
        this.setPageSize = stub();
        this.setPageSize.callsFake((pageSize: number) => {
            this._pageSize = pageSize;
        });
        this.reset = stub();
        this.loadExactPage = stub();
    }
}
