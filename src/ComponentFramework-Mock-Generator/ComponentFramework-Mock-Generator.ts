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

import { spy, fake, SinonSpy, SinonSpiedInstance } from 'sinon';
import { MetadataDB } from './Metadata.db';
import { arrayEqual, showBanner } from '../utils';
import { mockGetEntityMetadata } from './mockGetEntityMetadata';
import { mockSetControlState } from './mockSetControlState';
import {
    ContextMock,
    MultiSelectOptionSetPropertyMock,
    PropertyMap,
    PropertyMock,
} from '../ComponentFramework-Mock';

export class ComponentFrameworkMockGenerator<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
> {
    control: SinonSpiedInstance<ComponentFramework.StandardControl<TInputs, TOutputs>>;
    context: ContextMock<TInputs>;
    notifyOutputChanged: SinonSpy<[], void>;
    state: ComponentFramework.Dictionary;
    container: HTMLDivElement;

    metadata: MetadataDB;

    constructor(
        control: new () => ComponentFramework.StandardControl<TInputs, TOutputs>,
        inputs: PropertyMap<TInputs>,
        container?: HTMLDivElement,
    ) {
        showBanner(control.name);
        this.state = {};
        this.control = spy(new control());
        this.metadata = new MetadataDB();
        this.context = new ContextMock(inputs, this.metadata);
        mockGetEntityMetadata(this);
        mockSetControlState(this);
        
        this.notifyOutputChanged = fake(() => {
            const updates = this.control.getOutputs?.();
            this.context.updatedProperties = [];
            for (const k in updates) {
                if (k in this.context.parameters) {
                    const property = this.context.parameters[k] as PropertyMock;

                    if (Array.isArray(updates[k])) {
                        const arrayUpdate = updates[k] as number[];
                        const property = this.context.parameters[k] as MultiSelectOptionSetPropertyMock;
                        if (!arrayEqual(arrayUpdate, property.raw)) {
                            this.context.updatedProperties.push(k);
                        }
                    } else if (typeof updates[k] === 'object') {
                        //ToDo: Update
                    } else {
                        // @ts-ignore
                        if (this.context.parameters[k].raw !== updates[k]) {
                            this.context.updatedProperties.push(k);
                        }
                    }

                    // @ts-ignore
                    this.metadata.UpdateValue(
                        updates[k],
                        property._boundTable,
                        property._boundColumn,
                        property._boundRow,
                    );
                }
            }
            if (this.context.updatedProperties.length > 0) {
                this.ExecuteUpdateView();
            }
        });

        this.container = container ?? document.createElement('div');
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
    }

    SetControlResource(resource: string) {
        const xmlResource = new DOMParser().parseFromString(resource, 'text/xml');
        const elements = xmlResource.getElementsByTagNameNS('', 'data');
        this.context.resources.getString.callsFake((id) => {
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].getAttribute('name') === id) {
                    return elements[i].getElementsByTagName('value')[0].innerHTML;
                }
            }
            throw new Error(`Could not find string with id '${id}'`);
        });
    }

    ExecuteInit() {
        Object.getOwnPropertyNames<ShkoOnline.PropertyTypes<TInputs>>(this.context.parameters).forEach(
            (propertyName) => {
                this.context._parameters[propertyName]._Refresh();
            },
        );
        const state = this.state === undefined ? this.state : { ...this.state };
        this.control.init(this.context, this.notifyOutputChanged, state, this.container);
    }

    ExecuteUpdateView() {
        Object.getOwnPropertyNames<ShkoOnline.PropertyTypes<TInputs>>(this.context.parameters).forEach(
            (propertyName) => {
                this.context._parameters[propertyName]._Refresh();
            },
        );
        this.control.updateView(this.context);
    }
}
