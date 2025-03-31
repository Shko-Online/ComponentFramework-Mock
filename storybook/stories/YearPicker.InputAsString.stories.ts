import type { Meta, StoryObj } from '@storybook/html';
import type { IInputs, IOutputs } from '../../__sample-components__/YearPickerDateOrString/generated/ManifestTypes';
import type { PCFStoryArgs } from './PCFStoryArgs';

import { useArgs, useEffect } from '@storybook/preview-api';
import { YearPicker as Component } from '../../__sample-components__/YearPickerDateOrString';
import { ComponentFrameworkMockGenerator, StringPropertyMock, EnumPropertyMock } from '../../src';

interface StoryArgs extends PCFStoryArgs {
    value: string;
}

export default {
    title: "Shko Online's ComponentFramework-Mock/Year Picker as String",
    argTypes: {
        value: {
            name: 'Value',
            control: 'text',
        },
    },
} as Meta<StoryArgs>;

const renderGenerator = () => {
    let container: HTMLDivElement | null;
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
                    value: StringPropertyMock,
                    enum: EnumPropertyMock,
                },
                container,
            );

            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context._SetCanvasItems({
                value: args.value,
            });

            mockGenerator.onOutputChanged.callsFake(({ value }) => {
                mockGenerator.context._parameters.value._Refresh();
                console.log(value);
                updateArgs({
                    value
                });
            });

            mockGenerator.ExecuteInit();
        }

        if (mockGenerator) {
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.UpdateValues({
                value: args.value,
            });

            mockGenerator.ExecuteUpdateView();
        }
        return container;
    };
};

export const YearPickerasString = {
    render: renderGenerator(),
    args: {
        value: new Date().getFullYear().toString(),
    },
} as StoryObj<StoryArgs>;
