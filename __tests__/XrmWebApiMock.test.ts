/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach, jest, afterEach } from '@jest/globals';
import { AttributeType, DataverseErrorCode, MetadataStore, ShkoOnline, XrmWebApiMock } from '../src';

const CONTACT_ID = '00000000-0000-0000-0000-000000000001';

describe('XrmWebApiMock', () => {
    let store: MetadataStore;
    let webApi: XrmWebApiMock;

    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        let i = 0;
        store = new MetadataStore({ newId: () => `00000000-0000-0000-0001-${String(++i).padStart(12, '0')}` });
        store.initMetadata([
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
                    { LogicalName: 'primarycontactid', AttributeType: AttributeType.Lookup },
                ],
            } as unknown as ShkoOnline.EntityMetadata,
        ]);
        store.AddRow('contact', { contactid: CONTACT_ID, fullname: 'Jane Doe' });
        webApi = new XrmWebApiMock(store);
        webApi._Delay = 0;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('Should create, retrieve, update and delete a record', async () => {
        const created = await webApi.createRecord('account', {
            name: 'Contoso',
            'primarycontactid@odata.bind': `/contacts(${CONTACT_ID})`,
        });
        expect(created).toEqual({ entityType: 'account', id: expect.any(String) });

        await expect(
            webApi.retrieveRecord('account', created.id, '?$select=name,_primarycontactid_value'),
        ).resolves.toEqual({
            accountid: created.id,
            name: 'Contoso',
            _primarycontactid_value: CONTACT_ID,
            '_primarycontactid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'contact',
            '_primarycontactid_value@OData.Community.Display.V1.FormattedValue': 'Jane Doe',
        });

        await expect(webApi.updateRecord('account', created.id, { name: 'Contoso Ltd' })).resolves.toEqual({
            entityType: 'account',
            id: created.id,
        });
        await expect(webApi.retrieveRecord('account', created.id, '?$select=name')).resolves.toEqual({
            accountid: created.id,
            name: 'Contoso Ltd',
        });

        await expect(webApi.deleteRecord('account', created.id)).resolves.toEqual({
            entityType: 'account',
            id: created.id,
            name: 'Contoso Ltd',
        });
        await expect(webApi.retrieveRecord('account', created.id)).rejects.toEqual({
            errorCode: 0x80040217,
            message: `Could not find record with id: '${created.id}' for entity: 'account'.`,
        });
    });

    it('Should retrieve multiple records with paging', async () => {
        for (const name of ['A', 'B', 'C']) {
            await webApi.createRecord('account', { name });
        }
        const first = await webApi.retrieveMultipleRecords('account', '?$select=name&$orderby=name', 2);
        expect(first.entities.map((e) => e['name'])).toEqual(['A', 'B']);

        const second = await webApi.retrieveMultipleRecords('account', '?' + first.nextLink?.split('?')[1], 2);
        expect(second.entities.map((e) => e['name'])).toEqual(['C']);
        expect(second.nextLink).toBeUndefined();
    });

    it('Should retrieve multiple records with FetchXML', async () => {
        await webApi.createRecord('account', { name: 'Contoso' });
        await webApi.createRecord('account', { name: 'Fabrikam' });
        const fetchXml = `<fetch><entity name="account"><attribute name="name" /><filter><condition attribute="name" operator="begins-with" value="Fab" /></filter></entity></fetch>`;
        const result = await webApi.retrieveMultipleRecords('account', '?fetchXml=' + encodeURIComponent(fetchXml));
        expect(result.entities.map((e) => e['name'])).toEqual(['Fabrikam']);
    });

    describe('errors', () => {
        it('Should reject for missing tables', async () => {
            await expect(webApi.createRecord('missing', {})).rejects.toEqual({
                errorCode: DataverseErrorCode.InvalidRequest,
                message: 'Entity missing does not exist.',
            });
        });

        it('Should reject for missing rows', async () => {
            await expect(webApi.deleteRecord('account', CONTACT_ID)).rejects.toEqual({
                errorCode: 2147746327,
                message: `Could not find record with id: '${CONTACT_ID}' for entity: 'account'.`,
            });
        });

        it('Should reject invalid queries', async () => {
            await expect(webApi.retrieveMultipleRecords('account', '?$filter=missing eq 1')).rejects.toEqual({
                errorCode: DataverseErrorCode.InvalidRequest,
                message: "Could not find a property named 'missing' on type 'Microsoft.Dynamics.CRM.account'.",
            });
        });

        it('Should use the code of OData syntax errors', async () => {
            const error = await webApi.retrieveMultipleRecords('account', "?$filter=name in ('a')").catch((e) => e);
            expect(error).toEqual({ errorCode: 0x80060888, message: expect.stringContaining('$filter') });
        });

        it('Should reject invalid @odata.bind', async () => {
            await expect(webApi.createRecord('account', { 'primarycontactid@odata.bind': 'contacts' })).rejects.toEqual(
                {
                    errorCode: DataverseErrorCode.InvalidRequest,
                    message: "Invalid @odata.bind value 'contacts'",
                },
            );
        });

        it('Should report the stored query codes', async () => {
            const id = '00000000-0000-0000-0000-0000000000aa';
            await expect(webApi.retrieveMultipleRecords('account', `?savedQuery=${id}`)).rejects.toEqual({
                errorCode: 0x80040217,
                message: `Entity 'savedquery' With Id = ${id} Does Not Exist`,
            });
        });
    });

    it('Should share the stubs with online and offline', async () => {
        expect(webApi.online.createRecord).toBe(webApi.createRecord);
        expect(webApi.offline.retrieveRecord).toBe(webApi.retrieveRecord);
        expect(webApi.isAvailableOffline('account')).toBe(false);
    });

    it('Should let execute be stubbed', async () => {
        await expect(webApi.online.execute({})).rejects.toEqual({
            errorCode: DataverseErrorCode.Unexpected,
            message: 'Xrm.WebApi.online.execute is not supported by the mock. Stub it with execute.callsFake(...)',
        });
        webApi.online.execute.resolves({ ok: true });
        await expect(webApi.online.execute({})).resolves.toEqual({ ok: true });
    });

    it('Should run after the delay', async () => {
        jest.useFakeTimers();
        webApi._Delay = 200;
        let settled = false;
        const promise = webApi.createRecord('account', { name: 'Contoso' }).then(() => (settled = true));
        expect(store.GetAllRows('account').rows).toHaveLength(0);
        jest.advanceTimersByTime(200);
        await promise;
        expect(settled).toBe(true);
        expect(store.GetAllRows('account').rows).toHaveLength(1);
        jest.useRealTimers();
    });
});
