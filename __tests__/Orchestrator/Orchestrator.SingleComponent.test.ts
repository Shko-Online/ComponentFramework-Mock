/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { ComponentFrameworkMockOrchestrator, LookupPropertyMock } from '../../src';
import { OwnerLookup as Control1 } from '../../__sample-components__/OwnerLookup';
import {
    IInputs as IInputs1,
    IOutputs as IOutputs1,
} from '../../__sample-components__/OwnerLookup/generated/ManifestTypes';

describe('Orchestrator', () => {
    describe('Owner', () => {
        let orchestrator: ComponentFrameworkMockOrchestrator<[IInputs1, IOutputs1, false]>;
        beforeEach(() => {
            const container1 = document.createElement('div');
            orchestrator = new ComponentFrameworkMockOrchestrator([
                [
                    Control1,
                    {
                        value: LookupPropertyMock,
                    },
                    container1,
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
            document.body.appendChild(container1);
        });

        it('Should render lookup value', () => {
            orchestrator.mockGenerators[0].ExecuteInit();
            orchestrator.mockGenerators[0].ExecuteUpdateView();
            expect(orchestrator.mockGenerators[0].container).toMatchSnapshot();
        });

        it('Should update value on click', () => {
            orchestrator.mockGenerators[0].ExecuteInit();
            orchestrator.mockGenerators[0].ExecuteUpdateView();

            const button = orchestrator.mockGenerators[0].container.getElementsByTagName('button')[0];
            var evt = document.createEvent('Event');
            evt.initEvent('click', false, true);
            button.dispatchEvent(evt);

            expect(orchestrator.mockGenerators[0].context.updatedProperties).toStrictEqual(['value', 'parameters']);
            expect(document.body).toMatchSnapshot();
        });

        afterEach(() => {
            document.body.innerHTML = null;
        });
    });
});
