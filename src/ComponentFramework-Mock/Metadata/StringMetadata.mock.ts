import { MetadataMock }
    from "@albanian-xrm/componentframework-mock/ComponentFramework-Mock/Metadata/Metadata.mock";

export class StringMetadataMock
    extends MetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.StringMetadata {
    Format: string;
    ImeMode: ComponentFramework.PropertyHelper.Types.ImeMode;
    MaxLength: number;
}