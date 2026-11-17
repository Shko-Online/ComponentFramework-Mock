/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach, jest, afterEach } from '@jest/globals';
import { AttributeType, DataverseMetadata, MetadataStore, OptionSetType, PptbDataverseApiMock } from '../src';

const ACCOUNT_TABLE_ID = '00000000-0000-0000-0000-00000000a000';
const CONTACT_ID = '00000000-0000-0000-0000-000000000001';

const createStore = (prefix: string) => {
    let i = 0;
    const store = new MetadataStore({ newId: () => `00000000-0000-0000-${prefix}-${String(++i).padStart(12, '0')}` });
    store.initMetadata([
        {
            LogicalName: 'contact',
            EntitySetName: 'contacts',
            PrimaryIdAttribute: 'contactid',
            PrimaryNameAttribute: 'fullname',
            DisplayName: 'Contact',
            Attributes: [
                { LogicalName: 'contactid', AttributeType: AttributeType.Uniqueidentifier },
                { LogicalName: 'fullname', AttributeType: AttributeType.String },
            ],
        } as unknown as DataverseMetadata.EntityMetadata,
        {
            LogicalName: 'account',
            MetadataId: ACCOUNT_TABLE_ID,
            EntitySetName: 'accounts',
            PrimaryIdAttribute: 'accountid',
            PrimaryNameAttribute: 'name',
            DisplayName: 'Account',
            DisplayCollectionName: 'Accounts',
            Attributes: [
                { LogicalName: 'accountid', AttributeType: AttributeType.Uniqueidentifier },
                { LogicalName: 'name', AttributeType: AttributeType.String, DisplayName: 'Account Name' },
                { LogicalName: 'primarycontactid', AttributeType: AttributeType.Lookup },
                {
                    LogicalName: 'industrycode',
                    AttributeType: AttributeType.Picklist,
                    DisplayName: 'Industry',
                    OptionSet: {
                        MetadataId: '',
                        IsCustomOptionSet: false,
                        Name: 'industrycode',
                        OptionSetType: OptionSetType.Picklist,
                        Options: {
                            2: { Value: 2, Label: 'Consulting' },
                            1: { Value: 1, Label: 'Accounting' },
                        },
                    },
                },
            ],
        } as unknown as DataverseMetadata.EntityMetadata,
    ]);
    store.AddRow('contact', { contactid: CONTACT_ID, fullname: 'Jane Doe' });
    return store;
};

describe('PptbDataverseApiMock', () => {
    let store: MetadataStore;
    let dataverseAPI: PptbDataverseApiMock;

    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        store = createStore('0001');
        dataverseAPI = new PptbDataverseApiMock(store);
        dataverseAPI._Delay = 0;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('records', () => {
        it('Should create, retrieve, update and delete a record', async () => {
            const { id } = await dataverseAPI.create('account', {
                name: 'Contoso',
                industrycode: 1,
                'primarycontactid@odata.bind': `/contacts(${CONTACT_ID})`,
            });
            expect(id).toEqual(expect.any(String));

            // retrieve doesn't ask for annotations
            await expect(
                dataverseAPI.retrieve('account', id, ['name', 'industrycode', '_primarycontactid_value']),
            ).resolves.toEqual({
                accountid: id,
                name: 'Contoso',
                industrycode: 1,
                _primarycontactid_value: CONTACT_ID,
            });

            await expect(dataverseAPI.update('account', id, { name: 'Contoso Ltd' })).resolves.toBeUndefined();
            await expect(dataverseAPI.retrieve('account', id, ['name'])).resolves.toEqual({
                accountid: id,
                name: 'Contoso Ltd',
            });

            await expect(dataverseAPI.delete('account', id)).resolves.toBeUndefined();
            await expect(dataverseAPI.retrieve('account', id)).rejects.toThrow(
                new Error(`0x80040217: Could not find record with id: '${id}' for entity: 'account'.`),
            );
        });

        it('Should reject with the code of the error', async () => {
            await expect(dataverseAPI.create('missing', {})).rejects.toThrow(
                new Error('0x80060888: Entity missing does not exist.'),
            );
        });

        it('Should create and update multiple records atomically', async () => {
            const type = { '@odata.type': 'Microsoft.Dynamics.CRM.account' };
            const ids = await dataverseAPI.createMultiple('account', [
                { ...type, name: 'A' },
                { ...type, name: 'B' },
            ]);
            expect(ids).toHaveLength(2);

            await expect(
                dataverseAPI.createMultiple('account', [
                    { ...type, name: 'C' },
                    { ...type, name: 'D', 'primarycontactid@odata.bind': 'contacts' },
                ]),
            ).rejects.toThrow("0x80060888: Invalid @odata.bind value 'contacts'");
            expect(store.GetAllRows('account').rows).toHaveLength(2);

            await expect(dataverseAPI.createMultiple('account', [{ name: 'E' }])).rejects.toThrow(
                '1 of 1 record(s) are missing the "@odata.type" property',
            );

            await dataverseAPI.updateMultiple('account', [
                { ...type, accountid: ids[0], name: 'A2' },
                { ...type, accountid: ids[1], name: 'B2' },
            ]);
            const missing = '00000000-0000-0000-0000-0000000000ff';
            await expect(
                dataverseAPI.updateMultiple('account', [
                    { ...type, accountid: ids[0], name: 'A3' },
                    { ...type, accountid: missing, name: 'X' },
                ]),
            ).rejects.toThrow(`0x80040217: Could not find record with id: '${missing}' for entity: 'account'.`);
            await expect(dataverseAPI.updateMultiple('account', [{ ...type, name: 'no id' }])).rejects.toThrow(
                "1 of 1 record(s) are missing the 'accountid' property",
            );

            const names = (await dataverseAPI.queryData('accounts?$select=name&$orderby=name')).value.map(
                (account) => account['name'],
            );
            expect(names).toEqual(['A2', 'B2']);
        });
    });

    describe('queries', () => {
        beforeEach(async () => {
            await dataverseAPI.create('account', { name: 'Contoso', industrycode: 2 });
            await dataverseAPI.create('account', { name: 'Fabrikam', industrycode: 1 });
        });

        it('Should run FetchXML queries with annotations', async () => {
            const fetchXml = `<fetch><entity name="account"><attribute name="name" /><attribute name="industrycode" /><filter><condition attribute="name" operator="begins-with" value="Fab" /></filter></entity></fetch>`;
            const result = await dataverseAPI.fetchXmlQuery(fetchXml);
            expect(result.value).toEqual([
                {
                    accountid: expect.any(String),
                    name: 'Fabrikam',
                    industrycode: 1,
                    'industrycode@OData.Community.Display.V1.FormattedValue': 'Accounting',
                },
            ]);

            dataverseAPI.fetchXmlQuery.resolves({ value: [] });
            await expect(dataverseAPI.retrieveMultiple(fetchXml)).resolves.toEqual({ value: [] });
        });

        it('Should reject FetchXML without an entity', async () => {
            await expect(dataverseAPI.fetchXmlQuery('<fetch></fetch>')).rejects.toThrow(
                '0x80041102: Entity Name was not specified in FetchXml String.',
            );
        });

        it('Should query data with OData', async () => {
            const result = await dataverseAPI.queryData('accounts?$select=name&$filter=industrycode eq 2');
            expect(result).toEqual({
                value: [{ accountid: expect.any(String), name: 'Contoso' }],
            });

            const [account] = result.value;
            await expect(
                dataverseAPI.queryData(`/api/data/v9.2/accounts(${account['accountid']})?$select=name`),
            ).resolves.toEqual({ accountid: account['accountid'], name: 'Contoso' });

            await expect(dataverseAPI.queryData('opportunities')).rejects.toThrow(
                "0x80060888: Resource not found for the segment 'opportunities'.",
            );
            await expect(dataverseAPI.getSolutions(['uniquename'])).rejects.toThrow(
                "0x80060888: Resource not found for the segment 'solutions'.",
            );
        });

        it('Should query the metadata with OData', async () => {
            await expect(
                dataverseAPI.queryData("EntityDefinitions(LogicalName='account')?$select=LogicalName,EntitySetName"),
            ).resolves.toEqual({ MetadataId: ACCOUNT_TABLE_ID, LogicalName: 'account', EntitySetName: 'accounts' });

            const optionSet = await dataverseAPI.queryData(
                "EntityDefinitions(LogicalName='account')/Attributes(LogicalName='industrycode')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata/OptionSet",
            );
            expect(optionSet).toMatchObject({
                OptionSetType: 'Picklist',
                Options: [
                    { Value: 1, Label: { UserLocalizedLabel: { Label: 'Accounting', LanguageCode: 1033 } } },
                    { Value: 2, Label: { UserLocalizedLabel: { Label: 'Consulting', LanguageCode: 1033 } } },
                ],
            });

            await expect(dataverseAPI.queryData('EntityDefinitions?$filter=IsCustomEntity eq true')).rejects.toThrow(
                '0x80040216: $filter on EntityDefinitions is not supported by the mock.',
            );
        });
    });

    describe('metadata', () => {
        it('Should return the table definitions', async () => {
            const byName = await dataverseAPI.getEntityMetadata('account', true, ['LogicalName', 'DisplayName']);
            expect(byName).toEqual({
                MetadataId: ACCOUNT_TABLE_ID,
                LogicalName: 'account',
                DisplayName: {
                    LocalizedLabels: [{ Label: 'Account', LanguageCode: 1033 }],
                    UserLocalizedLabel: { Label: 'Account', LanguageCode: 1033 },
                },
            });
            await expect(dataverseAPI.getEntityMetadata(ACCOUNT_TABLE_ID, false, ['LogicalName'])).resolves.toEqual({
                MetadataId: ACCOUNT_TABLE_ID,
                LogicalName: 'account',
            });
            const full = await dataverseAPI.getEntityMetadata('account', true);
            expect(full).not.toHaveProperty('Attributes');
            expect(full['DisplayCollectionName'].UserLocalizedLabel.Label).toBe('Accounts');

            await expect(dataverseAPI.getEntityMetadata('missing', true)).rejects.toThrow(
                "0x80040217: Could not find entity with LogicalName = 'missing'.",
            );

            const all = await dataverseAPI.getAllEntitiesMetadata();
            expect(all.value.map((table) => table['LogicalName'])).toEqual(['account', 'contact']);
            expect(Object.keys(all.value[0]).sort()).toEqual(['DisplayName', 'LogicalName', 'MetadataId']);
        });

        it('Should return the column definitions', async () => {
            const attributes = await dataverseAPI.getEntityRelatedMetadata('account', 'Attributes', [
                'LogicalName',
                'AttributeType',
            ]);
            expect(attributes.value).toContainEqual({
                '@odata.type': '#Microsoft.Dynamics.CRM.LookupAttributeMetadata',
                MetadataId: expect.any(String),
                LogicalName: 'primarycontactid',
                AttributeType: 'Lookup',
            });
            // the virtual name columns are returned too, like in Dataverse
            expect(attributes.value).toContainEqual(
                expect.objectContaining({ LogicalName: 'primarycontactidname', AttributeType: 'Virtual' }),
            );

            const picklists = await dataverseAPI.getEntityRelatedMetadata(
                'account',
                'Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata',
                ['LogicalName'],
            );
            expect(picklists.value.map((attribute: any) => attribute.LogicalName)).toEqual(['industrycode']);

            const name = await dataverseAPI.getEntityRelatedMetadata('account', "Attributes(LogicalName='name')");
            expect(name).toMatchObject({
                '@odata.type': '#Microsoft.Dynamics.CRM.StringAttributeMetadata',
                LogicalName: 'name',
                EntityLogicalName: 'account',
                AttributeType: 'String',
                AttributeTypeName: { Value: 'StringType' },
                DisplayName: { UserLocalizedLabel: { Label: 'Account Name' } },
            });

            await expect(dataverseAPI.getEntityRelatedMetadata('account', 'Keys')).rejects.toThrow(
                '0x80040216: EntityDefinitions/Keys is not supported by the mock.',
            );
        });

        it('Should return the entity set names', async () => {
            await expect(dataverseAPI.getEntitySetName('account')).resolves.toBe('accounts');
            await expect(dataverseAPI.getEntitySetName('missing')).resolves.toBe('missings');
        });
    });

    it('Should use the store of the connection target', async () => {
        const secondary = createStore('0002');
        dataverseAPI = new PptbDataverseApiMock([store, secondary]);
        dataverseAPI._Delay = 0;

        await dataverseAPI.create('account', { name: 'Secondary' }, 'secondary');
        await dataverseAPI.create('account', { name: 'Primary' }, 0);
        expect(store.GetAllRows('account').rows.map((row: any) => row.name)).toEqual(['Primary']);
        expect(secondary.GetAllRows('account').rows.map((row: any) => row.name)).toEqual(['Secondary']);

        await expect(dataverseAPI.queryData('accounts', 2)).rejects.toThrow(
            "No connection is available for the connection target '2'.",
        );
    });

    it('Should build labels and OData types', () => {
        expect(dataverseAPI.buildLabel('Priority')).toEqual({
            '@odata.type': 'Microsoft.Dynamics.CRM.Label',
            LocalizedLabels: [
                {
                    '@odata.type': 'Microsoft.Dynamics.CRM.LocalizedLabel',
                    Label: 'Priority',
                    LanguageCode: 1033,
                    IsManaged: false,
                },
            ],
            UserLocalizedLabel: {
                '@odata.type': 'Microsoft.Dynamics.CRM.LocalizedLabel',
                Label: 'Priority',
                LanguageCode: 1033,
                IsManaged: false,
            },
        });
        expect(dataverseAPI.getAttributeODataType('Integer')).toBe('Microsoft.Dynamics.CRM.IntegerAttributeMetadata');
    });

    it('Should let the unsupported operations be stubbed', async () => {
        await expect(dataverseAPI.execute({ operationName: 'WhoAmI' })).rejects.toThrow(
            'dataverseAPI.execute is not supported by the mock. Stub it with execute.callsFake(...)',
        );
        dataverseAPI.execute.resolves({ UserId: CONTACT_ID });
        await expect(dataverseAPI.execute({ operationName: 'WhoAmI' })).resolves.toEqual({ UserId: CONTACT_ID });
    });

    it('Should run after the delay', async () => {
        jest.useFakeTimers();
        dataverseAPI._Delay = 200;
        const promise = dataverseAPI.create('account', { name: 'Contoso' });
        expect(store.GetAllRows('account').rows).toHaveLength(0);
        jest.advanceTimersByTime(200);
        await promise;
        expect(store.GetAllRows('account').rows).toHaveLength(1);
        jest.useRealTimers();
    });
});
