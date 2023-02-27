/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

/// <reference path="../global.d.ts" />

import type { PropertyToMock } from '../ComponentFramework-Mock';
import type { MockGenerator } from './MockGenerator';
import type { ShkoOnline } from '../ShkoOnline';

import { stub } from 'sinon';
import { DataSetMock } from '../ComponentFramework-Mock';

export const mockRefreshDatasets = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
    callback: () => void,
) => {
    mockGenerator.RefreshDatasets = stub();
    mockGenerator.RefreshDatasets.callsFake(() => {
        Object.getOwnPropertyNames<PropertyToMock<TInputs>>(mockGenerator.context._parameters).forEach(
            (propertyName) => {
                const mock = mockGenerator.context._parameters[propertyName];
                if (!(mock instanceof DataSetMock) || !mock._loading) {
                    return;
                }
                setTimeout(() => {
                    mock._loading = !mock._loading;
                    mockGenerator.RefreshParameters();
                    mockGenerator.context.updatedProperties = [propertyName as string, 'dataset'];
                    callback();
                    mock._onLoaded();
                }, mock._delay);
            },
        );
    });
};
