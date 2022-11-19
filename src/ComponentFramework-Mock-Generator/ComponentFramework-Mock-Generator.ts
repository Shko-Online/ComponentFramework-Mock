/*
    Unless explicitly acquired and licensed from Licensor under another
    license, the contents of this file are subject to the Reciprocal Public
    License ("RPL") Version 1.5, or subsequent versions as allowed by the RPL,
    and You may not copy or use this file in either source code or executable
    form, except in compliance with the terms and conditions of the RPL.

    All software distributed under the RPL is provided strictly on an "AS
    IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND
    LICENSOR HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT
    LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
    PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT. See the RPL for specific
    language governing rights and limitations under the RPL. 
*/

import { spy, SinonSpiedInstance, SinonStub, stub } from 'sinon';
import { MetadataDB } from './Metadata.db';
import { showBanner } from '../utils';
import { mockGetEntityMetadata } from './mockGetEntityMetadata';
import { mockSetControlState } from './mockSetControlState';
import { ContextMock, PropertyMap } from '../ComponentFramework-Mock';
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
        mockNotifyOutputChanged(this, this.control.getOutputs, this.ExecuteUpdateView);
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
