/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach, jest, afterEach } from '@jest/globals';
import { AttributeType, FormattingMock, MetadataDB, OptionSetType, ShkoOnline, WebApiMock } from '../src';

const CONTACT_ID = '00000000-0000-0000-0000-000000000001';
const CONTACT2_ID = '00000000-0000-0000-0000-000000000002';

const booleanAttribute = (LogicalName: string, trueLabel = 'Yes', falseLabel = 'No') =>
    ({
        LogicalName,
        AttributeType: AttributeType.Boolean,
        OptionSet: {
            MetadataId: '',
            IsCustomOptionSet: false,
            Name: LogicalName,
            OptionSetType: OptionSetType.Boolean,
            DisplayName: '',
            TrueOption: { Value: 1, Label: trueLabel, Color: '' },
            FalseOption: { Value: 0, Label: falseLabel, Color: '' },
        },
    }) as unknown as ShkoOnline.BooleanAttributeMetadata;

const picklistAttribute = (LogicalName: string, options: { [value: number]: string }) =>
    ({
        LogicalName,
        AttributeType: AttributeType.Picklist,
        OptionSet: {
            MetadataId: '',
            IsCustomOptionSet: false,
            Name: LogicalName,
            OptionSetType: OptionSetType.Picklist,
            Options: Object.fromEntries(
                Object.entries(options).map(([value, Label]) => [value, { Value: Number(value), Label, Color: '' }]),
            ),
        },
    }) as unknown as ShkoOnline.PickListAttributeMetadata;

const createDB = (options?: ConstructorParameters<typeof MetadataDB>[0]) => {
    const db = new MetadataDB(options);
    db.initMetadata([
        {
            LogicalName: 'contact',
            EntitySetName: 'contacts',
            PrimaryIdAttribute: 'contactid',
            PrimaryNameAttribute: 'fullname',
            Attributes: [
                { LogicalName: 'contactid', AttributeType: AttributeType.Uniqueidentifier },
                { LogicalName: 'fullname', AttributeType: AttributeType.String },
            ],
        } as unknown as ShkoOnline.EntityMetadata,
        {
            LogicalName: 'account',
            EntitySetName: 'accounts',
            PrimaryIdAttribute: 'accountid',
            PrimaryNameAttribute: 'name',
            Attributes: [
                { LogicalName: 'accountid', AttributeType: AttributeType.Uniqueidentifier },
                { LogicalName: 'name', AttributeType: AttributeType.String },
                { LogicalName: 'numberofemployees', AttributeType: AttributeType.Integer },
                { LogicalName: 'createdon', AttributeType: AttributeType.DateTime },
                { LogicalName: 'primarycontactid', AttributeType: AttributeType.Lookup },
                booleanAttribute('active', 'Active', 'Inactive'),
                picklistAttribute('category', { 1: 'Preferred', 2: 'Standard' }),
                picklistAttribute('tags', { 1: 'Red', 2: 'Green' }),
            ],
        } as unknown as ShkoOnline.EntityMetadata,
    ]);
    db.AddRow('contact', { contactid: CONTACT_ID, fullname: 'Jane Doe' });
    db.AddRow('contact', { contactid: CONTACT2_ID, fullname: 'John Doe' });
    return db;
};

describe('MetadataDB', () => {
    let warn: ReturnType<typeof jest.spyOn>;
    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
        warn.mockRestore();
    });

    it('Should find attribute metadata by id', () => {
        const db = createDB();
        const attribute = db.getAttributeMetadata('account', 'name') as ShkoOnline.AttributeMetadata;
        const byId = db.AttributeMetadataSQL.SelectAttributeMetadataById(attribute.MetadataId);
        expect(byId).toHaveLength(1);
        expect(byId[0].LogicalName).toEqual('name');
    });

    it('Should warn and not throw when upserting an attribute on a missing table', () => {
        const db = createDB();
        expect(() =>
            db.upsertAttributeMetadata('missing', {
                LogicalName: 'x',
                AttributeType: AttributeType.String,
            } as ShkoOnline.AttributeMetadata),
        ).not.toThrow();
        expect(warn).toHaveBeenCalledWith('Could not find metadata for missing');
    });

    it('Should keep custom Yes/No labels and a single virtual attribute when upserting twice', () => {
        const db = createDB();
        const flag = booleanAttribute('flag', 'On', 'Off');
        db.upsertAttributeMetadata('account', flag);
        db.upsertAttributeMetadata('account', flag);

        const metadata = db.getAttributeMetadata('account', 'flag') as ShkoOnline.BooleanAttributeMetadata;
        expect(metadata.OptionSet.TrueOption.Label).toEqual('On');
        expect(metadata.OptionSet.FalseOption.Label).toEqual('Off');
        const attributes = db.AttributeMetadataSQL.SelectAttributeMetadataForTable('account');
        expect(attributes.filter((a) => a.LogicalName === 'flag')).toHaveLength(1);
        expect(attributes.filter((a) => a.LogicalName === 'flagname')).toHaveLength(1);
    });

    it('Should store values of an attribute added with upsert', () => {
        const db = createDB();
        db.upsertAttributeMetadata('account', {
            LogicalName: 'website',
            AttributeType: AttributeType.String,
        } as ShkoOnline.AttributeMetadata);
        const id = db.AddRow('account', { name: 'Contoso', website: 'https://contoso.com' }) as string;
        expect(db.GetRow('account', id).row?.['website']).toEqual('https://contoso.com');
    });

    it('Should update a multi-select choice of a specific row', () => {
        const db = createDB();
        const id = db.AddRow('account', { name: 'Contoso' }) as string;
        const other = db.AddRow('account', { name: 'Fabrikam' }) as string;

        db.UpdateValue([1, 2], 'account', 'tags', id);

        expect(db.GetRow('account', id).row?.['tags']).toEqual([1, 2]);
        expect(db.GetRow('account', id).row?.['tagsname']).toEqual('Red; Green');
        expect(db.GetRow('account', other).row?.['tags']).toBeUndefined();
    });

    it('Should return a copy of the table metadata', () => {
        const db = createDB();
        const metadata = db.getTableMetadata('account') as ShkoOnline.EntityMetadata;
        metadata.Attributes?.splice(0);
        metadata.PrimaryNameAttribute = 'changed';

        const fresh = db.getTableMetadata('account') as ShkoOnline.EntityMetadata;
        expect(fresh.PrimaryNameAttribute).toEqual('name');
        expect(fresh.Attributes?.length).toBeGreaterThan(0);
    });

    it('Should use the injected id generator', () => {
        let i = 0;
        const db = createDB({ newId: () => `id-${++i}` });
        const id = db.AddRow('account', { name: 'Contoso' });
        expect(id).toMatch(/^id-\d+$/);
    });

    it('Should compute formatted values for choices when the item has no annotations', () => {
        const db = createDB();
        const id = db.AddRow('account', { name: 'Contoso', active: true, category: 2 }) as string;
        const { row } = db.GetRow('account', id);
        expect(row?.['activename']).toEqual('Active');
        expect(row?.['categoryname']).toEqual('Standard');
    });

    it('Should resolve @odata.bind on create', () => {
        const db = createDB();
        const id = db.AddRow('account', {
            name: 'Contoso',
            'primarycontactid@odata.bind': `/contacts(${CONTACT_ID})`,
        }) as string;
        expect(db.GetRow('account', id).row?.['primarycontactid']).toEqual({
            id: CONTACT_ID,
            entityType: 'contact',
            name: 'Jane Doe',
        });
    });
});

describe('WebApiMock queries', () => {
    let db: MetadataDB;
    let webApi: WebApiMock;
    let contosoId: string;
    let fabrikamId: string;

    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        db = createDB();
        contosoId = db.AddRow('account', {
            name: 'Contoso',
            numberofemployees: 10,
            createdon: '2024-01-01T00:00:00Z',
            active: true,
            category: 1,
            _primarycontactid_value: CONTACT_ID,
            '_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'contact',
            '_primarycontactid_value@OData.Community.Display.V1.FormattedValue': 'Jane Doe',
        }) as string;
        fabrikamId = db.AddRow('account', {
            name: 'Fabrikam',
            numberofemployees: 20,
            createdon: '2025-01-01T00:00:00Z',
            active: false,
            category: 2,
        }) as string;
        db.AddRow('account', { name: 'Northwind', numberofemployees: 30, active: true, category: 2 });
        webApi = new WebApiMock(db, new FormattingMock());
        webApi._Delay = 0;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const names = async (options: string) =>
        (await webApi.retrieveMultipleRecords('account', options)).entities.map((e) => e['name']);

    describe('$filter', () => {
        it('Should filter on a boolean', async () => {
            expect(await names('?$select=name&$filter=active eq true&$orderby=name')).toEqual(['Contoso', 'Northwind']);
        });

        it('Should filter on a lookup', async () => {
            expect(await names(`?$select=name&$filter=_primarycontactid_value eq ${CONTACT_ID}`)).toEqual(['Contoso']);
        });

        it('Should filter on a choice', async () => {
            expect(await names('?$select=name&$filter=category eq 2&$orderby=name')).toEqual(['Fabrikam', 'Northwind']);
        });

        it('Should compare two columns', async () => {
            expect(await names('?$select=name&$filter=numberofemployees gt category&$orderby=name')).toEqual([
                'Contoso',
                'Fabrikam',
                'Northwind',
            ]);
        });

        it('Should respect the precedence of and/or', async () => {
            expect(
                await names(
                    "?$select=name&$filter=numberofemployees eq 30 and (name eq 'Contoso' or name eq 'Northwind')",
                ),
            ).toEqual(['Northwind']);
        });

        it('Should reject a filter on a missing column', async () => {
            await expect(
                webApi.retrieveMultipleRecords('account', '?$select=name&$filter=missing eq 1'),
            ).rejects.toEqual({
                message: "Could not find a property named 'missing' on type 'Microsoft.Dynamics.CRM.account'.",
            });
        });
    });

    describe('$select', () => {
        it('Should return lookups as _value with annotations', async () => {
            const result = await webApi.retrieveMultipleRecords(
                'account',
                `?$select=name,_primarycontactid_value&$filter=name eq 'Contoso'`,
            );
            expect(result.entities[0]).toEqual({
                accountid: contosoId,
                name: 'Contoso',
                _primarycontactid_value: CONTACT_ID,
                '_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'contact',
                '_primarycontactid_value@OData.Community.Display.V1.FormattedValue': 'Jane Doe',
            });
        });

        it('Should return formatted values for choices', async () => {
            const result = await webApi.retrieveMultipleRecords(
                'account',
                `?$select=active,category&$filter=name eq 'Fabrikam'`,
            );
            expect(result.entities[0]).toEqual({
                accountid: fabrikamId,
                active: false,
                'active@OData.Community.Display.V1.FormattedValue': 'Inactive',
                category: 2,
                'category@OData.Community.Display.V1.FormattedValue': 'Standard',
            });
        });
    });

    describe('paging', () => {
        it('Should apply $top', async () => {
            const result = await webApi.retrieveMultipleRecords('account', '?$select=name&$orderby=name&$top=2');
            expect(result.entities.map((e) => e['name'])).toEqual(['Contoso', 'Fabrikam']);
            expect(result.nextLink).toBeUndefined();
        });

        it('Should page with maxPageSize and nextLink', async () => {
            const options = '?$select=name&$orderby=name';
            const first = await webApi.retrieveMultipleRecords('account', options, 2);
            expect(first.entities.map((e) => e['name'])).toEqual(['Contoso', 'Fabrikam']);
            expect(first.nextLink).toBeDefined();

            const second = await webApi.retrieveMultipleRecords('account', '?' + first.nextLink.split('?')[1], 2);
            expect(second.entities.map((e) => e['name'])).toEqual(['Northwind']);
            expect(second.nextLink).toBeUndefined();
        });
    });

    describe('FetchXML', () => {
        const fetch = (xml: string) => '?fetchXml=' + encodeURIComponent(xml);

        it('Should apply filters and order', async () => {
            expect(
                await names(
                    fetch(`<fetch>
                        <entity name="account">
                            <attribute name="name" />
                            <filter type="or">
                                <condition attribute="name" operator="eq" value="Contoso" />
                                <filter>
                                    <condition attribute="category" operator="eq" value="2" />
                                    <condition attribute="active" operator="eq" value="1" />
                                </filter>
                            </filter>
                            <order attribute="name" descending="true" />
                        </entity>
                    </fetch>`),
                ),
            ).toEqual(['Northwind', 'Contoso']);
        });

        it('Should support in, like and top', async () => {
            expect(
                await names(
                    fetch(`<fetch top="1">
                        <entity name="account">
                            <attribute name="name" />
                            <filter>
                                <condition attribute="numberofemployees" operator="in">
                                    <value>20</value>
                                    <value>30</value>
                                </condition>
                                <condition attribute="name" operator="like" value="%a%" />
                            </filter>
                            <order attribute="name" />
                        </entity>
                    </fetch>`),
                ),
            ).toEqual(['Fabrikam']);
        });

        it('Should compare dates', async () => {
            const byDate = (operator: string, value: string) =>
                names(
                    fetch(
                        `<fetch><entity name="account"><attribute name="name" /><filter><condition attribute="createdon" operator="${operator}" value="${value}" /></filter></entity></fetch>`,
                    ),
                );
            expect(await byDate('gt', '2024-06-01T00:00:00Z')).toEqual(['Fabrikam']);
            expect(await byDate('eq', '2024-01-01T00:00:00Z')).toEqual(['Contoso']);
        });

        it('Should return the primary id when no attributes are requested', async () => {
            const result = await webApi.retrieveMultipleRecords(
                'account',
                fetch(`<fetch><entity name="account"><order attribute="name" /></entity></fetch>`),
            );
            expect(Object.keys(result.entities[0])).toEqual(['accountid']);
        });

        it('Should support aggregates', async () => {
            const result = await webApi.retrieveMultipleRecords(
                'account',
                fetch(`<fetch aggregate="true">
                    <entity name="account">
                        <attribute name="category" alias="category" groupby="true" />
                        <attribute name="numberofemployees" alias="total" aggregate="sum" />
                        <order alias="category" />
                    </entity>
                </fetch>`),
            );
            expect(result.entities).toEqual([
                expect.objectContaining({ category: 1, total: 10 }),
                expect.objectContaining({ category: 2, total: 50 }),
            ]);
        });

        it('Should reject a condition on a missing attribute', async () => {
            await expect(
                webApi.retrieveMultipleRecords(
                    'account',
                    fetch(
                        `<fetch><entity name="account"><filter><condition attribute="missing" operator="eq" value="1" /></filter></entity></fetch>`,
                    ),
                ),
            ).rejects.toEqual({ message: "'account' entity doesn't contain attribute with Name = 'missing'." });
        });
    });

    describe('updateRecord', () => {
        it('Should update a lookup with @odata.bind', async () => {
            await webApi.updateRecord('account', contosoId, {
                'primarycontactid@odata.bind': `/contacts(${CONTACT2_ID})`,
            });
            const retrieved = await webApi.retrieveRecord('account', contosoId, '?$select=_primarycontactid_value');
            expect(retrieved['_primarycontactid_value']).toEqual(CONTACT2_ID);
            expect(retrieved['_primarycontactid_value@OData.Community.Display.V1.FormattedValue']).toEqual('John Doe');
        });

        it('Should update the formatted value of a boolean', async () => {
            await webApi.updateRecord('account', contosoId, { active: false });
            const retrieved = await webApi.retrieveRecord('account', contosoId, '?$select=active');
            expect(retrieved['active@OData.Community.Display.V1.FormattedValue']).toEqual('Inactive');
        });

        it('Should reject when the row does not exist', async () => {
            const id = '00000000-0000-0000-0000-00000000000f';
            await expect(webApi.updateRecord('account', id, { name: 'x' })).rejects.toEqual({
                message: `Could not find record with id: '${id}' for entity: 'account'.`,
            });
        });
    });
});
