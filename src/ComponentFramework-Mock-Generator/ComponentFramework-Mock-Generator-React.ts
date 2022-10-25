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
import { PropertyMap, PropertyToMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/PropertyMap';
import { MetadataDB } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/Metadata.db';
import { ContextMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/Context.mock';
import { EntityRecord } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/EntityRecord.mock';
import { MultiSelectOptionSetPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/MultiSelectOptionSetProperty.mock';
import ReactResizeObserver from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/ReactResizeObserver';
import arrayEqual from '@shko-online/componentframework-mock/utils/arrayEqual';
import showBanner from '@shko-online/componentframework-mock/utils/banner';
import { MockGenerator } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/MockGenerator';
import mockGetEntityMetadata from './mockGetEntityMetadata';
import { PropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';

export class ComponentFrameworkMockGeneratorReact<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
> implements MockGenerator<TInputs, TOutputs>{
    control: SinonSpiedInstance<ComponentFramework.ReactControl<TInputs, TOutputs>>;
    context: ContextMock<TInputs>;
    notifyOutputChanged: SinonStub<[], void>;
    state: ComponentFramework.Dictionary;

    data: {
        [entityName: string]: {
            [entityId: string]: EntityRecord;
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
                    this.metadata.UpdateValue(updates[k], property._boundTable, property._boundColumn, property._boundRow)
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
        Object.getOwnPropertyNames<ShkoOnline.PropertyTypes<TInputs>>(this.context.parameters).forEach((propertyName) => {
            const parameter = this.context.parameters[propertyName] as unknown as PropertyToMock<TInputs>;
            parameter._Refresh();
        });
        const state = this.state === undefined ? this.state : { ...this.state };
        this.control.init(this.context, this.notifyOutputChanged, state);
    }

    ExecuteUpdateView(): React.ReactElement {
        // div element react
        // ref html
        // observer

        return React.createElement(ReactResizeObserver, { componentFrameworkMockGeneratorReact: this });
        //return this.control.updateView(this.context);
    }
}
