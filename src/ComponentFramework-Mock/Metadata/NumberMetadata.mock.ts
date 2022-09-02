import { MetadataMock }
    from "@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/Metadata.mock";

export class NumberMetadataMock
    extends MetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.NumberMetadata {
    ImeMode: ComponentFramework.PropertyHelper.Types.ImeMode;
    MinValue: number;
    MaxValue: number;
}