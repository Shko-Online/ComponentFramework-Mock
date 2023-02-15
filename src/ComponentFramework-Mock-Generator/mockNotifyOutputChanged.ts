/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonSpy } from 'sinon';
import type { MockGenerator } from './MockGenerator';
import type { ShkoOnline } from '../ShkoOnline';

import { DateTimePropertyMock, MultiSelectOptionSetPropertyMock } from '../ComponentFramework-Mock/PropertyTypes';
import { arrayEqual } from '../utils';

export const mockNotifyOutputChanged = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
    getOutputs: SinonSpy<[], TOutputs> | undefined,
    executeUpdateView: () => void,
) => {
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
                    }
                } else if (updates[k] instanceof Date) {
                    if (
                        (mockGenerator.context._parameters[k] as unknown as DateTimePropertyMock).raw?.getTime() !==
                        (updates[k] as Date)?.getTime()
                    ) {
                        mockGenerator.context.updatedProperties.push(k);
                    }
                } else {
                /*else if (typeof updates[k] === 'object') {
                    // ToDo
                }*/
                    if (
                        (mockGenerator.context._parameters[k] as unknown as MultiSelectOptionSetPropertyMock).raw !==
                        updates[k]
                    ) {
                        mockGenerator.context.updatedProperties.push(k);
                    }
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
            }
        }
        if (mockGenerator.context.updatedProperties.length > 0) {
            executeUpdateView();
            mockGenerator.onOutputChanged?.();
        }
    });
};
