import type { Meta, StoryObj } from '@storybook/html';
import type { IInputs, IOutputs } from '../../__sample-components__/ContainerSizeVirtual/generated/ManifestTypes';
import { useArgs } from '@storybook/client-api';
import ReactDOM from 'react-dom';

import { ContainerSize as Component } from '../../__sample-components__/ContainerSizeVirtual';
import { ComponentFrameworkMockGeneratorReact, TwoOptionsPropertyMock } from '../../src';

export default {
    title: "Shko Online's ComponentFramework-Mock/ContainerSizeReact",
    argTypes: {       
        trackContainer: {
            defaultValue: false,
            name: 'Track Container',
            control: 'boolean',
            table: {
                category: 'Parameters',
                defaultValue: { summary: 'true' },
            },
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
    let mockGenerator: ComponentFrameworkMockGeneratorReact<IInputs, IOutputs>;

    return function () {
        const [args] = useArgs<StoryArgs>();
        if (!container) {
            container = document.createElement('div');
            mockGenerator = new ComponentFrameworkMockGeneratorReact(Component, {
                trackContainer: TwoOptionsPropertyMock,
            });

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
            ReactDOM.render(mockGenerator.ExecuteUpdateView(), container);
        }

        return container;
    };
};

export const ContainerSizeReact = {
    render: renderGenerator(),
    args: {
        isDisabled: false,
        isVisible: true,
        trackContainer: true,
    },
} as StoryObj<StoryArgs>;
