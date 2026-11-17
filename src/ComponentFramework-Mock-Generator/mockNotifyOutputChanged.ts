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
    PropertyToMock,
} from '../ComponentFramework-Mock/PropertyTypes';
import { arrayEqual } from '../utils';

/**
 * Compares the value of an update with the current value of a bound property.
 * @returns Whether the value changed, and whether it is a lookup (the first item of the array is stored)
 */
const compareWithProperty = (property: unknown, value: unknown): { changed: boolean; isLookup: boolean } => {
    if (Array.isArray(value)) {
        const arrayUpdate = value as number[];
        return {
            changed: !arrayEqual(arrayUpdate, (property as MultiSelectOptionSetPropertyMock).raw),
            isLookup: typeof arrayUpdate[0] === 'object',
        };
    }
    if (value instanceof Date) {
        return {
            changed: (property as DateTimePropertyMock).raw?.getTime() !== value.getTime(),
            isLookup: false,
        };
    }
    if (typeof value === 'object') {
        const lookup = value as ComponentFramework.LookupValue;
        const raw = (property as LookupPropertyMock).raw;
        return {
            changed:
                raw === null ||
                raw.length === 0 ||
                raw[0].entityType !== lookup.entityType ||
                raw[0].id !== lookup.id ||
                raw[0].name !== lookup.name,
            isLookup: true,
        };
    }
    return { changed: (property as MultiSelectOptionSetPropertyMock).raw !== value, isLookup: false };
};

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
        if (mockGenerator.context.mode._FullScreen !== value) {
            mockGenerator.context.updatedProperties.push(value ? 'fullscreen_open' : 'fullscreen_close');
        }
        mockGenerator.context.mode._FullScreen = value;
        executeUpdateView();
    });

    mockGenerator.UpdateValues.callsFake((items) => {
        mockGenerator.context.updatedProperties = [];
        for (const k in items) {
            if (!(k in mockGenerator.context._parameters)) continue;
            const property = mockGenerator.context._parameters[k as keyof PropertyToMock<TInputs>];
            const { changed, isLookup } = compareWithProperty(property, items[k]);
            if (!changed) continue;

            mockGenerator.context.updatedProperties.push(k);
            mockGenerator._PendingUpdates.push({
                column: property._boundColumn,
                row: property._boundRow,
                table: property._boundTable,
                value: isLookup ? (items[k] as ComponentFramework.LookupValue[])[0] : items[k],
            });
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
                const property = mockGenerator.context._parameters[k];
                const { changed, isLookup } = compareWithProperty(property, updates[k]);
                if (!changed) continue;

                mockGenerator.context.updatedProperties.push(k);
                mockGenerator.metadata.UpdateValue(
                    isLookup ? (updates[k] as ComponentFramework.LookupValue[])[0] : updates[k],
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
