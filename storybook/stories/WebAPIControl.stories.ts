import type { Meta, StoryObj } from '@storybook/html';
import type { IInputs, IOutputs } from '../../__sample-components__/WebAPIControl/generated/ManifestTypes';

import { useArgs } from '@storybook/preview-api';
import { WebAPIControl as Component } from '../../__sample-components__/WebAPIControl';
import { AttributeType, ComponentFrameworkMockGenerator, ShkoOnline, StringPropertyMock } from '../../src';
import '../../__sample-components__/WebAPIControl/css/WebAPIControl.css';

export default {
    title: "Shko Online's ComponentFramework-Mock/WebAPI Control",
} as Meta<StoryArgs>;

interface StoryArgs {
    isDisabled: boolean;
    isVisible: boolean;
}

const renderGenerator = () => {
    let container: HTMLDivElement;
    let mockGenerator: ComponentFrameworkMockGenerator<IInputs, IOutputs>;

    return function () {
        const [args] = useArgs<StoryArgs>();
        if (!container) {
            container = document.createElement('div');
            container.className = 'SampleNamespace.WebAPIControl';
            mockGenerator = new ComponentFrameworkMockGenerator(
                Component,
                {
                    stringProperty: StringPropertyMock,
                },
                container,
            );

            mockGenerator.metadata.initMetadata([
                { LogicalName: 'account', EntitySetName: 'accounts', PrimaryIdAttribute: 'accountid', PrimaryNameAttribute: 'name', Attributes: [
                    {
                        AttributeType: AttributeType.Uniqueidentifier,
                        LogicalName: 'accountid',
                        SchemaName: 'AccountId'
                    } as ShkoOnline.AttributeMetadata,
                    {
                        AttributeType: AttributeType.String,
                        LogicalName: 'name',
                        SchemaName: 'Name'
                    } as ShkoOnline.StringAttributeMetadata,
                    {
                        AttributeType: AttributeType.Money,
                        LogicalName: 'revenue',
                        SchemaName: 'revenue'
                    } as ShkoOnline.AttributeMetadata
                ] },
            ]);

            mockGenerator.context.mode.isControlDisabled = args.isDisabled;
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context._SetCanvasItems({
                stringProperty: '',
            });

            mockGenerator.ExecuteInit();
        }

        if (mockGenerator) {
            mockGenerator.context.mode.isVisible = args.isVisible;
            mockGenerator.context.mode.isControlDisabled = args.isDisabled;

            mockGenerator.ExecuteUpdateView();
        }

        return container;
    };
};

export const WebAPIControl = {
    render: renderGenerator(),
    args: {

    },
} as StoryObj<StoryArgs>;
