/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

/// <reference path="../global.d.ts" />

import type { MockGenerator } from './MockGenerator';
import type { ShkoOnline } from '../ShkoOnline';
import { stub } from 'sinon';

export const mockRefreshParameters = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
) => {
    mockGenerator.RefreshParameters = stub();
    mockGenerator.RefreshParameters.callsFake(() => {
        if (mockGenerator._PendingUpdates.length !== 0) {
            mockGenerator._PendingUpdates.forEach(update=>{
                mockGenerator.metadata.UpdateValue(update.value, update.table, update.column, update.row);
            });
            mockGenerator._PendingUpdates = [];
        }
        Object.getOwnPropertyNames<ShkoOnline.PropertyTypes<TInputs>>(mockGenerator.context.parameters).forEach(
            (propertyName) => {
                mockGenerator.context._parameters[propertyName]._Refresh();
            },
        );
    });
};
