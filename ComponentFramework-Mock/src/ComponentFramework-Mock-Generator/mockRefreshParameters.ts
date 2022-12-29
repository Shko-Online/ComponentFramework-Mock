/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { MockGenerator } from './MockGenerator';
import type { ShkoOnline } from '../ShkoOnline';

export const mockRefreshParameters = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
) => {
    mockGenerator._RefreshParameters.callsFake(() => {
        Object.getOwnPropertyNames<ShkoOnline.PropertyTypes<TInputs>>(mockGenerator.context.parameters).forEach(
            (propertyName) => {
                mockGenerator.context._parameters[propertyName]._Refresh();
            },
        );
    });
};
