/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { DataSetMock, MetadataDB } from '../src';

describe('DataSetMock', () => {
    let db: MetadataDB;
    let dataset: DataSetMock;
    let LogicalName: string;
    let boundRow: string;

    beforeEach(() => {
        db = new MetadataDB();
        LogicalName = '!!test';
        boundRow = 'TheRowId';

        db.initMetadata([
            {
                LogicalName,
                EntitySetName: LogicalName,
                PrimaryIdAttribute: 'id',
                PrimaryNameAttribute: 'name',
                Attributes: [
                    {
                        AttributeType: 15,
                        LogicalName: 'id',
                        SchemaName: 'Id',
                        IsPrimaryId: true,
                    } as ShkoOnline.AttributeMetadata,
                    {
                        AttributeType: 14,
                        LogicalName: 'name',
                        SchemaName: 'Name',
                        IsPrimaryName: true,
                    } as ShkoOnline.StringAttributeMetadata,
                    {
                        AttributeType: 17,
                        LogicalName: 'dataset',
                        SchemaName: 'dataset',
                        IsPrimaryName: true,
                    } as ShkoOnline.AttributeMetadata,
                ],
            },
        ]);

        db.initItems({
            '@odata.context': '#' + LogicalName,
            value: [{ id: boundRow, name: 'Betim Beja' }],
        });

        dataset = new DataSetMock('dataset', db);

        dataset._InitItems([
            {
                id: '1',
                col1: 'Shko Online',
                col2: 3,
            },
            {
                id: '2',
                col1: 'AlbanianXrm',
                col2: 40,
            },
        ]);
    });

    it('getTargetEntityType should return the dataset target', () => {
        expect(dataset.getTargetEntityType()).toEqual('!!dataset');
    });

    it('getSelectedRecordIds should return the dataset target', () => {
        expect(dataset.getSelectedRecordIds()).toEqual([]);
    });

    it('sortedRecordIds should contain the right data', () => {
        expect(dataset.sortedRecordIds).toEqual(['1', '2']);
    });

    it('columns should contain the right data', () => {
        expect(dataset.columns).toEqual([
            {
                alias: 'id',
                dataType: 'SingleLine.Text',
                displayName: 'id',
                name: 'id',
                order: 0,
                visualSizeFactor: 1,
            },
            {
                alias: 'col1',
                dataType: 'SingleLine.Text',
                displayName: 'col1',
                name: 'col1',
                order: 1,
                visualSizeFactor: 1,
            },
            {
                alias: 'col2',
                dataType: 'SingleLine.Text',
                displayName: 'col2',
                name: 'col2',
                order: 2,
                visualSizeFactor: 1,
            },
        ]);
    });

    it('SelectedRecordIds methods should work', () => {
        dataset.setSelectedRecordIds(['1', '2']);
        expect(dataset.getSelectedRecordIds()).toEqual(['1', '2']);
        dataset.clearSelectedRecordIds();
        expect(dataset.getSelectedRecordIds()).toEqual([]);
    });
});
