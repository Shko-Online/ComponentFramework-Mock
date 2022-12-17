/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { MetadataMock } from './Metadata.mock';
import { OptionMetadataMock } from './OptionMetadata.mock';

export class TwoOptionMetadataMock
    extends MetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.TwoOptionMetadata
{
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
