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
import { FilteringMock } from "./DataSetApi/Filtering.mock";
import { LinkingMock } from "./DataSetApi/Linking.mock";
import { EntityRecord } from "./DataSetApi/EntityRecord.mock";

export class DataSetMock implements ComponentFramework.PropertyTypes.DataSet {
  addColumn?: SinonStub<[name: string, entityAlias?: string], void>;
  columns: ComponentFramework.PropertyHelper.DataSetApi.Column[];
  error: boolean;
  errorMessage: string;
  filtering: FilteringMock;
  linking: LinkingMock;
  loading: boolean;
  paging: PagingMock;
  records: {
    [id: string]: EntityRecord;
  };
  sortedRecordIds: string[];
  sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
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
    this.sortedRecordIds = [] ;
    this.clearSelectedRecordIds = stub();
    this.getSelectedRecordIds = stub();
    this.addColumn = stub();
    this.getTargetEntityType = stub();
    this.getTitle = stub();
    this.getViewId = stub();
    this.getViewId = stub();
    this.openDatasetItem = stub();
    this.refresh = stub();
    this.setSelectedRecordIds = stub();
    this.addColumn= stub();
  }

}

