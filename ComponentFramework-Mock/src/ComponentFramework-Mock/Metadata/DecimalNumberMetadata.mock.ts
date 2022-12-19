/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { NumberMetadataMock } from './NumberMetadata.mock';

export class DecimalNumberMetadataMock
    extends NumberMetadataMock
    implements ComponentFramework.PropertyHelper.FieldPropertyMetadata.DecimalNumberMetadata
{
    Precision: number;
	constructor(){
		super();
		this.Precision=0;
	}
}
