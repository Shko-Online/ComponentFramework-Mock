/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { MockGenerator } from './MockGenerator';
import type { ShkoOnline } from '../ShkoOnline';

export const mockGetEntityMetadata = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
) => {
    mockGenerator.context.utils.getEntityMetadata.callsFake((entityName: string, attributes?: string[]) => {
        return new Promise<ShkoOnline.EntityMetadata>((resolve, reject) => {
            const result = mockGenerator.metadata.getTableMetadata(entityName);
            if (!result) {
                reject(`Could not find entity metadata for '${entityName}'`);
                return;
            }
            if (attributes) {
                result.Attributes = result.Attributes?.filter((attribute) =>
                    attributes.some((attributeFilter) => attribute.LogicalName === attributeFilter),
                );
            }         
            resolve(result as ShkoOnline.EntityMetadata);
        });
    });
};
