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

import { SinonStub, stub } from "sinon";
import { PagingMock } from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/Paging.mock";
import { FilteringMock } from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/Filtering.mock";
import { LinkingMock } from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/Linking.mock";
import { EntityRecord } from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/EntityRecord.mock";
import { SortStatus } from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/SortStatus.mock";

// import { Column } from "./DataSetApi/Column.mock";

type Column = ComponentFramework.PropertyHelper.DataSetApi.Column;

export class DataSetMock implements ComponentFramework.PropertyTypes.DataSet {
  addColumn?: SinonStub<[name: string, entityAlias?: string], void>;
  columns: Column[];
  error: boolean;
  errorMessage: string;
  filtering: FilteringMock;
  linking: LinkingMock;
  loading: boolean;
  paging: PagingMock;
  records: {
    [id: string]: EntityRecord;
  };
  initRecords: SinonStub<[records: EntityRecord[]], void>;
  sortedRecordIds: string[];
  sorting: SortStatus[];
  clearSelectedRecordIds: SinonStub<[], void>;
  getSelectedRecordIds: SinonStub<[], string[]>;
  getTargetEntityType: SinonStub<[], string>;
  getTitle: SinonStub<[], string>;
  getViewId: SinonStub<[], string>;
  openDatasetItem: SinonStub<
    [entityReference: ComponentFramework.EntityReference],
    void
  >;
  refresh: SinonStub<[], void>;
  setSelectedRecordIds: SinonStub<[ids: string[]], void>;
  constructor() {
    this.loading = false;
    this.sortedRecordIds = [];
    this.sorting = [];
    this.columns = [];
    this.paging = new PagingMock();
    this.filtering = new FilteringMock();
    this.records = {};
    this.clearSelectedRecordIds = stub();
    this.getSelectedRecordIds = stub();
    this.getSelectedRecordIds.callsFake(() => [])
    this.addColumn = stub();
    this.getTargetEntityType = stub();
    this.getTitle = stub();
    this.getViewId = stub();
    this.openDatasetItem = stub();
    this.refresh = stub();
    this.setSelectedRecordIds = stub();
    this.initRecords = stub();
    this.initRecords.callsFake((records) => {
      this.records = {};
      records.forEach((record) => {
        this.records[record.getRecordId()] = record;
      });
      this.paging.totalResultCount = records.length;
      if (this.sorting.length > 0) {
        const sort = this.sorting[0];
        this.sortedRecordIds = records
          .sort((record1, record2) =>
            sort.sortDirection == 0
              ? record1
                  .getFormattedValue(sort.name)
                  .localeCompare(record2.getFormattedValue(sort.name))
              : record2
                  .getFormattedValue(sort.name)
                  .localeCompare(record1.getFormattedValue(sort.name))
          )
          .map((record) => record.getRecordId());
      } else {
        this.sortedRecordIds = records
          .sort((record1, record2) =>
            record1
              .getNamedReference()
              ?.name?.localeCompare(record2.getNamedReference()?.name)
          )
          .map((record) => record.getRecordId());
      }
    });
  }
}
