import { NumberMetadataMock } from "@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/NumberMetadata.mock";

export class WholeNumberMetadataMock
    extends NumberMetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.WholeNumberMetadata {
    Format: string;
    LanguageByCode?: ComponentFramework.Dictionary | undefined;
    TimeZoneByCode?: ComponentFramework.Dictionary | undefined;
}