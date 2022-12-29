/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonSpiedInstance, SinonStub } from 'sinon';
import type { PropertyMap } from '../ComponentFramework-Mock';
import { spy, stub } from 'sinon';
import { MetadataDB } from './Metadata.db';
import { ContextMock } from '../ComponentFramework-Mock';
import { showBanner } from '../utils';
import { mockGetEntityMetadata } from './mockGetEntityMetadata';
import { mockSetControlState } from './mockSetControlState';
import { mockSetControlResource } from './mockSetControlResource';
import { mockRefreshParameters } from './mockRefreshParameters';
import { mockNotifyOutputChanged } from './mockNotifyOutputChanged';

export class ComponentFrameworkMockGenerator<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
> {
    _RefreshParameters: SinonStub<[], void>;
    container: HTMLDivElement;
    context: ContextMock<TInputs>;
    control: SinonSpiedInstance<ComponentFramework.StandardControl<TInputs, TOutputs>>;
    notifyOutputChanged: SinonStub<[], void>;
    state: ComponentFramework.Dictionary;
    SetControlResource: SinonStub<[resource: string], void>;
    metadata: MetadataDB;

    constructor(
        control: new () => ComponentFramework.StandardControl<TInputs, TOutputs>,
        inputs: PropertyMap<TInputs>,
        container?: HTMLDivElement,
    ) {
        showBanner(control.name);
        this.state = {};
        this.container = container ?? document.createElement('div');
        this.control = spy(new control());
        this.metadata = new MetadataDB();
        this.context = new ContextMock(inputs, this.metadata);

        this.context.mode.trackContainerResize.callsFake((value) => {
            const observer = new ResizeObserver((entries) => {
                const size = entries[0];
                this.context.mode.allocatedHeight = size.contentRect.height;
                this.context.mode.allocatedWidth = size.contentRect.width;
                this.ExecuteUpdateView();
            });
            if (value) observer.observe(this.container);
            else observer.unobserve(this.container);
        });

        mockGetEntityMetadata(this);
        this.notifyOutputChanged = stub();
        mockNotifyOutputChanged(this, this.control.getOutputs?.bind(this.control), this.ExecuteUpdateView.bind(this));
        this._RefreshParameters = stub();
        mockRefreshParameters(this);
        this.SetControlResource = stub();
        mockSetControlResource(this);
        mockSetControlState(this);
    }

    ExecuteInit() {
        this._RefreshParameters();
        const state = this.state === undefined ? this.state : { ...this.state };
        this.control.init(this.context, this.notifyOutputChanged, state, this.container);
    }

    ExecuteUpdateView() {
        this._RefreshParameters();
        this.control.updateView(this.context);
    }
}
