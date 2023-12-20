/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

/// <reference types="powerapps-component-framework" />

declare namespace ComponentFramework {
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

interface ObjectConstructor {
    getOwnPropertyNames<T>(o: T): (keyof T)[];
}
