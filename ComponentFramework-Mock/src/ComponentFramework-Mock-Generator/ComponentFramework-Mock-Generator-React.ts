/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import React from 'react';
import { spy, SinonSpiedInstance, SinonStub, stub } from 'sinon';
import {
    ContextMock,
    PropertyMap,
} from '../ComponentFramework-Mock';
import { MetadataDB } from './Metadata.db';
import { ReactResizeObserver } from './ReactResizeObserver';
import { showBanner } from '../utils';
import { MockGenerator } from './MockGenerator';
import { mockGetEntityMetadata } from './mockGetEntityMetadata';
import { mockSetControlState } from './mockSetControlState';
import { mockSetControlResource } from './mockSetControlResource';
import { mockRefreshParameters } from './mockRefreshParameters';
import { mockNotifyOutputChanged } from './mockNotifyOutputChanged';

export class ComponentFrameworkMockGeneratorReact<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
> implements MockGenerator<TInputs, TOutputs>
{
    _RefreshParameters: SinonStub<[], void>;
    context: ContextMock<TInputs>;
    control: SinonSpiedInstance<ComponentFramework.ReactControl<TInputs, TOutputs>>;
    notifyOutputChanged: SinonStub<[], void>;
    state: ComponentFramework.Dictionary;
    SetControlResource: SinonStub<[resource: string], void>;
    metadata: MetadataDB;

    constructor(control: new () => ComponentFramework.ReactControl<TInputs, TOutputs>, inputs: PropertyMap<TInputs>) {
        showBanner(control.name);
        this.state = {};
        this.control = spy(new control());
        this.metadata = new MetadataDB();
        this.context = new ContextMock(inputs, this.metadata);

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
        this.control.init(this.context, this.notifyOutputChanged, state);
    }

    private circuitBreaker = false;

    ExecuteUpdateView(): React.ReactElement {
        this._RefreshParameters();
        this.circuitBreaker = !this.circuitBreaker;
        return React.createElement(ReactResizeObserver<TInputs, TOutputs>, {
            componentFrameworkMockGeneratorReact: this,
            circuitBreaker: this.circuitBreaker ,
        });
    }
}
