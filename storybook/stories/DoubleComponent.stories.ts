import type { Meta, StoryObj } from '@storybook/html';
import type { IInputs, IOutputs } from '../../__sample-components__/MultiSelectOptionSet/generated/ManifestTypes';

import { useArgs } from '@storybook/preview-api';
import { ContainerSize as Component } from '../../__sample-components__/MultiSelectOptionSet';
import {
    ComponentFrameworkMockOrchestrator,
    MetadataDB,
    MultiSelectOptionSetPropertyMock,
    ShkoOnline,
} from '../../src';

import '../../__sample-components__/MultiSelectOptionSet/css/multi-select-optionset.css';
import { useEffect } from '@storybook/client-api';

export default {
    title: "Shko Online's ComponentFramework-Mock/DoubleComponent",
    argTypes: {
        selection1: {
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
        selection2: {
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
    selection1: number[];
    selection2: number[];
}

const renderGenerator = () => {
    let container: HTMLDivElement;
    let orchestrator: ComponentFrameworkMockOrchestrator<[IInputs, IOutputs, false, IInputs, IOutputs, false]>;

    return function () {
        const [args, updateArgs] = useArgs<StoryArgs>();
        useEffect(
            () => () => {
                container = null;
                orchestrator.mockGenerators.forEach((mockGenerator) => mockGenerator.control.destroy());
            },
            [],
        );
        if (!container) {
            container = document.createElement('div');

            const container1 = document.createElement('div');
            container.appendChild(container1);
            const container2 = document.createElement('div');
            container.appendChild(container2);

            orchestrator = new ComponentFrameworkMockOrchestrator([
                [
                    Component,
                    {
                        selection: MultiSelectOptionSetPropertyMock,
                    },
                    container1,
                ],
                [
                    Component,
                    {
                        selection: MultiSelectOptionSetPropertyMock,
                    },
                    container2,
                ],
            ]);

            const optionsetMetadata = orchestrator.db.getAttributeMetadata(
                MetadataDB.CanvasLogicalName,
                'selection',
            ) as ShkoOnline.PickListAttributeMetadata;

            optionsetMetadata.OptionSet.Options = {
                0: { Value: 0, Label: 'Betim Beja' },
                1: { Value: 1, Label: 'Asllan Makaj' },
                2: { Value: 2, Label: 'Shko Online' },
            };

            orchestrator.db.upsertAttributeMetadata(MetadataDB.CanvasLogicalName, optionsetMetadata);

            const optionsetMetadata2 = orchestrator.db.getAttributeMetadata(
                MetadataDB.CanvasLogicalName,
                'selection',
            ) as ShkoOnline.PickListAttributeMetadata;

            optionsetMetadata2.LogicalName = 'selection2';
            optionsetMetadata2.SchemaName = 'selection2';
            delete optionsetMetadata2.MetadataId;
            delete optionsetMetadata2.OptionSet.MetadataId;

            orchestrator.db.upsertAttributeMetadata(MetadataDB.CanvasLogicalName, optionsetMetadata2);

            orchestrator.mockGenerators[1].context._parameters.selection._Bind(
                MetadataDB.CanvasLogicalName,
                'selection2',
            );

            orchestrator.mockGenerators[0].context.mode.isControlDisabled = args.isDisabled;
            orchestrator.mockGenerators[0].context.mode.isVisible = args.isVisible;

            orchestrator.mockGenerators[1].context.mode.isControlDisabled = args.isDisabled;
            orchestrator.mockGenerators[1].context.mode.isVisible = args.isVisible;

            orchestrator.mockGenerators[0].context._SetCanvasItems({
                selection: args.selection1,
            });

            orchestrator.mockGenerators[1].context._SetCanvasItems({
                selection: args.selection2,
            });

            orchestrator.mockGenerators[0].onOutputChanged.callsFake(({ selection }) => {
                updateArgs({ selection1: selection });
            });

            orchestrator.mockGenerators[1].onOutputChanged.callsFake(({ selection }) => {
                updateArgs({ selection2: selection });
            });

            orchestrator.ExecuteInit();
        }

        if (orchestrator) {
            orchestrator.mockGenerators[0].context.mode.isVisible = args.isVisible;
            orchestrator.mockGenerators[0].context.mode.isControlDisabled = args.isDisabled;
            orchestrator.mockGenerators[0].context._parameters.selection._SetValue(args.selection1);

            orchestrator.mockGenerators[1].context.mode.isVisible = args.isVisible;
            orchestrator.mockGenerators[1].context.mode.isControlDisabled = args.isDisabled;
            orchestrator.mockGenerators[1].context._parameters.selection._SetValue(args.selection2);

            orchestrator.mockGenerators[0].ExecuteUpdateView();
            orchestrator.mockGenerators[1].ExecuteUpdateView();
        }

        return container;
    };
};

export const MultiSelectOptionSet = {
    render: renderGenerator(),
    args: {
        selection1: [],
        selection2: [],
    },
} as StoryObj<StoryArgs>;
