/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import {
    ComponentFrameworkMockOrchestrator,
    DateTimePropertyMock,
    EnumPropertyMock,
    LookupPropertyMock,
} from '../../src';
import { OwnerLookup as Control1 } from '../../__sample-components__/OwnerLookup';
import { YearPicker as Control2 } from '../../__sample-components__/YearPicker';
import {
    IInputs as IInputs1,
    IOutputs as IOutputs1,
} from '../../__sample-components__/OwnerLookup/generated/ManifestTypes';

import {
    IInputs as IInputs2,
    IOutputs as IOutputs2,
} from '../../__sample-components__/YearPicker/generated/ManifestTypes';

describe('Orchestrator', () => {
    describe('Owner and YearPicker', () => {
        let orchestrator: ComponentFrameworkMockOrchestrator<[IInputs1, IOutputs1, false, IInputs2, IOutputs2, false]>;
        beforeEach(() => {
            const container1 = document.createElement('div');
            const container2 = document.createElement('div');
            orchestrator = new ComponentFrameworkMockOrchestrator([
                [
                    Control1,
                    {
                        value: LookupPropertyMock,
                    },
                    container1,
                ],
                [
                    Control2,
                    {
                        value: DateTimePropertyMock,
                        enum: EnumPropertyMock<'Yes' | 'No'>,
                    },
                    container2,
                ],
            ]);
            orchestrator.mockGenerators[0].context._SetCanvasItems({
                value: {
                    entityType: 'team',
                    id: 'guid1',
                    name: 'Shko Online',
                },
            });
            orchestrator.mockGenerators[0].context.userSettings.userId = 'MyUserId';
            orchestrator.mockGenerators[0].context.userSettings.userName = 'Betim Beja';
            orchestrator.mockGenerators[1].context._SetCanvasItems({
                value: new Date(2023, 0, 1),
                enum: 'Yes',
            });

            document.body.appendChild(container1);
            document.body.appendChild(container2);
        });

        it('Should render lookup value and date year', () => {
            orchestrator.ExecuteInit();

            orchestrator.mockGenerators[0].ExecuteUpdateView();
            orchestrator.mockGenerators[1].ExecuteUpdateView();

            expect(document.body).toMatchSnapshot();
        });

        it('Should update value on click', () => {
            orchestrator.ExecuteInit();
            orchestrator.mockGenerators[0].ExecuteUpdateView();
            orchestrator.mockGenerators[1].ExecuteUpdateView();

            const button = orchestrator.mockGenerators[0].container.getElementsByTagName('button')[0];
            var evt = document.createEvent('Event');
            evt.initEvent('click', false, true);
            button.dispatchEvent(evt);

            const input = orchestrator.mockGenerators[1].container.getElementsByTagName('input')[0];
            input.value = '2021';
            var evt = document.createEvent('Event');
            evt.initEvent('input', false, true);
            input.dispatchEvent(evt);

            expect(orchestrator.mockGenerators[0].context.updatedProperties).toStrictEqual(['value', 'parameters']);

            expect(orchestrator.mockGenerators[1].context.updatedProperties).toStrictEqual(['value', 'parameters']);
            expect(orchestrator.mockGenerators[1].onOutputChanged.called).toBeTruthy();
            expect(orchestrator.mockGenerators[1].context._parameters.value.raw).toEqual(new Date(2021, 0, 1));

            expect(document.body).toMatchSnapshot();
        });

        afterEach(() => {
            document.body.innerHTML = null;
        });
    });
});
