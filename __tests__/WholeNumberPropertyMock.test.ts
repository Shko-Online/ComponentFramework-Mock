/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../src/ShkoOnline';
import { it, expect, describe, beforeEach } from '@jest/globals';
import { AttributeType, WholeNumberPropertyMock, MetadataDB } from '../src';

describe('WholeNumberPropertyMock', () => {
    let db: MetadataDB;
    let wholenumberproperty: WholeNumberPropertyMock;
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
                    AttributeType: AttributeType.Uniqueidentifier,
                    LogicalName: 'id',
                    SchemaName: 'Id',
                    IsPrimaryId: true,
                } as ShkoOnline.AttributeMetadata,
                {
                    AttributeType: AttributeType.String,
                    LogicalName: 'name',
                    SchemaName: 'Name',
                    IsPrimaryName: true,
                } as ShkoOnline.StringAttributeMetadata,
            ],
        } as ShkoOnline.EntityMetadata;
        wholenumberproperty = new WholeNumberPropertyMock('number', db, entityMetadata);

        db.initMetadata([entityMetadata]);
        db.initItems({
            '@odata.context': '#' + LogicalName,
            value: [{ id: boundRow, name: 'Betim Beja', number: 101 }],
        });
    });

    it('Should have the data from init', () => {
        wholenumberproperty._Refresh();
        expect(wholenumberproperty.raw).toEqual(101);
    });

    it('_Refresh should refresh the data', () => {
        db.UpdateValue(202, LogicalName, 'number');
        wholenumberproperty._Refresh();
        expect(wholenumberproperty.raw).toEqual(202);
    });

    it('Can bind to a different column', () => {
        db.upsertAttributeMetadata(LogicalName, {
            AttributeType: AttributeType.Integer,
            LogicalName: 'new_number',
            SchemaName: 'new_Number',
        } as ShkoOnline.IntegerNumberAttributeMetadata);
        wholenumberproperty._Bind(LogicalName, 'new_number');
        db.UpdateValue(205, LogicalName, 'new_number');
        wholenumberproperty._Refresh();
        expect(wholenumberproperty.raw).toEqual(205);
    });
});
