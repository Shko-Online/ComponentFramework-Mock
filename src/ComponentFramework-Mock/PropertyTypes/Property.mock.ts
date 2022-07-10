export class PropertyMock implements ComponentFramework.PropertyTypes.Property{
    error: boolean;
    errorMessage: string;
    formatted?: string;
    security?: ComponentFramework.PropertyHelper.SecurityValues;
    raw: any;
    type: string;
    attributes?: ComponentFramework.PropertyHelper.FieldPropertyMetadata.Metadata;
}