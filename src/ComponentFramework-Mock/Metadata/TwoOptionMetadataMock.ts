import { OptionMetadataMock } from "./OptionMetadataMock";
import sinon, { SinonStubbedInstance } from 'sinon';

export class TwoOptionMetadataMock implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.TwoOptionMetadata {
    Options: [
        SinonStubbedInstance<ComponentFramework.PropertyHelper.OptionMetadata>,
        SinonStubbedInstance<ComponentFramework.PropertyHelper.OptionMetadata>
    ];
    DefaultValue: boolean;
    DisplayName: string;
    LogicalName: string;
    RequiredLevel: ComponentFramework.PropertyHelper.Types.RequiredLevel;
    IsSecured: boolean;
    SourceType: number;
    Description: string;
    constructor(defaultValue?: boolean) {
        this.DefaultValue = defaultValue || false;
        const FalseOption = sinon.createStubInstance(OptionMetadataMock, { Value: 0, Label: 'No' });
        const TrueOption = sinon.createStubInstance(OptionMetadataMock, { Value: 1, Label: 'Yes' });
        this.Options = [FalseOption, TrueOption];
    }
}