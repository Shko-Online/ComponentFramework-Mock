/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../src/ShkoOnline';
import { it, expect, describe, beforeEach } from '@jest/globals';
import { AttributeType, LookupPropertyMock, MetadataDB } from '../src';

describe('LookupPropertyMock', () => {
    let db: MetadataDB;
    let property: LookupPropertyMock;
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
        property = new LookupPropertyMock('property', db, entityMetadata);
        const propertyMetadata = entityMetadata.Attributes.find(attr=>attr.LogicalName ==='property') as ShkoOnline.LookupAttributeMetadata;
        propertyMetadata.Targets = ['contact'];
        db.initMetadata([entityMetadata]);
        db.initItems({
            '@odata.context': '#' + LogicalName,
            value: [
                {
                    id: boundRow,
                    name: 'Betim Beja',
                    property: {
                        id: 'SomeGuid',
                        name: 'Betim Beja',
                        entityType: 'contact',
                    } as ComponentFramework.LookupValue,
                },
            ],
        });
    });

    it('Should have the data from init', () => {
        property._Refresh();
        expect(property.raw).toEqual([
            {
                id: 'SomeGuid',
                name: 'Betim Beja',
                entityType: 'contact',
            },
        ]);
    });

    it('_Refresh should refresh the data', () => {
        db.UpdateValue(
            {
                id: 'SomeGuid',
                name: 'Betim Beja2',
                entityType: 'contact',
            },
            LogicalName,
            'property',
        );
        property._Refresh();
        expect(property.raw).toEqual([
            {
                id: 'SomeGuid',
                name: 'Betim Beja2',
                entityType: 'contact',
            },
        ]);
    });

    it('Can bind to a different column', () => {
        db.upsertAttributeMetadata(LogicalName, {
            AttributeType: AttributeType.Lookup,
            LogicalName: 'new_property',
            SchemaName: 'new_property',
        } as ShkoOnline.LookupAttributeMetadata);
        db.UpdateValue(
            {
                id: 'SomeGuid',
                name: 'Betim Beja2',
                entityType: 'contact',
            },
            LogicalName,
            'new_property',
        );
        property._Bind(LogicalName, 'new_property');
        property._Refresh();
        expect(property.raw).toEqual([
            {
                id: 'SomeGuid',
                name: 'Betim Beja2',
                entityType: 'contact',
            },
        ]);
    });

    it('Should return target entity type', () => {
        property._Refresh();
        expect(property.getTargetEntityType()).toEqual('contact');
    });
});
