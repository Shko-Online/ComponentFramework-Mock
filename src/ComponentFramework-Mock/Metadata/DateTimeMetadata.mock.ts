import { MetadataMock }
    from "@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/Metadata.mock";

export class DateTimeMetadataMock
    extends MetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.DateTimeMetadata {
    Behavior: ComponentFramework.FormattingApi.Types.DateTimeFieldBehavior;
    Format: string;
    ImeMode: ComponentFramework.PropertyHelper.Types.ImeMode;
}
