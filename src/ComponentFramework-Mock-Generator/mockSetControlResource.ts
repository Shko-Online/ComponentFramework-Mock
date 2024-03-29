/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { MockGenerator } from './MockGenerator';
import type { ShkoOnline } from '../ShkoOnline';

import { stub } from 'sinon';

export const mockSetControlResource = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
) => {
    mockGenerator.SetControlResource = stub();
    mockGenerator.SetControlResource.callsFake((resource: string) => {
        const xmlResource = new DOMParser().parseFromString(resource, 'text/xml');
        const elements = xmlResource.getElementsByTagNameNS('', 'data');
        mockGenerator.context.resources.getString.callsFake((id) => {
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].getAttribute('name') === id) {
                    return elements[i].getElementsByTagName('value')[0].innerHTML;
                }
            }
            throw new Error(`Could not find string with id '${id}'`);
        });
    });
};
