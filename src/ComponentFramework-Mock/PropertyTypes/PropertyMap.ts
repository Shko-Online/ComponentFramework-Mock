/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../ShkoOnline';

import { DateTimePropertyMock } from './DateTimeProperty.mock';
import { DecimalNumberPropertyMock } from './DecimalNumberProperty.mock';
import { StringPropertyMock } from './StringProperty.mock';
import { TwoOptionsPropertyMock } from './TwoOptionsProperty.mock';
import { LookupPropertyMock } from './LookupProperty.mock';
import { NumberPropertyMock } from './NumberProperty.mock';
import { WholeNumberPropertyMock } from './WholeNumberProperty.mock';
import { MultiSelectOptionSetPropertyMock } from './MultiSelectOptionSetProperty.mock';
import { DataSetMock } from './DataSet.mock';
import { EnumPropertyMock } from './EnumProperty.mock';
import { OptionSetPropertyMock } from './OptionSetProperty.mock';
import { PropertyMock } from './Property.mock';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';

export type PropertyToMock<T extends ShkoOnline.PropertyTypes<T>> = {
    [P in keyof T]: T[P] extends ComponentFramework.PropertyTypes.DataSet
        ? DataSetMock
        : T[P] extends ComponentFramework.PropertyTypes.DateTimeProperty
          ? DateTimePropertyMock
          : T[P] extends ComponentFramework.PropertyTypes.DecimalNumberProperty
            ? DecimalNumberPropertyMock
            : T[P] extends ComponentFramework.PropertyTypes.StringProperty
              ? StringPropertyMock
              : T[P] extends ComponentFramework.PropertyTypes.EnumProperty<string>
                ? EnumPropertyMock<ShkoOnline.EnumType<T[P]>>
                : T[P] extends ComponentFramework.PropertyTypes.LookupProperty
                  ? LookupPropertyMock
                  : T[P] extends ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty
                    ? MultiSelectOptionSetPropertyMock
                    : T[P] extends ComponentFramework.PropertyTypes.NumberProperty
                      ? NumberPropertyMock
                      : T[P] extends ComponentFramework.PropertyTypes.OptionSetProperty
                        ? OptionSetPropertyMock
                        : T[P] extends ComponentFramework.PropertyTypes.TwoOptionsProperty
                          ? TwoOptionsPropertyMock
                          : T[P] extends ComponentFramework.PropertyTypes.WholeNumberProperty
                            ? WholeNumberPropertyMock
                            : ComponentFramework.PropertyTypes.Property extends T[P]
                              ? PropertyMock
                              : never;
};

type extractGeneric<Type> = Type extends EnumPropertyMock<infer X> ? X : never;

export type MockToRaw<TInput extends ShkoOnline.PropertyTypes<TInput>, T extends PropertyToMock<TInput>> = {
    [P in keyof T as T[P] extends DataSetMock ? never : P]: T[P] extends DateTimePropertyMock
        ? Date
        : T[P] extends DecimalNumberPropertyMock
          ? number
          : T[P] extends EnumPropertyMock<extractGeneric<T[P]>>
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
                          : T[P] extends PropertyMock
                            ? any
                            : never;
};

export type PropertyMap<T extends ShkoOnline.PropertyTypes<T>> = {
    [P in keyof T]: T[P] extends ComponentFramework.PropertyTypes.DataSet
        ? new (propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) => DataSetMock
        : T[P] extends ComponentFramework.PropertyTypes.DateTimeProperty
          ? new (
                propertyName: string,
                db: MetadataDB,
                entityMetadata: ShkoOnline.EntityMetadata,
            ) => DateTimePropertyMock
          : T[P] extends ComponentFramework.PropertyTypes.DecimalNumberProperty
            ? new (
                  propertyName: string,
                  db: MetadataDB,
                  entityMetadata: ShkoOnline.EntityMetadata,
              ) => DecimalNumberPropertyMock
            : T[P] extends ComponentFramework.PropertyTypes.LookupProperty
              ? new (
                    propertyName: string,
                    db: MetadataDB,
                    entityMetadata: ShkoOnline.EntityMetadata,
                ) => LookupPropertyMock
              : T[P] extends ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty
                ? new (
                      propertyName: string,
                      db: MetadataDB,
                      entityMetadata: ShkoOnline.EntityMetadata,
                  ) => MultiSelectOptionSetPropertyMock
                : T[P] extends ComponentFramework.PropertyTypes.NumberProperty
                  ? new (
                        propertyName: string,
                        db: MetadataDB,
                        entityMetadata: ShkoOnline.EntityMetadata,
                    ) => NumberPropertyMock
                  : T[P] extends ComponentFramework.PropertyTypes.OptionSetProperty
                    ? new (
                          propertyName: string,
                          db: MetadataDB,
                          entityMetadata: ShkoOnline.EntityMetadata,
                      ) => OptionSetPropertyMock
                    : T[P] extends ComponentFramework.PropertyTypes.StringProperty
                      ? new (
                            propertyName: string,
                            db: MetadataDB,
                            entityMetadata: ShkoOnline.EntityMetadata,
                        ) => StringPropertyMock
                      : T[P] extends ComponentFramework.PropertyTypes.EnumProperty<string>
                        ? new (
                              propertyName: string,
                              db: MetadataDB,
                              entityMetadata: ShkoOnline.EntityMetadata,
                          ) => EnumPropertyMock<ShkoOnline.EnumType<T[P]>>
                        : T[P] extends ComponentFramework.PropertyTypes.TwoOptionsProperty
                          ? new (
                                propertyName: string,
                                db: MetadataDB,
                                entityMetadata: ShkoOnline.EntityMetadata,
                            ) => TwoOptionsPropertyMock
                          : T[P] extends ComponentFramework.PropertyTypes.WholeNumberProperty
                            ? new (
                                  propertyName: string,
                                  db: MetadataDB,
                                  entityMetadata: ShkoOnline.EntityMetadata,
                              ) => WholeNumberPropertyMock
                            : ComponentFramework.PropertyTypes.Property extends T[P]
                              ? new (
                                    propertyName: string,
                                    db: MetadataDB,
                                    entityMetadata: ShkoOnline.EntityMetadata,
                                ) => PropertyMock
                              : never;
};
