import type { Meta, StoryObj } from '@storybook/html';
import type { IInputs, IOutputs } from '../../../__sample-components__/MultiSelectOptionSet/generated/ManifestTypes';

import { useArgs, useEffect } from '@storybook/preview-api';
import { ContainerSize as Component } from '../../../__sample-components__/MultiSelectOptionSet';
import {
    ComponentFrameworkMockOrchestrator,
    MetadataDB,
    MultiSelectOptionSetPropertyMock,
    ShkoOnline,
} from '../../../src';

import '../../../__sample-components__/MultiSelectOptionSet/css/multi-select-optionset.css';

export default {
    title: "Shko Online's ComponentFramework-Mock/Orchestrator/MultiSelectOptionSet Shared Column",
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

            orchestrator.mockGenerators[0].context.mode.isControlDisabled = args.isDisabled;
            orchestrator.mockGenerators[0].context.mode.isVisible = args.isVisible;

            orchestrator.mockGenerators[1].context.mode.isControlDisabled = args.isDisabled;
            orchestrator.mockGenerators[1].context.mode.isVisible = args.isVisible;

            orchestrator.mockGenerators[0].context._SetCanvasItems({
                selection: args.selection,
            });

            orchestrator.mockGenerators[1].context._SetCanvasItems({
                selection: args.selection,
            });

            orchestrator.mockGenerators[0].onOutputChanged.callsFake(({ selection }) => {
                updateArgs({ selection: selection });
            });

            orchestrator.mockGenerators[1].onOutputChanged.callsFake(({ selection }) => {
                updateArgs({ selection: selection });
            });

            orchestrator.ExecuteInit();
        }

        if (orchestrator) {
            orchestrator.mockGenerators[0].context.mode.isVisible = args.isVisible;
            orchestrator.mockGenerators[0].context.mode.isControlDisabled = args.isDisabled;
            orchestrator.mockGenerators[0].UpdateValues({ selection: args.selection });

            orchestrator.mockGenerators[1].context.mode.isVisible = args.isVisible;
            orchestrator.mockGenerators[1].context.mode.isControlDisabled = args.isDisabled;
            orchestrator.mockGenerators[1].UpdateValues({
                selection: args.selection
            });
          
            orchestrator.mockGenerators[0].ExecuteUpdateView();
            orchestrator.mockGenerators[1].ExecuteUpdateView();
        }

        return container;
    };
};

export const MultiSelectOptionSetSharedColumn = {
    render: renderGenerator(),
    args: {
        selection: [],
    },
} as StoryObj<StoryArgs>;
