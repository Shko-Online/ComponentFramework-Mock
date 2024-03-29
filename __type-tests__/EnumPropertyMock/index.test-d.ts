/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import '.';
import { expectType } from 'tsd';
import { EnumPropertyMock } from '../../src';
import { ComponentFrameworkMockGenerator } from '../../src';

namespace EnumPropertyMock_Tests {
    interface IInputs {
        controlType: ComponentFramework.PropertyTypes.EnumProperty<'0' | '1'>;
    }

    interface IOutputs {}

    class MultiSwitch implements ComponentFramework.StandardControl<IInputs, IOutputs> {
        init(
            context: ComponentFramework.Context<IInputs>,
            notifyOutputChanged?: () => void,
            state?: ComponentFramework.Dictionary,
            container?: HTMLDivElement,
        ): void {}
        updateView(context: ComponentFramework.Context<IInputs>): void {}
        destroy(): void {}
        getOutputs?(): IOutputs {
            return {};
        }
    }

    const mockGenerator = new ComponentFrameworkMockGenerator(MultiSwitch, {
        controlType: EnumPropertyMock<'0' | '1'>,
    });
    expectType<ComponentFrameworkMockGenerator<IInputs, IOutputs>>(mockGenerator);
}
