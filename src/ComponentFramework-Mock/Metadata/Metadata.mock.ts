/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

export class MetadataMock implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.Metadata {
    DisplayName: string;
    LogicalName: string;
    RequiredLevel: ComponentFramework.PropertyHelper.Types.RequiredLevel;
    IsSecured: boolean;
    SourceType: number;
    Description: string;
    constructor() {
        this.DisplayName = '';
        this.LogicalName = '';
        this.RequiredLevel = 0;
        this.IsSecured = false;
        this.SourceType = 0;
        this.Description = '';
    }
}
