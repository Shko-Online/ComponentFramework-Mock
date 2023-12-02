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
});
