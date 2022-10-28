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
import { PagingMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/Paging.mock';
import { FilteringMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/Filtering.mock';
import { LinkingMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/Linking.mock';
import { EntityRecord } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/EntityRecord.mock';
import { SortStatus } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/SortStatus.mock';
import { MetadataDB } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/Metadata.db';
import AttributeMetadataGenerator from '@shko-online/componentframework-mock/utils/AttributeMetadataGenerator';

type Column = ComponentFramework.PropertyHelper.DataSetApi.Column;

export class DataSetMock implements ComponentFramework.PropertyTypes.DataSet {
    _boundColumn: string;
	_boundTable: string;
	_boundRow: string;
	_db: MetadataDB;
    _Bind: SinonStub<[boundTable: string, boundColumn: string, boundRow?: string], void>;
    _Refresh: SinonStub<[], void>;
    _InitItems: SinonStub<[items: any[]], void>;
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
    sortedRecordIds: string[];
    sorting: SortStatus[];
    clearSelectedRecordIds: SinonStub<[], void>;
    getSelectedRecordIds: SinonStub<[], string[]>;
    getTargetEntityType: SinonStub<[], string>;
    getTitle: SinonStub<[], string>;
    getViewId: SinonStub<[], string>;
    openDatasetItem: SinonStub<[entityReference: ComponentFramework.EntityReference], void>;
    refresh: SinonStub<[], void>;
    setSelectedRecordIds: SinonStub<[ids: string[]], void>;
    constructor(propertyName: string, db: MetadataDB) {
        this._boundColumn = propertyName;
        this._db = db;
        const dataSetEntity = {
            LogicalName: '!!'+propertyName,
            EntitySetName: '!!'+propertyName,
            Attributes: []
        } as ShkoOnline.EntityMetadata;
        this._db.initMetadata([dataSetEntity]);
        this._Refresh = stub();
        this._Bind = stub();
		this._Bind.callsFake((boundTable: string, boundColumn: string, boundRow?: string) => {
			this._boundColumn = boundColumn;
			this._boundRow = boundRow;
			this._boundTable = boundTable;
		});
        this._Bind(`!!${propertyName}`, propertyName);
        this._InitItems = stub();
        this._InitItems.callsFake((items)=>{
            let i = 0;
            let columns = {};
            items.forEach((item)=>{
                Object.getOwnPropertyNames(item).forEach(key=>{
                    if(!(key in columns)){
                        columns[key] = i++;
                    }
                })
            })
          this.columns =  Object.getOwnPropertyNames(columns).map(column=>(  {
                "displayName": column,
                "name": column,
                "dataType": "SingleLine.Text",
                "alias": column,
                "order": columns[column],
                "visualSizeFactor": 1
            }))

        //     console.log(this._boundTable)
        //     new AttributeMetadataGenerator(this._boundTable).AddString(Object.getOwnPropertyNames(columns)).Attributes.forEach(attribute=>{
        //    console.log(JSON.stringify(attribute));
        //         this._db.upsertAttributeMetadata(this._boundTable, attribute);
        //     })
         
            this._db.initItems({
                '@odata.context': `#${this._boundTable}`,
                value: items,
            })
        })
        this._Refresh.callsFake(()=>{
           var rows = this._db.GetRows(this._boundTable);
           const records = rows.rows.map(item=>{
            const row = new EntityRecord(undefined, item[rows.entityMetadata.PrimaryIdAttribute || 'id'], item.name);
            row.metadata = rows.entityMetadata;
            row.columns = item;
            return row;
           });
            this.records = {};
            records.forEach((record) => {
                this.records[record.getRecordId()] = record;
            });
            this.paging.totalResultCount = records.length;
            if (this.sorting.length > 0) {
                const sort = this.sorting[0];
                this.sortedRecordIds = records
                    .sort((record1, record2) =>
                        sort.sortDirection === 0
                            ? record1.getFormattedValue(sort.name).localeCompare(record2.getFormattedValue(sort.name))
                            : record2.getFormattedValue(sort.name).localeCompare(record1.getFormattedValue(sort.name)),
                    )
                    .map((record) => record.getRecordId());
            } else {
                this.sortedRecordIds = records
                    .sort((record1, record2) =>
                        record1.getNamedReference()?.name?.localeCompare(record2.getNamedReference()?.name),
                    )
                    .map((record) => record.getRecordId());
            }
        });
        this.loading = false;
        this.sortedRecordIds = [];
        this.sorting = [];
        this.columns = [];
        this.paging = new PagingMock();
        this.filtering = new FilteringMock();
        this.records = {};
        this.clearSelectedRecordIds = stub();
        this.getSelectedRecordIds = stub();
        this.getSelectedRecordIds.callsFake(() => []);
        this.addColumn = stub();
        this.getTargetEntityType = stub();
        this.getTargetEntityType.callsFake(()=>{
            return this._boundTable;
        })
        this.getTitle = stub();
        this.getViewId = stub();
        this.openDatasetItem = stub();
        this.refresh = stub();
        this.setSelectedRecordIds = stub();
        
    }
}
