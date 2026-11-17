/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { NumberMetadataMock } from './NumberMetadata.mock';

export class WholeNumberMetadataMock
    extends NumberMetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.WholeNumberMetadata
{
    Format: string;
    LanguageByCode?: ComponentFramework.Dictionary;
    TimeZoneByCode?: ComponentFramework.Dictionary;
    constructor() {
        super();
        this.Format = '#';
    }
}
