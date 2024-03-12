import type { Meta, StoryObj } from '@storybook/html';
import type { IInputs, IOutputs } from '../../__sample-components__/OwnerLookup/generated/ManifestTypes';
import type { PCFStoryArgs } from './PCFStoryArgs';

import { useArgs, useEffect } from '@storybook/preview-api';
import { OwnerLookup as Component } from '../../__sample-components__/OwnerLookup';
import { ComponentFrameworkMockGenerator, LookupPropertyMock } from '../../src';

interface StoryArgs extends PCFStoryArgs {
    value: ComponentFramework.LookupValue;
}

export default {
    title: "Shko Online's ComponentFramework-Mock/OwnerLookup",
    argTypes: {
        value: {
            defaultValue: { entityType: 'systemuser', id: 'start-id', name: 'Betim Beja' },
            name: 'Value',
            control: 'object',
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
                    value: LookupPropertyMock,
                },
                container,
            );

            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context._SetCanvasItems({
                value: { entityType: 'account', id: 'my-id' },
            });

            mockGenerator.onOutputChanged.callsFake(({value}) => {
                mockGenerator.context._parameters.value._Refresh();
                updateArgs({
                    value: value
                        ? value[0]
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
    args: {
        value: { entityType: 'systemuser', id: 'start-id', name: 'Betim Beja' },
    },
} as StoryObj<StoryArgs>;
