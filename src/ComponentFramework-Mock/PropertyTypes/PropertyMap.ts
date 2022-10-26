/*
    Unless explicitly acquired and licensed from Licensor under another
    license, the contents of this file are subject to the Reciprocal Public
    License ("RPL") Version 1.5, or subsequent versions as allowed by the RPL,
    and You may not copy or use this file in either source code or executable
    form, except in compliance with the terms and conditions of the RPL.

    All software distributed under the RPL is provided strictly on an "AS
    IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND
    LICENSOR HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT
    LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
    PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT. See the RPL for specific
    language governing rights and limitations under the RPL. 
*/

import { DateTimePropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DateTimeProperty.mock';
import { DecimalNumberPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DecimalNumberProperty.mock';
import { StringPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/StringProperty.mock';
import { TwoOptionsPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/TwoOptionsProperty.mock';
import { LookupPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/LookupProperty.mock';
import { NumberPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/NumberProperty.mock';
import { WholeNumberPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/WholeNumberProperty.mock';
import { MultiSelectOptionSetPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/MultiSelectOptionSetProperty.mock';
import { DataSetMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DataSet.mock';
import { EnumPropertyMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/EnumProperty.mock';
import { OptionSetPropertyMock } from './OptionSetProperty.mock';
import { MetadataDB } from '@shko-online/componentframework-mock/ComponentFramework-Mock-Generator/Metadata.db';

export type PropertyToMock<T extends ShkoOnline.PropertyTypes<T>> =
{
    [P in keyof T]:
    T[P] extends ComponentFramework.PropertyTypes.DataSet
    ? DataSetMock
    : T[P] extends ComponentFramework.PropertyTypes.DateTimeProperty
    ? DateTimePropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.DecimalNumberProperty
    ? DecimalNumberPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.EnumProperty<string>
    ? EnumPropertyMock<string>
    : T[P] extends ComponentFramework.PropertyTypes.LookupProperty
    ? LookupPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty
    ? MultiSelectOptionSetPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.NumberProperty
    ? NumberPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.OptionSetProperty
    ? OptionSetPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.StringProperty
    ? StringPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.TwoOptionsProperty
    ? TwoOptionsPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.WholeNumberProperty
    ? WholeNumberPropertyMock
    : never;
}

type extractGeneric<Type> = Type extends EnumPropertyMock<infer X> ? X : never

export type MockToRaw<TInput extends ShkoOnline.PropertyTypes<TInput>,T extends PropertyToMock<TInput>> = {
    [P in keyof T as T[P] extends DataSetMock ? never: P]:
     T[P] extends DateTimePropertyMock
    ? Date
    : T[P] extends DecimalNumberPropertyMock
    ? number
    : T[P] extends EnumPropertyMock<string>
    ? extractGeneric<T[P]>
    : T[P] extends LookupPropertyMock
    ? ComponentFramework.LookupValue
    : T[P] extends MultiSelectOptionSetPropertyMock
    ? number[]
    : T[P] extends NumberPropertyMock
    ? number
    : T[P] extends OptionSetPropertyMock
    ? number
    : T[P] extends StringPropertyMock
    ? string
    : T[P] extends TwoOptionsPropertyMock
    ? boolean
    : T[P] extends WholeNumberPropertyMock
    ? number
    : never;
}

export type PropertyMap<T extends ShkoOnline.PropertyTypes<T>> = {
    [P in keyof T]:
    T[P] extends ComponentFramework.PropertyTypes.DataSet
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => DataSetMock
    : T[P] extends ComponentFramework.PropertyTypes.DateTimeProperty
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => DateTimePropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.DecimalNumberProperty
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => DecimalNumberPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.EnumProperty<string>
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => EnumPropertyMock<string>
    : T[P] extends ComponentFramework.PropertyTypes.LookupProperty
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => LookupPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => MultiSelectOptionSetPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.NumberProperty
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => NumberPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.OptionSetProperty
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => OptionSetPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.StringProperty
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => StringPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.TwoOptionsProperty
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => TwoOptionsPropertyMock
    : T[P] extends ComponentFramework.PropertyTypes.WholeNumberProperty
    ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => WholeNumberPropertyMock
    : never;
};
