/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { ComponentFrameworkMockGenerator, LookupPropertyMock } from '../src';
import { OwnerLookup } from './sample-components/OwnerLookup';
import { IInputs, IOutputs } from './sample-components/OwnerLookup/generated/ManifestTypes';

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
        document.body.appendChild(container);
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

        expect(mockGenerator.context.updatedProperties).toStrictEqual(['value']);
        expect(document.body).toMatchSnapshot();
    });
});
