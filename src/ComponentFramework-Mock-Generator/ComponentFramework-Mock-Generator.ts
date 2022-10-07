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
import { ContextMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/Context.mock';
import { PropertyMap } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/PropertyMap';
import { KnownTypes } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/KnownTypes';
import { MultiSelectOptionSetPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/MultiSelectOptionSetProperty.mock';
import { EntityRecord } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSetApi/EntityRecord.mock';
import { MetadataDB } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/Metadata.db';
import { arrayEqual } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/arrayEqual';

export class ComponentFrameworkMockGenerator<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends KnownTypes<TOutputs>,
> {
    control: SinonSpiedInstance<ComponentFramework.StandardControl<TInputs, TOutputs>>;
    context: ContextMock<TInputs>;
    notifyOutputChanged: SinonSpy<[], void>;
    state: ComponentFramework.Dictionary;
    container: HTMLDivElement;

    data: {
        [entityName: string]: {
            [entityId: string]: EntityRecord;
        };
    };

    myUserId: string;
    metadata: MetadataDB;

    constructor(
        control: new () => ComponentFramework.StandardControl<TInputs, TOutputs>,
        inputs: PropertyMap<TInputs>,
        container?: HTMLDivElement,
    ) {
        this.control = spy(new control());
        this.context = new ContextMock(inputs);
        this.metadata = new MetadataDB();
        this.context.utils.getEntityMetadata.callsFake((entityName: string, attributes?: string[]) => {
            return new Promise<ComponentFramework.PropertyHelper.EntityMetadata>((resolve) => {
                const result = this.metadata.metadata.findOne({
                    LogicalName: { $eq: entityName },
                });
                result.Attributes;
                resolve({
                    LogicalName: result.LogicalName,
                    ActivityTypeMask: result.ActivityTypeMask,
                    PrimaryNameAttribute: result.PrimaryNameAttribute,
                } as ShkoOnline.EntityMetadata);
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

        this.notifyOutputChanged = fake(() => {
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

        this.container = container ?? document.createElement('div');
        this.context.mode.trackContainerResize.callsFake((value) => {
            const observer = new ResizeObserver((entries) => {
                const size = entries[0];
                this.context.mode.allocatedHeight = size.contentRect.height;
                this.context.mode.allocatedWidth = size.contentRect.width;
                this.ExecuteUpdateView();
            });
            if (value) observer.observe(container);
            else observer.unobserve(container);
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
        this.control.init(this.context, this.notifyOutputChanged, state, this.container);
    }

    ExecuteUpdateView() {
        // for(let k in this.context.parameters ){
        //   this.context.parameters[k].refresh();
        // }
        this.control.updateView(this.context);
    }
}
