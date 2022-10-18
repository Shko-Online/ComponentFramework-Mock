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
import { KnownTypes } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/KnownTypes';
import { PropertyMap } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/PropertyMap';
import { MetadataDB } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/Metadata.db';
import { ContextMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/Context.mock';
import { EntityRecord } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/EntityRecord.mock';
import { MultiSelectOptionSetPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/MultiSelectOptionSetProperty.mock';
import ReactResizeObserver from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/ReactResizeObserver';
import arrayEqual from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/arrayEqual';
import showBanner from '../banner';

export class ComponentFrameworkMockGeneratorReact<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends KnownTypes<TOutputs>,
> {
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
        //showBanner(control.name);
        this.control = spy(new control());
        this.context = new ContextMock(inputs);
        this.metadata = new MetadataDB();
        this.context.utils.getEntityMetadata.callsFake((entityName: string, attributes?: string[]) => {
            return new Promise<ComponentFramework.PropertyHelper.EntityMetadata>((resolve) => {
                const result = this.metadata.metadata.find({
                    LogicalName: 'systemuser',
                });
            });
        });

        this.context.mode.setControlState.callsFake((state: ComponentFramework.Dictionary) => {
            this.state = { ...state, ...this.state };
            return true;
        });

        this.data = {};
        this.data['systemuser'] = {};
        this.data['systemuser'][this.myUserId] = new EntityRecord('systemuser', this.myUserId, 'Betim Beja');

        this.context.userSettings.userId = this.myUserId;
        this.context.userSettings.userName = this.data['systemuser'][this.myUserId].name;

        this.notifyOutputChanged = stub();
        this.notifyOutputChanged.callsFake(() => {
            const updates = this.control.getOutputs?.();
            this.context.updatedProperties = [];
            for (const k in updates) {
                if (k in this.context.parameters) {
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

                    // @ts-ignore
                    this.context.parameters[k].setValue(updates[k]);
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
