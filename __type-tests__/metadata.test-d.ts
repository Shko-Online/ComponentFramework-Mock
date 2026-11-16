/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../src/ShkoOnline';
import type { DataverseMetadata } from '../src';
import { AttributeType, OptionSetType } from '../src';
import { expectAssignable, expectType } from 'tsd';

// The ShkoOnline metadata types are aliases of the core types
declare const entity: ShkoOnline.EntityMetadata;
expectType<DataverseMetadata.EntityMetadata>(entity);

// The declared ShkoOnline enums stay interchangeable with the AttributeType and OptionSetType constants
expectAssignable<DataverseMetadata.AttributeTypeCode>({} as ShkoOnline.AttributeType);
expectAssignable<ShkoOnline.AttributeType>(AttributeType.Lookup);
expectAssignable<ShkoOnline.LookupAttributeMetadata['AttributeType']>({} as ShkoOnline.AttributeType.Lookup);
expectAssignable<ShkoOnline.OptionSet<ShkoOnline.OptionSetType.Picklist>>({
    MetadataId: '',
    IsCustomOptionSet: false,
    Name: 'choice',
    OptionSetType: OptionSetType.Picklist,
    Options: {},
});

// Metadata written with the constants is accepted where the ShkoOnline types are expected
expectAssignable<ShkoOnline.EntityMetadata>({
    LogicalName: 'account',
    Attributes: [{ LogicalName: 'accountid', AttributeType: AttributeType.Uniqueidentifier }],
} as DataverseMetadata.EntityMetadata);
