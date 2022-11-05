import { MockGenerator } from './MockGenerator';

export const mockGetEntityMetadata = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
) => {
    mockGenerator.context.utils.getEntityMetadata.callsFake((entityName: string, attributes?: string[]) => {
        return new Promise<ShkoOnline.EntityMetadata>((resolve) => {
            const result = mockGenerator.metadata.metadata.findOne({
                LogicalName: { $eq: entityName },
            });
            if (attributes) {
                result.Attributes = result.Attributes.filter((attribute) =>
                    attributes.some((attributeFilter) => attribute.LogicalName === attributeFilter),
                );
            }
            resolve(result);
        });
    });
};
