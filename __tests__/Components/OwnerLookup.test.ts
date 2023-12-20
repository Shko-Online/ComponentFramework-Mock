/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { ComponentFrameworkMockGenerator, LookupPropertyMock } from '../../src';
import { OwnerLookup } from '../../__sample-components__/OwnerLookup';
import { IInputs, IOutputs } from '../../__sample-components__/OwnerLookup/generated/ManifestTypes';

describe('OwnerLookup', () => {
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
        mockGenerator.context._SetCanvasItems({
            value: {
                entityType: 'team',
                id: 'guid1',
                name: 'Shko Online',
            },
        });
        mockGenerator.context.userSettings.userId = 'MyUserId';
        mockGenerator.context.userSettings.userName = 'Betim Beja';
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = null;
    });

    it('Should render lookup value', () => {
        mockGenerator.ExecuteInit();
        mockGenerator.ExecuteUpdateView();
        expect(mockGenerator.container).toMatchSnapshot();
    });

    it('Should update value on click', () => {
        mockGenerator.ExecuteInit();
        mockGenerator.ExecuteUpdateView();

        const button = mockGenerator.container.getElementsByTagName('button')[0];
        var evt = document.createEvent('Event');
        evt.initEvent('click', false, true);
        button.dispatchEvent(evt);

        expect(mockGenerator.context.updatedProperties).toStrictEqual(['value', 'parameters']);
        expect(document.body).toMatchSnapshot();
    });
});
