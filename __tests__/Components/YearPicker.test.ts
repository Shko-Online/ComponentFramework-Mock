/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { YearPicker } from '../../__sample-components__/YearPicker';
import { IInputs, IOutputs } from '../../__sample-components__/YearPicker/generated/ManifestTypes';
import { ComponentFrameworkMockGenerator, DateTimePropertyMock, EnumPropertyMock } from '../../src';

describe('YearPicker', () => {
    let mockGenerator: ComponentFrameworkMockGenerator<IInputs, IOutputs>;
    beforeEach(() => {
        const container = document.createElement('div');
        mockGenerator = new ComponentFrameworkMockGenerator(
            YearPicker,
            {
                value: DateTimePropertyMock,
                enum: EnumPropertyMock,
            },
            container,
        );
        mockGenerator.context._SetCanvasItems({
            value: new Date(2023, 0, 1),
            enum: 'Yes',
        });
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = null;
    });

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

        expect(mockGenerator.context.updatedProperties).toStrictEqual(['value', 'parameters']);
        expect(mockGenerator.onOutputChanged.called).toBeTruthy();
        expect(mockGenerator.context._parameters.value.raw).toEqual(new Date(2021, 0, 1));
        expect(document.body).toMatchSnapshot();
    });

    it('Should update the value from the framework', () => {
        mockGenerator.ExecuteInit();
        mockGenerator.ExecuteUpdateView();
        mockGenerator.context._parameters.value._SetValue(new Date(2021, 0, 1));
        mockGenerator.context._parameters.value._Refresh();
        expect(mockGenerator.context._parameters.value.raw).toEqual(new Date(2021, 0, 1));
    });

    it('Should accept enum value', () => {
        mockGenerator.ExecuteInit();
        mockGenerator.ExecuteUpdateView();
        expect(mockGenerator.context._parameters.enum.raw).toEqual('Yes');
    });
});
