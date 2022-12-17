/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { MetadataMock } from './Metadata.mock';
import { OptionMetadataMock } from './OptionMetadata.mock';

export class OptionSetMetadataMock
    extends MetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.OptionSetMetadata
{
    Options: OptionMetadataMock[];
    DefaultValue: number;
    constructor() {
        super();
        this.Options = [];
        this.DefaultValue = 0;
    }
}
