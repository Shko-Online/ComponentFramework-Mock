/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../src/ShkoOnline';
import { it, expect, describe, beforeEach } from '@jest/globals';
import { AttributeType, MultiSelectOptionSetPropertyMock, MetadataDB, OptionSetType } from '../src';

describe('MultiSelectOptionSetPropertyMock', () => {
    let db: MetadataDB;
    let property: MultiSelectOptionSetPropertyMock;
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

        property = new MultiSelectOptionSetPropertyMock('property', db, entityMetadata);
        var metadata = entityMetadata.Attributes.filter(
            (a) => a.LogicalName === 'property',
        )[0] as ShkoOnline.PickListAttributeMetadata;
        metadata.OptionSet = {
            MetadataId: '',
            IsCustomOptionSet: true,
            Name: 'test',
            OptionSetType: OptionSetType.Picklist,
            Options: {
                '0': {
                    Label: 'First choice',
                    Value: 0,
                },
                '1': {
                    Label: 'Second Choice',
                    Value: 1,
                },
                '2': {
                    Label: 'Third Choice',
                    Value: 2,
                },
            },
        };
        db.initMetadata([entityMetadata]);
        db.initItems({
            '@odata.context': '#' + LogicalName,
            value: [{ id: boundRow, name: 'Betim Beja', property: ['1', '2'] }],
        });
    });

    it('Should have the data from init', () => {
        property._Refresh();
        expect(property.raw).toEqual(['1', '2']);
    });

    it('_Refresh should refresh the data', () => {
        db.UpdateValue(['2'], LogicalName, 'property');
        property._Refresh();
        expect(property.raw).toEqual(['2']);
    });

    it('Can bind to a different column', () => {
        db.upsertAttributeMetadata(LogicalName, {
            AttributeType: AttributeType.Picklist,
            LogicalName: 'new_enum',
            SchemaName: 'new_Enum',
            OptionSet: {
                MetadataId: '',
                IsCustomOptionSet: true,
                Name: 'test',
                OptionSetType: AttributeType.Picklist,
                Options: {
                    10: {
                        Label: 'Tenth Choice',
                        Value: 10,
                    },
                    11: {
                        Label: 'Eleventh Choice',
                        Value: 11,
                    },
                },
            },
        } as unknown as ShkoOnline.PickListAttributeMetadata);
        db.UpdateValue([10], LogicalName, 'new_enum');
        property._Bind(LogicalName, 'new_enum');
        property._Refresh();
        expect(property.raw).toEqual([10]);
        expect(property.formatted).toEqual('Tenth Choice');
    });
});
