/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonSpy } from 'sinon';
import type { MockGenerator } from './MockGenerator';
import type { ShkoOnline } from '../ShkoOnline';

import {
    DateTimePropertyMock,
    LookupPropertyMock,
    MultiSelectOptionSetPropertyMock,
    PropertyMock,
    PropertyToMock,
} from '../ComponentFramework-Mock/PropertyTypes';
import { arrayEqual } from '../utils';

/**
 * Mocks the following APIs
 * - {@link ComponentFramework.Mode.setFullScreen}
 * - {@link ComponentFramework.Factory.requestRender}
 * - notifyOutputChanged function
 * @param mockGenerator The generator that controlls the context
 * @param getOutputs The plugin getOutputs function
 * @param executeUpdateView The callback function that triggers UpdateView from the framework
 */
export const mockNotifyOutputChanged = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
    getOutputs: SinonSpy<[], TOutputs> | undefined,
    executeUpdateView: () => void,
) => {
    mockGenerator.context.factory.requestRender.callsFake(() => {
        setInterval(() => executeUpdateView(), 0);
    });

    mockGenerator.context.mode.setFullScreen.callsFake((value) => {
        mockGenerator.context.updatedProperties = [];
        if (mockGenerator.context.mode._FullScreen != value) {
            mockGenerator.context.updatedProperties.push(value ? 'fullscreen_open' : 'fullscreen_close');
        }
        mockGenerator.context.mode._FullScreen = value;
        executeUpdateView();
    });

    mockGenerator.UpdateValues.callsFake((items) => {
        mockGenerator.context.updatedProperties = [];
        for (const k in items) {
            if (k in mockGenerator.context._parameters) {
                let isLookup = false;
                const property = mockGenerator.context._parameters[k as keyof PropertyToMock<TInputs>];

                if (Array.isArray(items[k])) {
                    const arrayUpdate = items[k] as number[];
                    if (arrayUpdate && typeof arrayUpdate[0] === 'object') {
                        isLookup = true;
                    }
                    const property = mockGenerator.context._parameters[k] as MultiSelectOptionSetPropertyMock;
                    if (!arrayEqual(arrayUpdate, property.raw)) {
                        mockGenerator.context.updatedProperties.push(k);
                    } else {
                        continue;
                    }
                } else if (items[k] instanceof Date) {
                    if (
                        (mockGenerator.context._parameters[k] as unknown as DateTimePropertyMock).raw?.getTime() !==
                        (items[k] as Date)?.getTime()
                    ) {
                        mockGenerator.context.updatedProperties.push(k);
                    } else {
                        continue;
                    }
                } else if (typeof items[k] === 'object') {
                    isLookup = true;
                    const lookup = items[k] as ComponentFramework.LookupValue;
                    const property = mockGenerator.context._parameters[k] as LookupPropertyMock;
                    if (
                        property.raw === null ||
                        property.raw.length === 0 ||
                        property.raw[0].entityType !== lookup.entityType ||
                        property.raw[0].id !== lookup.id ||
                        property.raw[0].name !== lookup.name
                    ) {
                        mockGenerator.context.updatedProperties.push(k);
                    } else {
                        continue;
                    }
                } else if (
                    (mockGenerator.context._parameters[k] as unknown as MultiSelectOptionSetPropertyMock).raw !==
                    items[k]
                ) {
                    mockGenerator.context.updatedProperties.push(k);
                } else {
                    continue;
                }

                mockGenerator._PendingUpdates.push({
                    column: property._boundColumn,
                    row: property._boundRow,
                    table: property._boundTable,
                    value: isLookup ? (items[k] as ComponentFramework.LookupValue[])[0] : items[k],
                });
            }
        }
        if (mockGenerator.context.updatedProperties.length > 0) {
            mockGenerator.context.updatedProperties.push('parameters');
        }
    });

    mockGenerator.notifyOutputChanged.callsFake(() => {
        const updates = getOutputs?.();
        if (!updates) return;

        mockGenerator.context.updatedProperties = [];
        for (const k in updates) {
            if (k in mockGenerator.context._parameters) {
                let isLookup = false;
                const property = mockGenerator.context._parameters[k];

                if (Array.isArray(updates[k])) {
                    const arrayUpdate = updates[k] as number[];
                    if (arrayUpdate && typeof arrayUpdate[0] === 'object') {
                        isLookup = true;
                    }
                    const property = mockGenerator.context._parameters[k] as MultiSelectOptionSetPropertyMock;
                    if (!arrayEqual(arrayUpdate, property.raw)) {
                        mockGenerator.context.updatedProperties.push(k);
                    } else {
                        continue;
                    }
                } else if (updates[k] instanceof Date) {
                    if (
                        (mockGenerator.context._parameters[k] as unknown as DateTimePropertyMock).raw?.getTime() !==
                        (updates[k] as Date)?.getTime()
                    ) {
                        mockGenerator.context.updatedProperties.push(k);
                    } else {
                        continue;
                    }
                } else if (typeof updates[k] === 'object') {
                    isLookup = true;
                    const lookup = updates[k] as ComponentFramework.LookupValue;
                    const property = mockGenerator.context._parameters[k] as LookupPropertyMock;
                    if (
                        property.raw === null ||
                        property.raw.length === 0 ||
                        property.raw[0].entityType !== lookup.entityType ||
                        property.raw[0].id !== lookup.id ||
                        property.raw[0].name !== lookup.name
                    ) {
                        mockGenerator.context.updatedProperties.push(k);
                    } else {
                        continue;
                    }
                } else if (
                    (mockGenerator.context._parameters[k] as unknown as MultiSelectOptionSetPropertyMock).raw !==
                    updates[k]
                ) {
                    mockGenerator.context.updatedProperties.push(k);
                } else {
                    continue;
                }

                if (isLookup) {
                    mockGenerator.metadata.UpdateValue(
                        (updates[k] as ComponentFramework.LookupValue[])[0],
                        property._boundTable,
                        property._boundColumn,
                        property._boundRow,
                    );
                    continue;
                }

                mockGenerator.metadata.UpdateValue(
                    updates[k],
                    property._boundTable,
                    property._boundColumn,
                    property._boundRow,
                );
            } else if (k in mockGenerator.outputOnlyProperties) {
                mockGenerator.context.updatedProperties.push(k);
            }
        }
        if (mockGenerator.context.updatedProperties.length > 0) {
            mockGenerator.context.updatedProperties.push('parameters');
        }
        executeUpdateView();
        mockGenerator.onOutputChanged?.(updates);
    });
};
