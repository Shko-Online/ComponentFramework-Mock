import type { Meta, StoryObj } from '@storybook/html';
import type { IInputs, IOutputs } from '../../__sample-components__/ContainerSize/generated/ManifestTypes';

import { useArgs, useEffect } from '@storybook/preview-api';
import { ContainerSize as Component } from '../../__sample-components__/ContainerSize';
import { ComponentFrameworkMockGenerator, TwoOptionsPropertyMock } from '../../src';

export default {
    title: "Shko Online's ComponentFramework-Mock/ContainerSize",
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
    }
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
        const [args, ] = useArgs<StoryArgs>();
        useEffect(
            () => () => {
                container = null;
                mockGenerator.control.destroy();
            },
            [],
        );
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
        trackContainer: true,
    },
} as StoryObj<StoryArgs>;
