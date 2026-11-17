/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, jest } from '@jest/globals';
import {
    AttributeType,
    FormattingMock,
    getPage,
    MetadataDB,
    OptionSetType,
    parseODataBind,
    pickWebApiProperties,
    readLookupFromItem,
    ShkoOnline,
    toWebApiEntity,
    WebApiMock,
} from '../src';

const metadata = {
    LogicalName: 'account',
    EntitySetName: 'accounts',
    PrimaryIdAttribute: 'accountid',
    PrimaryNameAttribute: 'name',
    Attributes: [
        { LogicalName: 'accountid', AttributeType: AttributeType.Uniqueidentifier },
        { LogicalName: 'name', AttributeType: AttributeType.String },
        { LogicalName: 'createdon', AttributeType: AttributeType.DateTime },
        { LogicalName: 'numberofemployees', AttributeType: AttributeType.Integer },
        { LogicalName: 'active', AttributeType: AttributeType.Boolean },
        { LogicalName: 'activename', AttributeType: AttributeType.Virtual, AttributeOf: 'active' },
        { LogicalName: 'tags', AttributeType: AttributeType.Picklist },
        { LogicalName: 'tagsname', AttributeType: AttributeType.Virtual, AttributeOf: 'tags' },
        { LogicalName: 'primarycontactid', AttributeType: AttributeType.Lookup },
        { LogicalName: 'primarycontactidname', AttributeType: AttributeType.Virtual, AttributeOf: 'primarycontactid' },
    ],
} as unknown as ShkoOnline.EntityMetadata;

const CONTACT_ID = '00000000-0000-0000-0000-000000000001';

describe('Wire', () => {
    describe('toWebApiEntity', () => {
        it('Should serialize a store row', () => {
            expect(
                toWebApiEntity(
                    {
                        accountid: 'a1',
                        name: 'Contoso',
                        createdon: new Date('2023-02-03T21:42:51.123Z'),
                        numberofemployees: 1500,
                        active: true,
                        activename: 'Yes',
                        tags: [1, 2],
                        tagsname: 'Red; Green',
                        primarycontactid: { id: CONTACT_ID, entityType: 'contact', name: 'Jane' },
                        primarycontactidnavigation: 'primarycontactid',
                    },
                    metadata,
                ),
            ).toEqual({
                accountid: 'a1',
                name: 'Contoso',
                createdon: '2023-02-03T21:42:51Z',
                'createdon@OData.Community.Display.V1.FormattedValue': '2/3/2023 9:42 PM',
                numberofemployees: 1500,
                'numberofemployees@OData.Community.Display.V1.FormattedValue': '1,500',
                active: true,
                'active@OData.Community.Display.V1.FormattedValue': 'Yes',
                tags: '1,2',
                'tags@OData.Community.Display.V1.FormattedValue': 'Red; Green',
                _primarycontactid_value: CONTACT_ID,
                '_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'contact',
                '_primarycontactid_value@OData.Community.Display.V1.FormattedValue': 'Jane',
                '_primarycontactid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': 'primarycontactid',
            });
        });

        it('Should format midnight and noon as 12', () => {
            const format = (iso: string) =>
                toWebApiEntity({ createdon: new Date(iso) }, metadata)[
                    'createdon@OData.Community.Display.V1.FormattedValue'
                ];
            expect(format('2024-01-01T00:05:00Z')).toEqual('1/1/2024 12:05 AM');
            expect(format('2024-01-01T12:00:00Z')).toEqual('1/1/2024 12:00 PM');
        });

        it('Should serialize raw lookup columns and empty values', () => {
            expect(
                toWebApiEntity(
                    {
                        accountid: 'a1',
                        primarycontactid: CONTACT_ID,
                        primarycontactidtype: 'contact',
                        primarycontactidname: 'Jane',
                        active: null,
                        createdon: undefined,
                        name: undefined,
                    },
                    metadata,
                ),
            ).toEqual({
                accountid: 'a1',
                name: null,
                _primarycontactid_value: CONTACT_ID,
                '_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'contact',
                '_primarycontactid_value@OData.Community.Display.V1.FormattedValue': 'Jane',
            });
        });

        it('Should keep properties that are not attributes', () => {
            expect(toWebApiEntity({ total: 3 }, metadata)).toEqual({ total: 3 });
        });

        it('Should not mutate the row', () => {
            const row = { accountid: 'a1', primarycontactid: null };
            toWebApiEntity(row, metadata);
            expect(row).toEqual({ accountid: 'a1', primarycontactid: null });
        });
    });

    it('Should pick the selected properties with their annotations', () => {
        const entity = toWebApiEntity(
            { accountid: 'a1', name: 'Contoso', numberofemployees: 5, active: false, activename: 'No' },
            metadata,
        );
        expect(pickWebApiProperties(entity, ['active'], 'accountid')).toEqual({
            accountid: 'a1',
            active: false,
            'active@OData.Community.Display.V1.FormattedValue': 'No',
        });
    });

    describe('readLookupFromItem', () => {
        const resolveBind = (entitySetName: string, id: string) => ({ id, entityType: entitySetName.slice(0, -1) });

        it('Should read @odata.bind case-insensitively', () => {
            expect(
                readLookupFromItem(
                    { 'PrimaryContactId@odata.bind': `/contacts(${CONTACT_ID})` },
                    'primarycontactid',
                    resolveBind,
                ),
            ).toEqual({ id: CONTACT_ID, entityType: 'contact' });
        });

        it('Should read _value with annotations', () => {
            expect(
                readLookupFromItem(
                    {
                        _primarycontactid_value: CONTACT_ID,
                        '_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'contact',
                        '_primarycontactid_value@OData.Community.Display.V1.FormattedValue': 'Jane',
                    },
                    'primarycontactid',
                    resolveBind,
                ),
            ).toEqual({ id: CONTACT_ID, entityType: 'contact', name: 'Jane', navigation: undefined });
        });

        it('Should distinguish a missing lookup from a cleared one', () => {
            expect(readLookupFromItem({}, 'primarycontactid', resolveBind)).toBeUndefined();
            expect(readLookupFromItem({ primarycontactid: null }, 'primarycontactid', resolveBind)).toBeNull();
            expect(
                readLookupFromItem({ 'primarycontactid@odata.bind': null }, 'primarycontactid', resolveBind),
            ).toBeNull();
        });
    });

    it('Should parse @odata.bind references', () => {
        expect(parseODataBind(`https://org.crm.dynamics.com/api/data/v9.2/contacts({${CONTACT_ID}})`)).toEqual({
            entitySetName: 'contacts',
            id: CONTACT_ID,
        });
        expect(() => parseODataBind('contacts')).toThrow("Invalid @odata.bind value 'contacts'");
    });

    it('Should page and build nextLink', () => {
        const entities = [1, 2, 3, 4, 5].map((i) => ({ i }));
        const first = getPage(entities, 'accounts', '?$select=i', 2);
        expect(first.entities).toEqual([{ i: 1 }, { i: 2 }]);
        expect(first.nextLink).toEqual('https://localhost/api/data/v9.2/accounts?%24select=i&%24skiptoken=2');

        const second = getPage(entities, 'accounts', '?' + first.nextLink?.split('?')[1], 2);
        expect(second.entities).toEqual([{ i: 3 }, { i: 4 }]);

        const last = getPage(entities, 'accounts', '?' + second.nextLink?.split('?')[1], 2);
        expect(last.entities).toEqual([{ i: 5 }]);
        expect(last.nextLink).toBeUndefined();
    });

    it('Should round-trip multi-select choices through the Web API', async () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        const db = new MetadataDB();
        db.initMetadata([
            {
                LogicalName: 'account',
                EntitySetName: 'accounts',
                Attributes: [
                    { LogicalName: 'accountid', AttributeType: AttributeType.Uniqueidentifier },
                    {
                        LogicalName: 'tags',
                        AttributeType: AttributeType.Picklist,
                        OptionSet: {
                            MetadataId: '',
                            IsCustomOptionSet: false,
                            Name: 'tags',
                            OptionSetType: OptionSetType.Picklist,
                            Options: { 1: { Value: 1, Label: 'Red' }, 2: { Value: 2, Label: 'Green' } },
                        },
                    },
                ],
            } as unknown as ShkoOnline.EntityMetadata,
        ]);
        const webApi = new WebApiMock(db, new FormattingMock());
        webApi._Delay = 0;

        const { id } = await webApi.createRecord('account', { tags: '1,2' });
        expect(db.GetRow('account', id).row?.['tags']).toEqual([1, 2]);

        const retrieved = await webApi.retrieveRecord('account', id, '?$select=tags');
        expect(retrieved).toEqual({
            accountid: id,
            tags: '1,2',
            'tags@OData.Community.Display.V1.FormattedValue': 'Red; Green',
        });
    });
});
