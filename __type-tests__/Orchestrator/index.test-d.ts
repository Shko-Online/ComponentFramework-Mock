/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import '.';
import { expectType } from 'tsd';
import { PropertyMap, ShkoOnline, StringPropertyMock, TwoOptionsPropertyMock } from '../../src';
import { ComponentFrameworkMockOrchestrator } from '@shko.online/componentframework-mock/ComponentFramework-Mock-Generator/ComponentFramework-Mock-Orchestrator';
import React from 'react';

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
        ): void { }
        updateView(context: ComponentFramework.Context<IInputs>): void { }
        destroy(): void { }
        getOutputs?(): IOutputs {
            return {};
        }
    }

    const T = new ComponentFrameworkMockOrchestrator<[IInputs, IOutputs, false]>([[
        StandardControl,
        { stringProperty: StringPropertyMock }
    ]]);

    expectType<[
        [
            control: new () => ComponentFramework.StandardControl<IInputs, IOutputs>,
            inputs: PropertyMap<IInputs>,
            container?: HTMLDivElement,
            outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs>
        ]
    ]>(T.controls);
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
        ): void { }
        updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
            return React.createElement('div');
        }
        destroy(): void { }
        getOutputs?(): IOutputs {
            return {};
        }
    }

    const T = new ComponentFrameworkMockOrchestrator<[IInputs, IOutputs, true]>([[
        ReactControl,
        { stringProperty: StringPropertyMock }
    ]]);

    expectType<[
        [
            control: new () => ComponentFramework.ReactControl<IInputs, IOutputs>,
            inputs: PropertyMap<IInputs>,
            outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs>
        ]
    ]>(T.controls);
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
        ): void { }
        updateView(context: ComponentFramework.Context<IInputs1>): void { }
        destroy(): void { }
        getOutputs?(): IOutputs1 {
            return {};
        }
    }

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
        ): void { }
        updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
            return React.createElement('div');
        }
        destroy(): void { }
        getOutputs?(): IOutputs {
            return {};
        }
    }

    const T = new ComponentFrameworkMockOrchestrator<[
        IInputs1,
        IOutputs1,
        false,
        IInputs,
        IOutputs,
        true]>([
            [
                StandardControl,
                { stringProperty: StringPropertyMock }
            ],
            [
                ReactControl,
                { stringProperty: StringPropertyMock }
            ]]);

    expectType<[
        [
            control: new () => ComponentFramework.StandardControl<IInputs1, IOutputs1>,
            inputs: PropertyMap<IInputs1>,
            container?: HTMLDivElement,
            outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs1>
        ],
        [
            control: new () => ComponentFramework.ReactControl<IInputs, IOutputs>,
            inputs: PropertyMap<IInputs>,
            outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs>
        ]
    ]>(T.controls);
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
        ): void { }
        updateView(context: ComponentFramework.Context<IInputs1>): void { }
        destroy(): void { }
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
        ): void { }
        updateView(context: ComponentFramework.Context<IInputs2>): React.ReactElement {
            return React.createElement('div');
        }
        destroy(): void { }
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
        ): void { }
        updateView(context: ComponentFramework.Context<IInputs3>): React.ReactElement {
            return React.createElement('div');
        }
        destroy(): void { }
        getOutputs?(): IOutputs3 {
            return {};
        }
    }

    const T = new ComponentFrameworkMockOrchestrator<[
        IInputs1,
        IOutputs1,
        false,
        IInputs2,
        IOutputs2,
        true,
        IInputs3,
        IOutputs3,
        true]>([
            [
                StandardControl,
                { stringProperty: StringPropertyMock }
            ],
            [
                ReactControl,
                { stringProperty: StringPropertyMock }
            ],
            [
                ReactControl3,
                { booleanProperty: TwoOptionsPropertyMock }
            ]]);

    expectType<[
        [
            control: new () => ComponentFramework.StandardControl<IInputs1, IOutputs1>,
            inputs: PropertyMap<IInputs1>,
            container?: HTMLDivElement,
            outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs1>
        ],
        [
            control: new () => ComponentFramework.ReactControl<IInputs2, IOutputs2>,
            inputs: PropertyMap<IInputs2>,
            outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs2>
        ],
        [
            control: new () => ComponentFramework.ReactControl<IInputs3, IOutputs3>,
            inputs: PropertyMap<IInputs3>,
            outputs?: ShkoOnline.OutputOnlyTypes<{}, IOutputs3>
        ]
    ]>(T.controls);
}
