import { OptionMetadataMock } from "./OptionMetadataMock";
import sinon, { SinonStubbedInstance } from 'sinon';

export class TwoOptionMetadataMock implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.TwoOptionMetadata {
    Options: [ComponentFramework.PropertyHelper.OptionMetadata, ComponentFramework.PropertyHelper.OptionMetadata];
    DefaultValue: boolean;
    DisplayName: string;
    LogicalName: string;
    RequiredLevel: ComponentFramework.PropertyHelper.Types.RequiredLevel;
    IsSecured: boolean;
    SourceType: number;
    Description: string;
    constructor(defaultValue?: boolean) {
        this.DefaultValue = defaultValue || false;
        const FalseOption = new OptionMetadataMock(0, 'No');
        const TrueOption = new OptionMetadataMock(1, 'Yes');
        this.Options = [FalseOption, TrueOption];
    }
}