import { NumberMetadataMock }
    from "@albanian-xrm/componentframework-mock/ComponentFramework-Mock/Metadata/NumberMetadata.mock";

export class DecimalNumberMetadataMock
    extends NumberMetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.DecimalNumberMetadata {
    Precision: number;
}