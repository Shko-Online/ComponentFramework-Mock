/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../src/ShkoOnline';
import { it, expect, describe, beforeEach } from '@jest/globals';
import { AttributeType, DecimalNumberPropertyMock, MetadataDB } from '../src';

describe('DecimalNumberPropertyMock', () => {
    let db: MetadataDB;
    let decimalnumberproperty: DecimalNumberPropertyMock;
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
        decimalnumberproperty = new DecimalNumberPropertyMock('number', db, entityMetadata);
        
        db.initMetadata([entityMetadata]);
        db.initItems({
            '@odata.context': '#' + LogicalName,
            value: [{ id: boundRow, name: 'Betim Beja', number: 101.01 }],
        });
    });

    it('Should have the data from init', () => {
        decimalnumberproperty._Refresh();
        expect(decimalnumberproperty.raw).toEqual(101.01);
    });

    it('_Refresh should refresh the data', () => {
        db.UpdateValue(202.02, LogicalName, 'number');
        decimalnumberproperty._Refresh();
        expect(decimalnumberproperty.raw).toEqual(202.02);
    });

    it('Can bind to a different column', () => {
        db.upsertAttributeMetadata(LogicalName, {
            AttributeType: AttributeType.Decimal,
            LogicalName: 'new_number',
            SchemaName: 'new_Number',
        } as ShkoOnline.DecimalNumberAttributeMetadata);
        decimalnumberproperty._Bind(LogicalName, 'new_number');
        db.UpdateValue(202.05, LogicalName, 'new_number');
        decimalnumberproperty._Refresh();
        expect(decimalnumberproperty.raw).toEqual(202.05);
    });
});
