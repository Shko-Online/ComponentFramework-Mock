/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { MockGenerator } from './MockGenerator';

export const mockGetEntityMetadata = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
) => {
    mockGenerator.context.utils.getEntityMetadata.callsFake((entityName: string, attributes?: string[]) => {
        return new Promise<ShkoOnline.EntityMetadata>((resolve, reject) => {
            const result = mockGenerator.metadata.metadata.findOne({
                LogicalName: { $eq: entityName },
            }) as ShkoOnline.EntityMetadata & Partial<LokiObj>;
            if(!result){
                reject(`Could not find entity metadata for '${entityName}'`);
                return;
            }
            if (attributes) {
                result.Attributes = result.Attributes?.filter((attribute) =>
                    attributes.some((attributeFilter) => attribute.LogicalName === attributeFilter),
                );
            }
            delete result.$loki;
            delete result.meta;
            resolve(result as ShkoOnline.EntityMetadata);
        });
    });
};
