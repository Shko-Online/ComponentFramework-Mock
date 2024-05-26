/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { WebAPIControl as Control } from '../../__sample-components__/WebAPIControl';
import { IInputs, IOutputs } from '../../__sample-components__/WebAPIControl/generated/ManifestTypes';
import { AttributeType, ComponentFrameworkMockGenerator, ShkoOnline, StringPropertyMock } from '../../src';

jest.useFakeTimers();

describe('WebAPIControl', () => {
    let mockGenerator: ComponentFrameworkMockGenerator<IInputs, IOutputs>;
    beforeEach(() => {
        const container = document.createElement('div');
        mockGenerator = new ComponentFrameworkMockGenerator(
            Control,
            {
                stringProperty: StringPropertyMock
            },
            container,
        );
        mockGenerator.metadata.initMetadata([
            { LogicalName: 'account', EntitySetName: 'accounts', PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name', Attributes: [
                {
                    AttributeType: AttributeType.Uniqueidentifier,
                    LogicalName: 'accountid',
                    SchemaName: 'AccountId'
                } as ShkoOnline.AttributeMetadata,
                {
                    AttributeType: AttributeType.String,
                    LogicalName: 'name',
                    SchemaName: 'Name'
                } as ShkoOnline.StringAttributeMetadata,
                {
                    AttributeType: AttributeType.Money,
                    LogicalName: 'revenue',
                    SchemaName: 'revenue'
                } as ShkoOnline.AttributeMetadata
            ] },
        ]);

        mockGenerator.context._SetCanvasItems({
            stringProperty: '',
        });
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = null;
    });

    it('Should render', () => {
        mockGenerator.ExecuteInit();
        mockGenerator.ExecuteUpdateView();
        expect(mockGenerator.container).toMatchSnapshot();
    });

    it('Should create record', async () => {
        mockGenerator.ExecuteInit();
        mockGenerator.ExecuteUpdateView();

        const button = mockGenerator.container.getElementsByTagName('button')[0];
        var evt = document.createEvent('Event');
        evt.initEvent('click', false, true);
        button.dispatchEvent(evt);

        await jest.runAllTimersAsync();

        var result_container = mockGenerator.container.getElementsByClassName('result_container')[0];

        expect(result_container.innerHTML).toContain('Created new account record with below values:');
        // expect(document.body).toMatchSnapshot();
    });

  
});
