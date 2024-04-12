/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonSpiedInstance, SinonStub } from 'sinon';
import type { ReactElement } from 'react';
import type { ComponentValues, MockGenerator, MockGeneratorOverrides } from './MockGenerator';
import type { MockToRaw, PropertyMap, PropertyToMock } from '../ComponentFramework-Mock';
import type { ShkoOnline } from '../ShkoOnline';

import { createElement } from 'react';
import { spy, stub } from 'sinon';
import { ContextMock } from '../ComponentFramework-Mock';
import { MetadataDB } from './Metadata.db';
import { ReactResizeObserver } from './ReactResizeObserver';
import { showBanner } from '../utils';
import { mockGetEntityMetadata } from './mockGetEntityMetadata';
import { mockSetControlState } from './mockSetControlState';
import { mockSetControlResource } from './mockSetControlResource';
import { mockRefreshParameters } from './mockRefreshParameters';

export class ComponentFrameworkMockGeneratorReact<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
> implements MockGenerator<TInputs, TOutputs>
{
    _PendingUpdates: {
        value: ComponentFramework.LookupValue | ComponentValues<TInputs>;
        table: string;
        column: string;
        row?: string;
    }[];
    RefreshParameters: SinonStub<[], void>;
    RefreshDatasets: SinonStub<[], void>;
    UpdateValues: SinonStub<[items: Partial<MockToRaw<TInputs, PropertyToMock<TInputs>>>], void>;
    context: ContextMock<TInputs>;
    control: SinonSpiedInstance<ComponentFramework.ReactControl<TInputs, TOutputs>>;
    notifyOutputChanged: SinonStub<[], void>;
    onOutputChanged: SinonStub<[updates:Partial<TOutputs>], void>;
    outputOnlyProperties: ShkoOnline.OutputOnlyTypes<TInputs, TOutputs>;
    resizeObserver: ResizeObserver;
    state: ComponentFramework.Dictionary;
    SetControlResource: SinonStub<[resource: string], void>;
    metadata: MetadataDB;

    constructor(
        control: new () => ComponentFramework.ReactControl<TInputs, TOutputs>,
        inputs: PropertyMap<TInputs>,
        outputs?: ShkoOnline.OutputOnlyTypes<{}, TOutputs>,
        overrides?: MockGeneratorOverrides
    ) {
        showBanner(control.name);
        this._PendingUpdates = [];
        this.state = {};
        this.outputOnlyProperties = {} as ShkoOnline.OutputOnlyTypes<TInputs, TOutputs>;
        this.control = spy(new control());
        this.metadata = overrides?.metadata ?? new MetadataDB();
        this.context = new ContextMock(inputs, this.metadata);

        const inputProperties = Object.getOwnPropertyNames(this.context._parameters);

        if (outputs) {
            Object.getOwnPropertyNames(outputs).forEach((p) => {
                if (inputProperties.includes(p)) {
                    return;
                }
                this.outputOnlyProperties[p] = outputs[p] as any;
            });
        }

        mockGetEntityMetadata(this);
        this.UpdateValues = stub();
        this.notifyOutputChanged = stub(); // Mocked in ReactResizeObserver
        this.onOutputChanged = stub();
        this.resizeObserver = new ResizeObserver(() => undefined); // Defined in ReactResizeObserver
        this.RefreshParameters = stub();
        mockRefreshParameters(this);
        this.RefreshDatasets = stub();
        this.SetControlResource = stub();
        mockSetControlResource(this);
        mockSetControlState(this);
    }

    ExecuteInit() {
        this.RefreshParameters();
        const state = this.state === undefined ? this.state : { ...this.state };
        this.control.init(this.context, this.notifyOutputChanged, state);
    }

    private circuitBreaker = false;

    ExecuteUpdateView(): ReactElement {
        this.RefreshParameters();
        this.circuitBreaker = !this.circuitBreaker;
        return createElement(ReactResizeObserver<TInputs, TOutputs>, {
            componentFrameworkMockGeneratorReact: this,
            circuitBreaker: this.circuitBreaker,
        });
    }
}
