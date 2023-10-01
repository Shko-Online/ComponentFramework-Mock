import { Meta, StoryObj } from '@storybook/html';
import { useArgs } from '@storybook/client-api';

import { ContainerSize as Component } from '../../__sample-components__/ContainerSize';
import type { IInputs, IOutputs } from '../../__sample-components__/ContainerSize/generated/ManifestTypes';
import { ComponentFrameworkMockGenerator, LookupPropertyMock, TwoOptionsPropertyMock } from '../../src';

export default {
    title: "Shko Online's ComponentFramework-Mock/ContainerSize",
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
        trackContainer: {
            defaultValue: false,
            name: 'Track Container',
            control: 'boolean',
            table: {
                category: 'Parameters',
                defaultValue: { summary: 'true' },
            },
        }
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
    trackContainer: boolean;
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
                    trackContainer: TwoOptionsPropertyMock,
                },
                container,
            );

            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context._SetCanvasItems({
                trackContainer: args.trackContainer,
            });

            mockGenerator.ExecuteInit();
        }

        if (mockGenerator) {
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context._parameters.trackContainer._SetValue(args.trackContainer);

            mockGenerator.ExecuteUpdateView();
        }

        return container;
    };
};

export const ContainerSize = {
    render: renderGenerator(),
    args: {
        isDisabled: false,
        isVisible: true,
        trackContainer: true,
    },
} as StoryObj<StoryArgs>;
