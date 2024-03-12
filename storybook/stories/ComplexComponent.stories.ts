import type { Meta, StoryObj } from '@storybook/html';
import type { IInputs, IOutputs } from '../../__sample-components__/ComplexControl/generated/ManifestTypes';
import type { PCFStoryArgs } from './PCFStoryArgs';

import { useArgs, useEffect } from '@storybook/preview-api';
import { action } from '@storybook/addon-actions';
import { ComplexControl as Component } from '../../__sample-components__/ComplexControl';
import { ComponentFrameworkMockGenerator, TwoOptionsPropertyMock } from '../../src';

interface StoryArgs extends PCFStoryArgs {
    inputProperty: boolean;
    boundProperty: boolean;
}

export default {
    title: "Shko Online's ComponentFramework-Mock/ComplexControl",
    argTypes: {
        inputProperty: {
            defaultValue: false,
            name: 'Input Property',
            control: 'boolean',
        },
        boundProperty: {
            defaultValue: false,
            name: 'Bound Property',
            control: 'boolean',
        },
    },
} as Meta<StoryArgs>;

const renderGenerator = () => {
    let container: HTMLDivElement;
    let mockGenerator: ComponentFrameworkMockGenerator<IInputs, IOutputs>;

    return function () {
        const [args, updateArgs] = useArgs<StoryArgs>();
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
                    boundProperty: TwoOptionsPropertyMock,
                    inputProperty: TwoOptionsPropertyMock,
                },
                container,
                {
                    boundProperty: 'boolean',
                    outputProperty: 'any',
                },
            );

            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context._SetCanvasItems({
                inputProperty: args.inputProperty,
                boundProperty: args.boundProperty,
            });

            mockGenerator.onOutputChanged.callsFake(({ boundProperty, outputProperty }) => {
                action('Output Changed')(outputProperty);
                updateArgs({
                    boundProperty: boundProperty,
                });
            });

            mockGenerator.ExecuteInit();
        }

        if (mockGenerator) {
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context._parameters.boundProperty._SetValue(args.boundProperty);
            mockGenerator.context._parameters.inputProperty._SetValue(args.inputProperty);

            mockGenerator.ExecuteUpdateView();
        }
        return container;
    };
};

export const ComplexControl = {
    render: renderGenerator(),
    args: {
        inputProperty: false,
        boundProperty: true,
    },
} as StoryObj<StoryArgs>;
