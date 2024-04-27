import type { Meta, StoryObj } from '@storybook/html';
import type { IInputs, IOutputs } from '../../__sample-components__/MultiSelectOptionSet/generated/ManifestTypes';

import { useArgs, useEffect } from '@storybook/preview-api';
import { ContainerSize as Component } from '../../__sample-components__/MultiSelectOptionSet';
import { ComponentFrameworkMockGenerator, MultiSelectOptionSetPropertyMock, ShkoOnline } from '../../src';

import '../../__sample-components__/MultiSelectOptionSet/css/multi-select-optionset.css';

export default {
    title: "Shko Online's ComponentFramework-Mock/MultiSelectOptionSet",
    argTypes: {
        selection: {
            defaultValue: [],
            name: 'Selection',
            options: [0, 1, 2],
            control: {
                type: 'multi-select',
                labels: {
                    0: 'Betim Beja',
                    1: 'Asllan Makaj',
                    2: 'Shko Online',
                },
            },
            table: {
                category: 'Parameters',
                defaultValue: { summary: '[]' },
            },
        },
    },
} as Meta<StoryArgs>;

interface StoryArgs {
    isDisabled: boolean;
    isVisible: boolean;
    selection: number[];
}

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
                    selection: MultiSelectOptionSetPropertyMock,
                },
                container,
            );

            const optionsetMetadata = mockGenerator.metadata.getAttributeMetadata(
                '!CanvasApp',
                'selection',
            ) as ShkoOnline.PickListAttributeMetadata;

            optionsetMetadata.OptionSet.Options = {
                0: { Value: 0, Label: 'Betim Beja' },
                1: { Value: 1, Label: 'Asllan Makaj' },
                2: { Value: 2, Label: 'Shko Online' },
            };

            mockGenerator.metadata.upsertAttributeMetadata('!CanvasApp', optionsetMetadata);

            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context._SetCanvasItems({
                selection: args.selection,
            });

            mockGenerator.onOutputChanged.callsFake(() => {
                updateArgs({ selection: mockGenerator.context._parameters.selection.raw });
            });

            mockGenerator.ExecuteInit();
        }

        if (mockGenerator) {
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.UpdateValues({
                selection: args.selection,
            });

            mockGenerator.ExecuteUpdateView();
        }

        return container;
    };
};

export const MultiSelectOptionSet = {
    render: renderGenerator(),
    args: {
        selection: [],
    },
} as StoryObj<StoryArgs>;
