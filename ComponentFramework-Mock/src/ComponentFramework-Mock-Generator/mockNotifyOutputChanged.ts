/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { SinonSpy, stub } from 'sinon';
import { LookupPropertyMock, MultiSelectOptionSetPropertyMock } from '../ComponentFramework-Mock/PropertyTypes';
import { arrayEqual, itemEqual } from '../utils';
import { MockGenerator } from './MockGenerator';

export const mockNotifyOutputChanged = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
    getOutputs: SinonSpy<[], TOutputs> | undefined,
    executeUpdateView: () => void,
) => {
    mockGenerator.notifyOutputChanged = stub();
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
                } /*else if (typeof updates[k] === 'object') {
                    // ToDo
                }*/ else {
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
        }
    });
};
