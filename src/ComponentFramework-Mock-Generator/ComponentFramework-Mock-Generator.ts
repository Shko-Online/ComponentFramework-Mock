/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonSpiedInstance, SinonStub } from 'sinon';
import type { MockGenerator, MockGeneratorOverrides } from './MockGenerator';
import type { PropertyMap } from '../ComponentFramework-Mock';
import type { ShkoOnline } from '../ShkoOnline';

import { spy, stub } from 'sinon';
import { MetadataDB } from './Metadata.db';
import { mockGetEntityMetadata } from './mockGetEntityMetadata';
import { mockSetControlState } from './mockSetControlState';
import { mockSetControlResource } from './mockSetControlResource';
import { mockRefreshParameters } from './mockRefreshParameters';
import { mockNotifyOutputChanged } from './mockNotifyOutputChanged';
import { ContextMock, DataSetMock } from '../ComponentFramework-Mock';
import { showBanner } from '../utils';
import { mockRefreshDatasets } from './mockRefreshDatasets';

export class ComponentFrameworkMockGenerator<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
> implements MockGenerator<TInputs, TOutputs>
{
    RefreshParameters: SinonStub<[], void>;
    RefreshDatasets: SinonStub<[], void>;
    container: HTMLDivElement;
    context: ContextMock<TInputs>;
    control: SinonSpiedInstance<ComponentFramework.StandardControl<TInputs, TOutputs>>;
    notifyOutputChanged: SinonStub<[], void>;
    onOutputChanged: SinonStub<[updates: Partial<TOutputs>], void>;
    outputOnlyProperties: ShkoOnline.OutputOnlyTypes<TInputs, TOutputs>;
    resizeObserver: ResizeObserver;
    state: ComponentFramework.Dictionary;
    SetControlResource: SinonStub<[resource: string], void>;
    metadata: MetadataDB;

    constructor(
        control: new () => ComponentFramework.StandardControl<TInputs, TOutputs>,
        inputs: PropertyMap<TInputs>,
        container?: HTMLDivElement,
        outputs?: ShkoOnline.OutputOnlyTypes<{}, TOutputs>,
        overrides?: MockGeneratorOverrides
    ) {
        showBanner(control.name);
        this.state = {};
        this.outputOnlyProperties = {} as ShkoOnline.OutputOnlyTypes<TInputs, TOutputs>;
        this.container = container ?? document.createElement('div');
        this.control = spy(new control());
        this.metadata = overrides?.metadata ?? new MetadataDB();
        this.context = new ContextMock(inputs, this.metadata);
        this.resizeObserver = new ResizeObserver((entries) => {
            const size = entries[0];
            this.context.mode.allocatedHeight = size.contentRect.height;
            this.context.mode.allocatedWidth = size.contentRect.width;
            this.ExecuteUpdateView();
        });

        this.context.mode.trackContainerResize.callsFake((value) => {
            if (value) this.resizeObserver.observe(this.container);
            else this.resizeObserver.unobserve(this.container);
        });

        const inputProperties = Object.getOwnPropertyNames(this.context._parameters);

        inputProperties.forEach((p) => {
            const parameter = this.context._parameters[p];
            if (parameter instanceof DataSetMock) {
                parameter._updateView = this.ExecuteUpdateView.bind(this);
            }
        });

        if (outputs) {
            Object.getOwnPropertyNames(outputs).forEach(p => {
                if (inputProperties.includes(p)) {
                    return;
                }
                this.outputOnlyProperties[p] = outputs[p] as any;
            });
        }

        mockGetEntityMetadata(this);
        this.notifyOutputChanged = stub();
        mockNotifyOutputChanged(this, this.control.getOutputs?.bind(this.control), this.ExecuteUpdateView.bind(this));
        this.onOutputChanged = stub();
        this.RefreshParameters = stub();
        mockRefreshParameters(this);
        this.RefreshDatasets = stub();
        mockRefreshDatasets(this, this.ExecuteUpdateView.bind(this));
        this.SetControlResource = stub();
        mockSetControlResource(this);
        mockSetControlState(this);
    }

    ExecuteInit() {
        this.RefreshParameters();
        const state = this.state === undefined ? this.state : { ...this.state };
        this.control.init(this.context, this.notifyOutputChanged, state, this.container);
    }

    ExecuteUpdateView() {
        this.RefreshParameters();
        this.control.updateView(this.context);
        this.RefreshDatasets();
    }
}
