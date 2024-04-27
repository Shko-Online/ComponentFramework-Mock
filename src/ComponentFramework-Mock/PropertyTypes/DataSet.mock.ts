/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../../ShkoOnline';

import { stub } from 'sinon';
import { EntityRecordMock } from './DataSetApi/EntityRecord.mock';
import { FilteringMock } from './DataSetApi/Filtering.mock';
import { LinkingMock } from './DataSetApi/Linking.mock';
import { PagingMock } from './DataSetApi/Paging.mock';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator/Metadata.db/Metadata.db';
import { AttributeMetadataGenerator } from '../../utils/AttributeMetadataGenerator';

type Column = ComponentFramework.PropertyHelper.DataSetApi.Column;

export class DataSetMock implements ComponentFramework.PropertyTypes.DataSet {
    _boundColumn: string;
    _boundTable: string;
    _boundRow?: string;
    _dataSetCapabilities: ComponentFramework.PropertyTypes.DataProviderCapabilities;
    _db: MetadataDB;
    _Bind: SinonStub<[boundTable: string, boundColumn: string, boundRow?: string], void>;
    _Refresh: SinonStub<[], void>;
    _InitItems: SinonStub<[items: { [column: string]: any }[]], void>;
    _loading: boolean;
    _timeoutRef?: NodeJS.Timeout;
    _onLoaded: SinonStub<[], void>;
    _delay: number;
    _SelectedRecordIds: string[];
    _updateView?: () => void;
    addColumn?: SinonStub<[name: string, entityAlias?: string], void>;
    columns: Column[];
    delete: SinonStub<[ids: string[]], Promise<void>>;
    error: boolean;
    errorMessage: string;
    filtering: FilteringMock;
    linking: LinkingMock;
    loading: boolean;
    paging: PagingMock;
    records: {
        [id: string]: EntityRecordMock;
    };
    sortedRecordIds: string[];
    sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    clearSelectedRecordIds: SinonStub<[], void>;
    getDataSetCapabilities: SinonStub<[], ComponentFramework.PropertyTypes.DataProviderCapabilities>;
    getSelectedRecordIds: SinonStub<[], string[]>;
    getTargetEntityType: SinonStub<[], string>;
    getTitle: SinonStub<[], string>;
    getViewId: SinonStub<[], string>;
    newRecord: SinonStub<[], ComponentFramework.PropertyHelper.DataSetApi.EntityRecord>;
    openDatasetItem: SinonStub<[entityReference: ComponentFramework.EntityReference], void>;
    refresh: SinonStub<[], void>;
    setSelectedRecordIds: SinonStub<[ids: string[]], void>;
    constructor(propertyName: string, db: MetadataDB) {
        this._boundTable = `!!${propertyName}`;
        this._boundColumn = propertyName;
        this._dataSetCapabilities = {
            canCreateNewRecords: true,
            canPaginate: true,
            hasCellImageInfo: true,
            hasRecordNavigation: true,
            isEditable: true,
            isFilterable: true,
            isSortable: true,
        };
        this._db = db;
        this._SelectedRecordIds = [];
        this._onLoaded = stub();
        this.error = false;
        this.errorMessage = '';
        this.linking = new LinkingMock();
        const dataSetEntity = {
            LogicalName: '!!' + propertyName,
            EntitySetName: '!!' + propertyName,
            PrimaryIdAttribute: 'id',
            PrimaryNameAttribute: 'name',
            Attributes: [],
        } as ShkoOnline.EntityMetadata;
        const dataSetColumnsEntity = {
            LogicalName: '!!' + propertyName + '@columns',
            EntitySetName: '!!' + propertyName + '@columns',
            PrimaryIdAttribute: 'name',
            PrimaryNameAttribute: 'displayName',
            Attributes: [],
        } as ShkoOnline.EntityMetadata;
        this._db.initMetadata([dataSetEntity, dataSetColumnsEntity]);
        this._Refresh = stub();
        this._Bind = stub();
        this._Bind.callsFake((boundTable: string, boundColumn: string, boundRow?: string) => {
            this._boundColumn = boundColumn;
            this._boundRow = boundRow;
            this._boundTable = boundTable;
        });

        this._InitItems = stub();
        this._InitItems.callsFake((items) => {
            const tableMetadata = this._db.getTableMetadata(`${this._boundTable}`);
            if (tableMetadata) {
                const primaryIdAttribute = tableMetadata.PrimaryIdAttribute || '';
                items.forEach((item, i) => {
                    if (item[primaryIdAttribute] === undefined) {
                        item[primaryIdAttribute] = i + '';
                    }
                });
            }

            let i = 0;
            let columns: { [key: string]: number } = {};
            items.forEach((item) => {
                Object.getOwnPropertyNames(item).forEach((key) => {
                    if (!(key in columns)) {
                        columns[key] = i++;
                    }
                });
            });

            new AttributeMetadataGenerator(this._boundTable)
                .AddString(
                    (Object.getOwnPropertyNames(columns) as string[]).filter(
                        (att) => !tableMetadata?.Attributes?.some((att2) => att2.LogicalName === att),
                    ),
                )
                .Attributes.forEach((attribute) => {
                    this._db.upsertAttributeMetadata(this._boundTable, attribute);
                });

            new AttributeMetadataGenerator(`${this._boundTable}@columns`)
                .AddString(['displayName', /*'name',*/ 'dataType', 'alias'])
                .AddInteger(['order', 'visualSizeFactor'])
                .Attributes.forEach((attribute) => {
                    this._db.upsertAttributeMetadata(`${this._boundTable}@columns`, attribute);
                });

            this._db.initItems({
                '@odata.context': `#${this._boundTable}@columns`,
                value: Object.getOwnPropertyNames(columns).map((column) => {
                    return {
                        displayName: column as string,
                        name: column as string,
                        dataType: 'SingleLine.Text',
                        alias: column as string,
                        order: columns[column],
                        visualSizeFactor: 1,
                    };
                }),
            });

            this._db.initItems({
                '@odata.context': `#${this._boundTable}`,
                value: items,
            });
            this._Refresh();
        });
        this._Refresh.callsFake(() => {
            const columnsResult = this._db.GetAllRows(`${this._boundTable}@columns`);
            this.columns = columnsResult.rows as Column[];
            const rows = this._db.GetAllRows(this._boundTable);
            const records: EntityRecordMock[] = this._loading
                ? []
                : rows.rows.map((item) => {
                      const row = new EntityRecordMock(
                          db,
                          this._boundTable,
                          item[rows.entityMetadata?.PrimaryIdAttribute || 'id'],
                          this._updateView,
                      );
                      return row;
                  });
            this.records = {};
            this.loading = this._loading;
            records.forEach((record) => {
                this.records[record.getRecordId()] = record;
            });

            this.paging.pageSize = this.paging._pageSize;
            this.paging.totalResultCount = records.length;
            if (this.sorting.length > 0) {
                const sort = this.sorting[0];
                this.sortedRecordIds = records
                    .sort((record1, record2) =>
                        sort.sortDirection === 0
                            ? record1.getFormattedValue(sort.name)?.localeCompare(record2.getFormattedValue(sort.name))
                            : record2.getFormattedValue(sort.name)?.localeCompare(record1.getFormattedValue(sort.name)),
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
        this.loading = true;
        this._loading = true;
        this._delay = 200;
        this.sortedRecordIds = [];
        this.sorting = [];
        this.columns = [];
        this.paging = new PagingMock();
        this.filtering = new FilteringMock();
        this.records = {};
        this.clearSelectedRecordIds = stub();
        this.clearSelectedRecordIds.callsFake(() => {
            this._SelectedRecordIds = [];
        });
        this.delete = stub();
        this.delete.callsFake((ids) => {
            return new Promise((resolve) => resolve());
        });
        this.getDataSetCapabilities = stub();
        this.getDataSetCapabilities.callsFake(() => ({ ...this._dataSetCapabilities }));
        this.getSelectedRecordIds = stub();
        this.getSelectedRecordIds.callsFake(() => [...this._SelectedRecordIds]);
        this.addColumn = stub();
        this.getTargetEntityType = stub();
        this.getTargetEntityType.callsFake(() => {
            return this._boundTable;
        });
        this.getTitle = stub();
        this.getViewId = stub();
        this.newRecord = stub();
        this.newRecord.callsFake(() => {
            const tableMetadata = this._db.getTableMetadata(`${this._boundTable}`);
            if (!tableMetadata) {
                throw new Error('Please initialize the metadata for this functionality');
            }

            const row = new EntityRecordMock(db, this._boundTable, 'Guid.NewGuid?', this._updateView);
            return row;
        });
        this.openDatasetItem = stub();
        this.refresh = stub();
        this.setSelectedRecordIds = stub();
        this.setSelectedRecordIds.callsFake((ids) => {
            if (!ids) {
                this._SelectedRecordIds = [];
                return;
            }
            // validate
            for (let i = 0; i < ids.length; i++) {
                const result = this._db.GetRow(this._boundTable, ids[i]);
                if (!result.row) {
                    throw new Error(`Record with id '${ids[i]}' does not exist.`);
                }
            }
            this._SelectedRecordIds = ids;
        });
    }
}

declare global{
    namespace ComponentFramework {
        namespace PropertyTypes {
            /**
             * The structure of a dataset property as it would be passed to a control
             */
            interface DataSet {
                /**
                 * Delete the records from data source.
                 * @param ids Array of IDs to be deleted.
                 * @todo Overloaded by Shko Online
                 */
                delete: (ids: string[]) => Promise<void>;
    
                /**
                 * The capabilities for the dataset.
                 * @todo Overloaded by Shko Online
                 */
                getDataSetCapabilities: () => DataProviderCapabilities;
    
                /**
                 * Initialize a local record object for control to set the value. The control needs to invoke the {@link ComponentFramework.PropertyHelper.DataSetApi.EntityRecord.save save()} method on the newly created record to persist the change.
                 * @todo Overloaded by Shko Online
                 */
                newRecord: () => ComponentFramework.PropertyHelper.DataSetApi.EntityRecord;
            }
    
            /**
             * Provides access to all the properties of a file.
             * @todo Overloaded by Shko Online
             */
            interface DataProviderCapabilities {
                /**
                 * Whether adding new records is supported or not.
                 */
                canCreateNewRecords: boolean;
                /**
                 * If the dataset records can be paged.
                 */
                canPaginate: boolean;
                /**
                 * Whether image info for record columns can be retrieved.
                 */
                hasCellImageInfo: boolean;
                /**
                 * Whether the dataset supports record navigation for lookup and primary fields.
                 */
                hasRecordNavigation: boolean;
                /**
                 * If the data provider has edit capabilities.
                 */
                isEditable: boolean;
                /**
                 * If the dataset can be filtered.
                 */
                isFilterable: boolean;
                /**
                 * If the dataset can be sorted.
                 */
                isSortable: boolean;
            }
        }
        namespace PropertyHelper {
            namespace DataSetApi {
                /**
                 * Base interface for dataset record result. Supports value retrival by column name.
                 */
                interface EntityRecord {
                    /**
                     * Whether this record is dirty. Only applicable if the dataset is editable and this record has dirty values.
                     * @todo Overloaded by Shko Online
                     */
                    isDirty(): boolean;
    
                    /**
                     * Whether this record is valid. Only applicable if the dataset is editable and this record has invalid values.
                     * @todo Overloaded by Shko Online
                     */
                    isValid(): boolean;
    
                    /**
                     * Saves the record
                     * @throws You can get an error saying `Invalid snapshot with id undefined` when the incorrect column name parameter was used with {@link ComponentFramework.PropertyHelper.DataSetApi.EntityRecord.setValue setValue}. Make sure to use the logical name of the column.
                     * @todo Overloaded by Shko Online
                     */
                    save(): Promise<void>;
    
                    /**
                     * Set value for the column.
                     * @param columnName The logical name of the column.
                     * @param value New value for the record.
                     * @todo Overloaded by Shko Online
                     */
                    setValue(
                        columnName: string,
                        value:
                            | string
                            | Date
                            | number
                            | number[]
                            | boolean
                            | ComponentFramework.EntityReference
                            | ComponentFramework.EntityReference[]
                            | ComponentFramework.LookupValue
                            | ComponentFramework.LookupValue[],
                    ): Promise<void>;
                }
            }
        }
    }    
}
