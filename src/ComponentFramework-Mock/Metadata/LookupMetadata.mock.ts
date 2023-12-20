/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/
import { MetadataMock } from './Metadata.mock';

export class LookupMetadataMock
    extends MetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.LookupMetadata
{
    Targets: string[];
    constructor() {
        super();
        this.Targets = [];
    }
}
