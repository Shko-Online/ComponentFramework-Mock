/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { ComponentFrameworkMockGenerator, LookupPropertyMock } from '../src';
import { OwnerLookup } from '../__sample-components__/OwnerLookup';
import { IInputs, IOutputs } from '../__sample-components__/OwnerLookup/generated/ManifestTypes';
import userMetadataJson from './data/systemUser.json';
import userDataJson from './data/systemUserData.json';
import betimBeja from './data/betimBeja.json';

const userFetch = `
<fetch>
    <entity name="systemuser">
        <attribute name="systemuserid" />
        <attribute name="firstname" />
        <attribute name="lastname" />
    </entity>
</fetch>
`;

describe('WebApiMock', () => {
    let mockGenerator: ComponentFrameworkMockGenerator<IInputs, IOutputs>;
    beforeEach(() => {
        const container = document.createElement('div');
        mockGenerator = new ComponentFrameworkMockGenerator(
            OwnerLookup,
            {
                value: LookupPropertyMock,
            },
            container,
        );
        mockGenerator.context.webAPI._Delay = 0;
        mockGenerator.metadata.initMetadata([JSON.parse(JSON.stringify(userMetadataJson))]);
        mockGenerator.metadata.initItems(JSON.parse(JSON.stringify(userDataJson)));
    });

    it('Should reject retrieve if no metadata', async () => {
        await expect(
            mockGenerator.context.webAPI.retrieveRecord('account', '48268759-f226-ed11-9db1-000d3a264915'),
        ).rejects.toEqual({
            message: 'Entity account does not exist.',
        });
    });

    it('Should reject retrieve if row not found', async () => {
        await expect(
            mockGenerator.context.webAPI.retrieveRecord('systemuser', '48268759-f226-ed11-9db2-000d3a264915'),
        ).rejects.toEqual({
            message: "Could not find record with id: '48268759-f226-ed11-9db2-000d3a264915' for entity: 'systemuser'.",
        });
    });

    it('Should retrieve record when row is found', async () => {
        const parsedBetim = JSON.parse(JSON.stringify(betimBeja));
        delete parsedBetim['@odata.etag'];
        Object.keys(parsedBetim)
            .filter((key) => parsedBetim[key] === null)
            .forEach((key) => {
                delete parsedBetim[key];
            }); // ToDo: Find the logic of returning null values
        const retrieved = await mockGenerator.context.webAPI.retrieveRecord(
            'systemuser',
            '682d1eb3-0ba4-ed11-aad1-000d3add5311',
        );
        Object.keys(retrieved)
            .filter((key) => retrieved[key] === null)
            .forEach((key) => {
                delete retrieved[key];
            }); // ToDo: Find the logic of returning null values
        retrieved['ownerid'] = '682d1eb3-0ba4-ed11-aad1-000d3add5311'; // ToDo: How is this calculated?
        expect(retrieved).toEqual(parsedBetim);
    });

    it('Should retrieve records selected attributes', async () => {
        const { fullname } = JSON.parse(JSON.stringify(betimBeja));

        await expect(
            mockGenerator.context.webAPI.retrieveRecord(
                'systemuser',
                '682d1eb3-0ba4-ed11-aad1-000d3add5311',
                '?$select=fullname',
            ),
        ).resolves.toEqual({ fullname });
    });

    it('Should reject delete if no metadata', async () => {
        await expect(
            mockGenerator.context.webAPI.deleteRecord('account', '48268759-f226-ed11-9db1-000d3a264915'),
        ).rejects.toEqual({
            message: 'Entity account does not exist.',
        });
    });

    it('Should reject delete if row not found', async () => {
        await expect(
            mockGenerator.context.webAPI.deleteRecord('systemuser', '48268759-f226-ed11-9db2-000d3a264915'),
        ).rejects.toEqual({
            message: "Could not find record with id: '48268759-f226-ed11-9db2-000d3a264915' for entity: 'systemuser'.",
        });
    });

    it('Should delete record when row is found', async () => {
        delete betimBeja['@odata.etag'];

        await expect(
            mockGenerator.context.webAPI.deleteRecord('systemuser', '682d1eb3-0ba4-ed11-aad1-000d3add5311'),
        ).resolves.toEqual({
            name: 'Betim Beja',
            id: '682d1eb3-0ba4-ed11-aad1-000d3add5311',
            entityType: 'systemuser',
        });
    });

    it('Should reject create if no metadata', async () => {
        await expect(
            mockGenerator.context.webAPI.createRecord('account', { accountid: '48268759-f226-ed11-9db1-000d3a264915' }),
        ).rejects.toEqual({
            message: 'Entity account does not exist.',
        });
    });

    it('Should create if metadata available', async () => {
        const createdUser = await mockGenerator.context.webAPI.createRecord('systemuser', {
            firstname: 'Betim',
            lastname: 'Beja',
        });
        expect(createdUser.id).not.toBeNull();
        expect(createdUser.id).not.toBeUndefined();
        const userData = mockGenerator.metadata.GetRow('systemuser', createdUser.id);
        expect(userData.row['firstname']).toEqual('Betim');
    });

    describe('RetrieveMultipleRecords', () => {
        describe('FetchXML', () => {
            it('Should retrieve multiple records using FetchXml', async () => {
                const result = await mockGenerator.context.webAPI.retrieveMultipleRecords(
                    'systemuser',
                    '?fetchXml=' + encodeURIComponent(userFetch),
                );

                const betimBeja = result.entities.find(
                    (e) => e['systemuserid'] === '682d1eb3-0ba4-ed11-aad1-000d3add5311',
                );
                expect(betimBeja).toEqual({
                    systemuserid: '682d1eb3-0ba4-ed11-aad1-000d3add5311',
                    firstname: 'Betim',
                    lastname: 'Beja',
                });
            });
        });

        describe('SavedQuery', () => {
            it('Should reject if savedquery does not exist', async () => {
                mockGenerator.metadata.AddRow('savedquery', {
                    savedqueryid: mockGenerator.metadata._newId(),
                    name: 'Saved Query',
                    returnedtypecode: 'systemuser',
                    fetchxml: userFetch,
                });

                const savedQueryId = mockGenerator.metadata._newId();

                await expect(
                    mockGenerator.context.webAPI.retrieveMultipleRecords('systemuser', `?savedQuery=${savedQueryId}`),
                ).rejects.toEqual({
                    code: '0x80040217',
                    message: `Entity 'savedquery' With Id = ${savedQueryId} Does Not Exist`,
                });
            });

            it("Should reject if return type doesn't match", async () => {
                const savedQueryId = mockGenerator.metadata._newId();
                mockGenerator.metadata.AddRow('savedquery', {
                    savedqueryid: savedQueryId,
                    name: 'Saved Query',
                    returnedtypecode: 'contact',
                    fetchxml: userFetch,
                });

                await expect(
                    mockGenerator.context.webAPI.retrieveMultipleRecords('systemuser', `?savedQuery=${savedQueryId}`),
                ).rejects.toEqual({
                    code: '0x80060888',
                    message: 'No Query View exists with the Given Query Id on the Entity Set.',
                });
            });

            it('Should retrieve multiple records using savedQuery', async () => {
                const savedQueryId = mockGenerator.metadata._newId();
                mockGenerator.metadata.AddRow('savedquery', {
                    savedqueryid: savedQueryId,
                    name: 'Saved Query',
                    returnedtypecode: 'systemuser',
                    fetchxml: userFetch,
                });

                const result = await mockGenerator.context.webAPI.retrieveMultipleRecords(
                    'systemuser',
                    `?savedQuery=${savedQueryId}`,
                );

                const betimBeja = result.entities.find(
                    (e) => e['systemuserid'] === '682d1eb3-0ba4-ed11-aad1-000d3add5311',
                );
                expect(betimBeja).toEqual({
                    systemuserid: '682d1eb3-0ba4-ed11-aad1-000d3add5311',
                    firstname: 'Betim',
                    lastname: 'Beja',
                });
            });
        });

        describe('UserQuery', () => {
            it('Should reject if userquery does not exist', async () => {
                mockGenerator.metadata.AddRow('userquery', {
                    userqueryid: mockGenerator.metadata._newId(),
                    name: 'User Query',
                    returnedtypecode: 'systemuser',
                    fetchxml: userFetch,
                });

                const userQueryId = mockGenerator.metadata._newId();

                await expect(
                    mockGenerator.context.webAPI.retrieveMultipleRecords('systemuser', `?userQuery=${userQueryId}`),
                ).rejects.toEqual({
                    code: '0x80040217',
                    message: `Entity 'userquery' With Id = ${userQueryId} Does Not Exist`,
                });
            });

            it("Should reject if return type doesn't match", async () => {
                const userQueryId = mockGenerator.metadata._newId();
                mockGenerator.metadata.AddRow('userquery', {
                    userqueryid: userQueryId,
                    name: 'User Query',
                    returnedtypecode: 'contact',
                    fetchxml: userFetch,
                });

                await expect(
                    mockGenerator.context.webAPI.retrieveMultipleRecords('systemuser', `?userQuery=${userQueryId}`),
                ).rejects.toEqual({
                    code: '0x80060888',
                    message: 'No Query View exists with the Given Query Id on the Entity Set.',
                });
            });

            it('Should retrieve multiple records using userQuery', async () => {
                const userQueryId = mockGenerator.metadata._newId();
                mockGenerator.metadata.AddRow('userquery', {
                    userqueryid: userQueryId,
                    name: 'User Query',
                    returnedtypecode: 'systemuser',
                    fetchxml: userFetch,
                });

                const result = await mockGenerator.context.webAPI.retrieveMultipleRecords(
                    'systemuser',
                    `?userQuery=${userQueryId}`,
                );

                const betimBeja = result.entities.find(
                    (e) => e['systemuserid'] === '682d1eb3-0ba4-ed11-aad1-000d3add5311',
                );
                expect(betimBeja).toEqual({
                    systemuserid: '682d1eb3-0ba4-ed11-aad1-000d3add5311',
                    firstname: 'Betim',
                    lastname: 'Beja',
                });
            });
        });

        describe('OData', () => {
            it('Should retrieve multiple records using OData', async () => {
                const result = await mockGenerator.context.webAPI.retrieveMultipleRecords(
                    'systemuser',
                    '?$select=systemuserid,firstname,lastname',
                );

                const betimBeja = result.entities.find(
                    (e) => e['systemuserid'] === '682d1eb3-0ba4-ed11-aad1-000d3add5311',
                );
                expect(betimBeja).toEqual({
                    systemuserid: '682d1eb3-0ba4-ed11-aad1-000d3add5311',
                    firstname: 'Betim',
                    lastname: 'Beja',
                });
            });
        });
    });

    it('Should update record', async () => {
        const updated = await mockGenerator.context.webAPI.updateRecord(
            'systemuser',
            '682d1eb3-0ba4-ed11-aad1-000d3add5311',
            {
                firstname: 'Betim2',
            },
        );

        const userData = mockGenerator.metadata.GetRow('systemuser', updated.id);
        expect(userData.row['firstname']).toEqual('Betim2');
    });
});
