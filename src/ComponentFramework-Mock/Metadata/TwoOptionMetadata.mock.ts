import { MetadataMock } 
    from "@albanian-xrm/componentframework-mock/ComponentFramework-Mock/Metadata/Metadata.mock";
import { OptionMetadataMock } 
    from "@albanian-xrm/componentframework-mock/ComponentFramework-Mock/Metadata/OptionMetadata.mock";

export class TwoOptionMetadataMock 
    extends MetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.TwoOptionMetadata {
    Options: [OptionMetadataMock, OptionMetadataMock];
    DefaultValue: boolean;
    constructor(defaultValue?: boolean) {
        super();        
        const FalseOption = new OptionMetadataMock(0, 'No');
        const TrueOption = new OptionMetadataMock(1, 'Yes');
        this.Options = [FalseOption, TrueOption];
        this.DefaultValue = defaultValue || false;
    }
}