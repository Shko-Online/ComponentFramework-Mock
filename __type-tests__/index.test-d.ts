/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../src/ShkoOnline';
import {
    ComponentFrameworkMockGenerator,
    ComponentFrameworkMockGeneratorReact,
    ComponentFrameworkMockOrchestrator,
    MockGeneratorOverrides,
    PropertyMap,
    TwoOptionsPropertyMock,
    EnumPropertyMock,
    MetadataDB,
    PropertyToMock,
    StringPropertyMock,
} from '../src';
import React from 'react';
import { expectType } from 'tsd';
import '.';

namespace Output_Number_Array_Optional_Tests {
    interface TOutput {
        selection?: number[];
    }

    let T: TOutput = {
        selection: [1],
    };

    expectType<ShkoOnline.KnownTypes<TOutput>>(T);
}

namespace Output_Number_Array_Required_Tests {
    interface TOutput {
        selection: number[];
    }

    let T = {
        selection: [1],
    };

    expectType<ShkoOnline.KnownTypes<TOutput>>(T);
}

namespace EnumPropertyMock_Tests {
    interface TInputs {
        string1: ComponentFramework.PropertyTypes.StringProperty;
        enum1: ComponentFramework.PropertyTypes.EnumProperty<'A' | 'B'>;
    }

    const B: PropertyToMock<TInputs> = {
        string1: new StringPropertyMock('string1', new MetadataDB(), { LogicalName: 'test' }),
        enum1: new EnumPropertyMock<'A' | 'B'>('enum1', new MetadataDB(), { LogicalName: 'test' }),
    };
}

namespace Standard_Control_Input_Tests {
    interface IInputs {
        stringProperty: ComponentFramework.PropertyTypes.StringProperty;
    }

    interface IOutputs {
        stringProperty?: string;
    }

    class StandardControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
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

    const T = new ComponentFrameworkMockOrchestrator<[IInputs, IOutputs, false]>([
        [StandardControl, { stringProperty: StringPropertyMock }],
    ]);

    expectType<
        [
            [
                control: new () => ComponentFramework.StandardControl<IInputs, IOutputs>,
                inputs: PropertyMap<IInputs>,
                container?: HTMLDivElement,
                outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs>,
                overrides?: MockGeneratorOverrides,
            ],
        ]
    >(T.controls);

    expectType<[ComponentFrameworkMockGenerator<IInputs, IOutputs>]>(T.mockGenerators);
}

namespace React_Control_Input_Tests {
    interface IInputs {
        stringProperty: ComponentFramework.PropertyTypes.StringProperty;
    }

    interface IOutputs {
        stringProperty?: string;
    }

    class ReactControl implements ComponentFramework.ReactControl<IInputs, IOutputs> {
        init(
            context: ComponentFramework.Context<IInputs>,
            notifyOutputChanged?: () => void,
            state?: ComponentFramework.Dictionary,
            container?: HTMLDivElement,
        ): void {}
        updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
            return React.createElement('div');
        }
        destroy(): void {}
        getOutputs?(): IOutputs {
            return {};
        }
    }

    const T = new ComponentFrameworkMockOrchestrator<[IInputs, IOutputs, true]>([
        [ReactControl, { stringProperty: StringPropertyMock }],
    ]);

    expectType<
        [
            [
                control: new () => ComponentFramework.ReactControl<IInputs, IOutputs>,
                inputs: PropertyMap<IInputs>,
                outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs>,
                overrides?: MockGeneratorOverrides,
            ],
        ]
    >(T.controls);

    expectType<[ComponentFrameworkMockGeneratorReact<IInputs, IOutputs>]>(T.mockGenerators);
}

namespace Two_Controls_Input_Tests {
    interface IInputs1 {
        stringProperty: ComponentFramework.PropertyTypes.StringProperty;
    }

    interface IOutputs1 {
        stringProperty?: string;
    }

    class StandardControl implements ComponentFramework.StandardControl<IInputs1, IOutputs1> {
        init(
            context: ComponentFramework.Context<IInputs1>,
            notifyOutputChanged?: () => void,
            state?: ComponentFramework.Dictionary,
            container?: HTMLDivElement,
        ): void {}
        updateView(context: ComponentFramework.Context<IInputs1>): void {}
        destroy(): void {}
        getOutputs?(): IOutputs1 {
            return {};
        }
    }

    interface IInputs2 {
        stringProperty2: ComponentFramework.PropertyTypes.StringProperty;
    }

    interface IOutputs2 {
        stringProperty2?: string;
    }

    class ReactControl implements ComponentFramework.ReactControl<IInputs2, IOutputs2> {
        init(
            context: ComponentFramework.Context<IInputs2>,
            notifyOutputChanged?: () => void,
            state?: ComponentFramework.Dictionary,
            container?: HTMLDivElement,
        ): void {}
        updateView(context: ComponentFramework.Context<IInputs2>): React.ReactElement {
            return React.createElement('div');
        }
        destroy(): void {}
        getOutputs?(): IOutputs2 {
            return {};
        }
    }

    const T = new ComponentFrameworkMockOrchestrator<[IInputs1, IOutputs1, false, IInputs2, IOutputs2, true]>([
        [StandardControl, { stringProperty: StringPropertyMock }],
        [ReactControl, { stringProperty2: StringPropertyMock }],
    ]);

    expectType<
        [
            [
                control: new () => ComponentFramework.StandardControl<IInputs1, IOutputs1>,
                inputs: PropertyMap<IInputs1>,
                container?: HTMLDivElement,
                outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs1>,
                overrides?: MockGeneratorOverrides,
            ],
            [
                control: new () => ComponentFramework.ReactControl<IInputs2, IOutputs2>,
                inputs: PropertyMap<IInputs2>,
                outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs2>,
            ],
        ]
    >(T.controls);

    expectType<
        [
            ComponentFrameworkMockGenerator<IInputs1, IOutputs1>,
            ComponentFrameworkMockGeneratorReact<IInputs2, IOutputs2>,
        ]
    >(T.mockGenerators);
}

namespace Three_Controls_Input_Tests {
    interface IInputs1 {
        stringProperty: ComponentFramework.PropertyTypes.StringProperty;
    }

    interface IOutputs1 {
        stringProperty?: string;
    }

    class StandardControl implements ComponentFramework.StandardControl<IInputs1, IOutputs1> {
        init(
            context: ComponentFramework.Context<IInputs1>,
            notifyOutputChanged?: () => void,
            state?: ComponentFramework.Dictionary,
            container?: HTMLDivElement,
        ): void {}
        updateView(context: ComponentFramework.Context<IInputs1>): void {}
        destroy(): void {}
        getOutputs?(): IOutputs1 {
            return {};
        }
    }

    interface IInputs2 {
        stringProperty: ComponentFramework.PropertyTypes.StringProperty;
    }

    interface IOutputs2 {
        stringProperty?: string;
    }

    class ReactControl implements ComponentFramework.ReactControl<IInputs2, IOutputs2> {
        init(
            context: ComponentFramework.Context<IInputs2>,
            notifyOutputChanged?: () => void,
            state?: ComponentFramework.Dictionary,
            container?: HTMLDivElement,
        ): void {}
        updateView(context: ComponentFramework.Context<IInputs2>): React.ReactElement {
            return React.createElement('div');
        }
        destroy(): void {}
        getOutputs?(): IOutputs2 {
            return {};
        }
    }

    interface IInputs3 {
        booleanProperty: ComponentFramework.PropertyTypes.TwoOptionsProperty;
    }

    interface IOutputs3 {
        booleanProperty?: boolean;
    }

    class ReactControl3 implements ComponentFramework.ReactControl<IInputs3, IOutputs3> {
        init(
            context: ComponentFramework.Context<IInputs3>,
            notifyOutputChanged?: () => void,
            state?: ComponentFramework.Dictionary,
            container?: HTMLDivElement,
        ): void {}
        updateView(context: ComponentFramework.Context<IInputs3>): React.ReactElement {
            return React.createElement('div');
        }
        destroy(): void {}
        getOutputs?(): IOutputs3 {
            return {};
        }
    }

    const T = new ComponentFrameworkMockOrchestrator<
        [IInputs1, IOutputs1, false, IInputs2, IOutputs2, true, IInputs3, IOutputs3, true]
    >([
        [StandardControl, { stringProperty: StringPropertyMock }],
        [ReactControl, { stringProperty: StringPropertyMock }],
        [ReactControl3, { booleanProperty: TwoOptionsPropertyMock }],
    ]);

    expectType<
        [
            [
                control: new () => ComponentFramework.StandardControl<IInputs1, IOutputs1>,
                inputs: PropertyMap<IInputs1>,
                container?: HTMLDivElement,
                outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs1>,
                overrides?: MockGeneratorOverrides,
            ],
            [
                control: new () => ComponentFramework.ReactControl<IInputs2, IOutputs2>,
                inputs: PropertyMap<IInputs2>,
                outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs2>,
            ],
            [
                control: new () => ComponentFramework.ReactControl<IInputs3, IOutputs3>,
                inputs: PropertyMap<IInputs3>,
                outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs3>,
            ],
        ]
    >(T.controls);

    expectType<
        [
            ComponentFrameworkMockGenerator<IInputs1, IOutputs1>,
            ComponentFrameworkMockGeneratorReact<IInputs2, IOutputs2>,
            ComponentFrameworkMockGeneratorReact<IInputs3, IOutputs3>,
        ]
    >(T.mockGenerators);
}

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
