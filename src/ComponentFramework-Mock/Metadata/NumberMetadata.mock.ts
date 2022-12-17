/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { MetadataMock } from './Metadata.mock';

export class NumberMetadataMock
    extends MetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.NumberMetadata
{
    ImeMode: ComponentFramework.PropertyHelper.Types.ImeMode;
    MinValue: number;
    MaxValue: number;
	constructor(){
		super();
		this.ImeMode = 0;
		this.MinValue = Number.MIN_SAFE_INTEGER;
		this.MaxValue = Number.MAX_SAFE_INTEGER;
	}
}
