/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { ComponentFrameworkMockGenerator, DateTimePropertyMock } from '../src';
import { YearPicker } from '../__sample-components__/YearPicker';
import { IInputs, IOutputs } from '../__sample-components__/YearPicker/generated/ManifestTypes';

describe('YearPicker', () => {
    let mockGenerator: ComponentFrameworkMockGenerator<IInputs, IOutputs>;
    beforeEach(() => {
        const container = document.createElement('div');
        mockGenerator = new ComponentFrameworkMockGenerator(
            YearPicker,
            {
                value: DateTimePropertyMock,
            },
            container,
        );
        mockGenerator.context._SetCanvasItems( {
            value: new Date(2023,0,1)
        });
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = null;
    })

    it('Should render date year', () => {
        mockGenerator.ExecuteInit();
        mockGenerator.ExecuteUpdateView();
        expect(mockGenerator.container).toMatchSnapshot();
    });

    it('Should contain value in updatedProperties', () => {
        mockGenerator.ExecuteInit();
        mockGenerator.ExecuteUpdateView();

        const input = mockGenerator.container.getElementsByTagName('input')[0];
        input.value = '2021';
        var evt = document.createEvent('Event');
        evt.initEvent('input', false, true);      
        input.dispatchEvent(evt);

        expect(mockGenerator.context.updatedProperties).toStrictEqual(['value']);
        expect(document.body).toMatchSnapshot();
    });
});
