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
import React from 'react';
import { spy, stub, SinonSpiedInstance, SinonStub } from 'sinon';
import {
    ContextMock,
    EntityRecordMock,
    MultiSelectOptionSetPropertyMock,
    PropertyMap,
    PropertyMock,
} from '../ComponentFramework-Mock';
import { MetadataDB } from './Metadata.db';
import { ReactResizeObserver } from './ReactResizeObserver';
import { arrayEqual, showBanner } from '../utils';
import { MockGenerator } from './MockGenerator';
import { mockGetEntityMetadata } from './mockGetEntityMetadata';

export class ComponentFrameworkMockGeneratorReact<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
> implements MockGenerator<TInputs, TOutputs>
{
    control: SinonSpiedInstance<ComponentFramework.ReactControl<TInputs, TOutputs>>;
    context: ContextMock<TInputs>;
    notifyOutputChanged: SinonStub<[], void>;
    state: ComponentFramework.Dictionary;

    data: {
        [entityName: string]: {
            [entityId: string]: EntityRecordMock;
        };
    };

    myUserId: string;
    metadata: MetadataDB;

    constructor(control: new () => ComponentFramework.ReactControl<TInputs, TOutputs>, inputs: PropertyMap<TInputs>) {
        showBanner(control.name);
        this.control = spy(new control());
        this.metadata = new MetadataDB();
        this.context = new ContextMock(inputs, this.metadata);

        mockGetEntityMetadata(this);

        this.context.mode.setControlState.callsFake((state: ComponentFramework.Dictionary) => {
            this.state = { ...state, ...this.state };
            return true;
        });

        this.notifyOutputChanged = stub();
        this.notifyOutputChanged.callsFake(() => {
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
                    } else {
                        // @ts-ignore
                        if (this.context.parameters[k].raw !== updates[k]) {
                            this.context.updatedProperties.push(k);
                        }
                    }
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
        });
    }
    ExecuteInit() {
        Object.getOwnPropertyNames<ShkoOnline.PropertyTypes<TInputs>>(this.context.parameters).forEach(
            (propertyName) => {
                this.context._parameters[propertyName]._Refresh();
            },
        );
        const state = this.state === undefined ? this.state : { ...this.state };
        this.control.init(this.context, this.notifyOutputChanged, state);
    }

    ExecuteUpdateView(): React.ReactElement {
        Object.getOwnPropertyNames<ShkoOnline.PropertyTypes<TInputs>>(this.context.parameters).forEach(
            (propertyName) => {
                this.context._parameters[propertyName]._Refresh();
            },
        );

        return React.createElement(ReactResizeObserver, {
            componentFrameworkMockGeneratorReact: this,
            circuitBreaker: new Object(),
        });
        //return this.control.updateView(this.context);
    }
}
