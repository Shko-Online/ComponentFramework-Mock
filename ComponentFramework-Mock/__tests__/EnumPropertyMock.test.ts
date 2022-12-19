/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { AttributeType, EnumPropertyMock, MetadataDB } from '../src';

describe('EnumPropertyMock', () => {
    let db: MetadataDB;
    let enumproperty: EnumPropertyMock<'1'|'2'|'3'>;
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

        db.initMetadata([entityMetadata]);

        enumproperty = new EnumPropertyMock('enum', db, entityMetadata);

        db.initItems({
            '@odata.context': '#' + LogicalName,
            value: [{ id: boundRow, name: 'Betim Beja', enum: '1' }],
        });
    });

    it('Should have the data from init', () => {
        enumproperty._Refresh();
        expect(enumproperty.raw).toEqual('1');
    });

    it('_Refresh should refresh the data', () => {
        db.UpdateValue('2', LogicalName, 'enum');
        enumproperty._Refresh();
        expect(enumproperty.raw).toEqual('2');
    });

    it('Can bind to a different column', () => {
        db.upsertAttributeMetadata(LogicalName, {
            AttributeType: AttributeType.Picklist,
            LogicalName: 'new_enum',
            SchemaName: 'new_Enum',
        } as ShkoOnline.PickListAttributeMetadata);
        db.UpdateValue('0', LogicalName, 'new_enum');
        enumproperty._Bind(LogicalName, 'new_enum');
        enumproperty._Refresh();
        expect(enumproperty.raw).toEqual('0');
    });
});
