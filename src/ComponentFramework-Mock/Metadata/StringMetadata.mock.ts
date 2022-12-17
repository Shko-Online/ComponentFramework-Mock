/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { MetadataMock } from './Metadata.mock';

export class StringMetadataMock
    extends MetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.StringMetadata
{
    Format: string;
    ImeMode: ComponentFramework.PropertyHelper.Types.ImeMode;
    MaxLength: number;
	constructor(){
		super();
		this.Format = '';
		this.ImeMode = 0;
		this.MaxLength = 100;
	}
}
