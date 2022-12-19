/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { EntityRecordMock, MetadataDB } from '../src';

describe('EntityRecordMock', () => {
    let db: MetadataDB;
    let entityRecord: EntityRecordMock;
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
                ],
            },
        ]);

        db.initItems({
            '@odata.context': '#' + LogicalName,
            value: [{ id: boundRow, name: 'Betim Beja' }],
        });

        entityRecord = new EntityRecordMock(db, LogicalName, boundRow);
    });

    it('getNamedReference should return an entity reference', () => {
        expect<ComponentFramework.EntityReference>(entityRecord.getNamedReference()).toEqual({
            id: { guid: boundRow },
            name: 'Betim Beja',
            etn: LogicalName,
        } as ComponentFramework.EntityReference);
    });

    it('getValue should return the value', () => {
        expect(entityRecord.getValue('name')).toEqual('Betim Beja');
    });

    it('getFormattedValue should return the formatted value', () => {
        expect(entityRecord.getFormattedValue('name')).toEqual('Betim Beja');
    });

    it('getFormattedValue should return undefined for unknown columns', () => {
        expect(entityRecord.getFormattedValue('name :O')).toBeUndefined();
    });

    it('getRecordId should return the bound row id', () => {
        expect(entityRecord.getRecordId()).toEqual(boundRow);
    });
});
