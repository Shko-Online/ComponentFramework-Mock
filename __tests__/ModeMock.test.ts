/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { ComponentFrameworkMockGenerator, LookupPropertyMock } from '../src';
import { OwnerLookup } from '../__sample-components__/OwnerLookup';
import { IInputs, IOutputs } from '../__sample-components__/OwnerLookup/generated/ManifestTypes';

describe('ModeMock', () => {
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
                entityType: 'contact',
                id: '11',
                name: 'Betim Beja',
            },
        });
        mockGenerator.ExecuteInit();
    });

    describe('Full Screen', () => {
        it('updatedProperties should contain fullscreen_open', async () => {
            mockGenerator.context.mode.setFullScreen(true);
            expect(mockGenerator.context.updatedProperties).toContain('fullscreen_open');
        });

        it('updatedProperties should contain fullscreen_close', async () => {
            mockGenerator.context.mode._FullScreen = true;
            mockGenerator.context.mode.setFullScreen(false);
            expect(mockGenerator.context.updatedProperties).toContain('fullscreen_close');
        });

        it('updatedProperties is empty if fullscreen is same', async () => {
            mockGenerator.context.mode.setFullScreen(false);
            expect(mockGenerator.context.updatedProperties).toEqual([]);
        });
    });
});
