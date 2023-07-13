import { Meta, StoryObj } from '@storybook/html';
import { useArgs } from '@storybook/client-api';

import { OwnerLookup as Component } from '../../__sample-components__/OwnerLookup';
import type { IInputs, IOutputs } from '../../__sample-components__/OwnerLookup/generated/ManifestTypes';
import { ComponentFrameworkMockGenerator, LookupPropertyMock } from '../../src';

export default {
    title: "Shko Online's ComponentFramework-Mock/OwnerLookup",
    argTypes: {
        isDisabled: {
            name: 'Disabled',
            control: 'boolean',
            table: {
                category: 'Mode',
                defaultValue: { summary: 'false' },
            },
        },
        isVisible: {
            name: 'Visible',
            control: 'boolean',
            table: {
                category: 'Mode',
                defaultValue: { summary: 'true' },
            },
        },
    },
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/html/configure/story-layout
        layout: 'fullscreen',
        backgrounds: {
            values: [{ name: 'white', value: '#fff' }],
        },
    },
} as Meta<StoryArgs>;

interface StoryArgs {
    isDisabled: boolean;
    isVisible: boolean;
    value: ComponentFramework.LookupValue;
}

const renderGenerator = () => {
    let container: HTMLDivElement;
    let mockGenerator: ComponentFrameworkMockGenerator<IInputs, IOutputs>;

    return function () {
        const [args, updateArgs] = useArgs<StoryArgs>();
        if (!container) {
            container = document.createElement('div');
            mockGenerator = new ComponentFrameworkMockGenerator(
                Component,
                {
                    value: LookupPropertyMock,
                },
                container,
            );

            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context._SetCanvasItems({
                value: { entityType: 'account', id: 'my-id' },
            });

            mockGenerator.onOutputChanged.callsFake(() => {
                mockGenerator.context._parameters.value._Refresh();
                updateArgs({
                    value: mockGenerator.context._parameters.value.raw
                        ? mockGenerator.context._parameters.value.raw[0]
                        : undefined,
                });
            });

            mockGenerator.ExecuteInit();
        }

        if (mockGenerator) {
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context._parameters.value._SetValue(args.value);

            mockGenerator.ExecuteUpdateView();
        }

        return container;
    };
};

export const OwnerLookup = {
    render: renderGenerator(),
} as StoryObj<StoryArgs>;
