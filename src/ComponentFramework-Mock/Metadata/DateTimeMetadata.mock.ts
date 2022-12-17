/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { MetadataMock } from './Metadata.mock';

export class DateTimeMetadataMock
    extends MetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.DateTimeMetadata
{
    Behavior: ComponentFramework.FormattingApi.Types.DateTimeFieldBehavior;
    Format: string;
    ImeMode: ComponentFramework.PropertyHelper.Types.ImeMode;
	constructor(){
		super();
		this.Behavior = 0;
		this.Format = '';
		this.ImeMode = 0;
	}
}
