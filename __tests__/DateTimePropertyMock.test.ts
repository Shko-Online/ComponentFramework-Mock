/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../src/ShkoOnline';
import { it, expect, describe, beforeEach } from '@jest/globals';
import { DateTimePropertyMock, MetadataDB } from '../src';

describe('DateTimePropertyMock', () => {
    let db: MetadataDB;
    let datetimeproperty: DateTimePropertyMock;
    let LogicalName: string;
    let boundRow: string;

    beforeEach(() => {
        db = new MetadataDB();
        LogicalName = '!!test';
        boundRow = 'TheRowId';

        const entityMetadata = {
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
            ],
        } as ShkoOnline.EntityMetadata;
        datetimeproperty = new DateTimePropertyMock('date', db, entityMetadata);

        db.initMetadata([entityMetadata]);
        db.initItems({
            '@odata.context': '#' + LogicalName,
            value: [{ id: boundRow, name: 'Betim Beja', date: new Date(2022, 10, 18) }],
        });
    });

    it('Should have the data from init', () => {
        datetimeproperty._Refresh();
        expect(datetimeproperty.raw).toEqual(new Date(2022, 10, 18));
    });

    it('_Refresh should refresh the data', () => {
        db.UpdateValue(new Date(2022, 10, 19), LogicalName, 'date');
        datetimeproperty._Refresh();
        expect(datetimeproperty.raw).toEqual(new Date(2022, 10, 19));
    });

    it('Can bind to a different column', () => {
        db.upsertAttributeMetadata(LogicalName, {
            AttributeType: 2,
            LogicalName: 'new_date',
            SchemaName: 'new_Date',
        } as ShkoOnline.DateTimeAttributeMetadata);
        db.UpdateValue(new Date(2022, 10, 19), LogicalName, 'new_date');
        datetimeproperty._Bind(LogicalName, 'new_date');
        datetimeproperty._Refresh();
        expect(datetimeproperty.raw).toEqual(new Date(2022, 10, 19));
    });
});
