import type { Meta, StoryObj } from '@storybook/html';
import type { IInputs, IOutputs } from '../../__sample-components__/YearPickerDateOrString/generated/ManifestTypes';
import type { PCFStoryArgs } from './PCFStoryArgs';

import { useArgs, useEffect } from '@storybook/preview-api';
import { YearPicker as Component } from '../../__sample-components__/YearPickerDateOrString';
import { ComponentFrameworkMockGenerator, DateTimePropertyMock, EnumPropertyMock } from '../../src';

interface StoryArgs extends PCFStoryArgs {
    value: Date;
}

export default {
    title: "Shko Online's ComponentFramework-Mock/Year Picker as Date",
    argTypes: {
        value: {
            name: 'Value',
            control: 'date',
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
        const valueAsDate = Number.isInteger(args.value) ? new Date(args.value) : args.value;
        if (!container) {
            container = document.createElement('div');
            mockGenerator = new ComponentFrameworkMockGenerator(
                Component,
                {
                    value: DateTimePropertyMock,
                    enum: EnumPropertyMock,
                },
                container,
            );

            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context._SetCanvasItems({
                value: valueAsDate,
            });

            mockGenerator.onOutputChanged.callsFake(({ value }) => {
                mockGenerator.context._parameters.value._Refresh();
                console.log(value);
                updateArgs({
                    value: (value as Date)?.getTime() as any,
                });
            });

            mockGenerator.ExecuteInit();
        }

        if (mockGenerator) {
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.UpdateValues({
                value: valueAsDate,
            });

            mockGenerator.ExecuteUpdateView();
        }
        return container;
    };
};

export const YearPickerasDate = {
    render: renderGenerator(),
    args: {
        value: new Date(),
    },
} as StoryObj<StoryArgs>;
