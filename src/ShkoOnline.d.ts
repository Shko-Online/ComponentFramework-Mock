/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type * as DataverseMetadata from './ComponentFramework-Mock-Generator/Metadata.db/Metadata.types';

declare namespace ShkoOnline {
    type EnumType<Type> = Type extends ComponentFramework.PropertyTypes.EnumProperty<infer X> ? X : never;

    export type PropertyTypes<T extends { [key: string]: any }> = {
        [P in keyof T]: T[P] extends ComponentFramework.PropertyTypes.Property
        ? T[P]
        : T[P] extends ComponentFramework.PropertyTypes.EnumProperty<EnumType<T[P]>>
        ? T[P]
        : T[P] extends ComponentFramework.PropertyTypes.DataSet
        ? T[P]
        : never;
    };

    /**
     * The entire property bag interface available to control via Context Object
     */
    export interface Context<TInputs extends PropertyTypes<TInputs>> {
        parameters: TInputs;
    }

    export type KnownTypes<TOutput> = {
        [P in keyof TOutput]: TOutput[P] extends string | undefined
        ? TOutput[P]
        : TOutput[P] extends number | undefined
        ? TOutput[P]
        : TOutput[P] extends Date | undefined
        ? TOutput[P]
        : TOutput[P] extends boolean | undefined
        ? TOutput[P]
        : TOutput[P] extends ComponentFramework.LookupValue[] | undefined
        ? TOutput[P]
        : TOutput[P] extends number[] | undefined
        ? TOutput[P]
        : 0 extends 1 & TOutput[P] // any trick copied from here https://stackoverflow.com/a/55541672
        ? any
        : never;
    };

    export type OutputOnlyTypes<TInput extends PropertyTypes<TInput>, TOutput extends KnownTypes<TOutput>> = {
        [P in keyof TOutput]: P extends keyof TInput
        ? never
        : 0 extends 1 & TOutput[P] // any trick copied from here https://stackoverflow.com/a/55541672
        ? 'any'
        : TOutput[P] extends string | undefined
        ? 'string'
        : TOutput[P] extends number | undefined
        ? 'number'
        : TOutput[P] extends Date | undefined
        ? 'Date'
        : TOutput[P] extends boolean | undefined
        ? 'boolean'
        : TOutput[P] extends ComponentFramework.LookupValue[] | undefined
        ? 'Lookup'
        : TOutput[P] extends number[] | undefined
        ? 'number'
        : never;
    };

    // The Dataverse metadata types live in the Metadata.db core, which does not depend on PCF.
    // They are aliased here to keep the ShkoOnline namespace backward compatible.

    /** https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/xrm-utility/getentitymetadata */
    export type EntityMetadata = DataverseMetadata.EntityMetadata;
    export type AttributeMetadataCollection = DataverseMetadata.AttributeMetadataCollection;
    export type Privileges = DataverseMetadata.Privileges;
    export type AttributeMetadata = DataverseMetadata.AttributeMetadata;
    export type BooleanAttributeMetadata = DataverseMetadata.BooleanAttributeMetadata;
    export type BooleanOptionSet = DataverseMetadata.BooleanOptionSet;
    export type BooleanManagedProperty = DataverseMetadata.BooleanManagedProperty;
    export type StringAttributeMetadata = DataverseMetadata.StringAttributeMetadata;
    export type NumberAttributeMetadata = DataverseMetadata.NumberAttributeMetadata;
    export type DecimalNumberAttributeMetadata = DataverseMetadata.DecimalNumberAttributeMetadata;
    export type IntegerNumberAttributeMetadata = DataverseMetadata.IntegerNumberAttributeMetadata;
    export type DateTimeAttributeMetadata = DataverseMetadata.DateTimeAttributeMetadata;
    export type LookupAttributeMetadata = DataverseMetadata.LookupAttributeMetadata;
    export type EnumTypeAttributeMetadata = DataverseMetadata.EnumTypeAttributeMetadata;
    export type PickListAttributeMetadata = DataverseMetadata.PickListAttributeMetadata;
    export type StateAttributeMetadata = DataverseMetadata.StateAttributeMetadata;
    export type StatusAttributeMetadata = DataverseMetadata.StatusAttributeMetadata;
    export type ImeMode = DataverseMetadata.ImeMode;
    export type DateTimeFieldBehavior = DataverseMetadata.DateTimeFieldBehavior;
    export type PrivilegeType = DataverseMetadata.PrivilegeType;
    export type AttributeRequiredLevel = DataverseMetadata.AttributeRequiredLevel;
    export type OptionSet<T extends OptionSetType> = DataverseMetadata.OptionSet<T>;

    /**
     * https://learn.microsoft.com/en-us/dotnet/api/microsoft.xrm.sdk.metadata.optionsettype
     */
    export enum OptionSetType {
        /** The option set provides a list of options. */
        Picklist = 0,
        /** The option set represents state options for a StateAttributeMetadata attribute. */
        State = 1,
        /** The option set represents status options for a StatusAttributeMetadata attribute. */
        Status = 2,
        /** The option set provides two options for a BooleanAttributeMetadata attribute. */
        Boolean = 3,
    }

    /**
     * Describes the type of an attribute.
     * For the Web API use the AttributeTypeCode EnumType.
     */
    export enum AttributeType {
        /** A big integer attribute */
        BigInt = 18,
        /** A Boolean attribute. Value = 0. */
        Boolean = 0,

        /** An attribute that contains calendar rules. Value = 0x10. */
        CalendarRules = 16,

        /** An attribute that represents a customer. Value = 1.*/
        Customer = 1,

        /** A date/time attribute. Value = 2. */
        DateTime = 2,

        /** A decimal attribute. Value = 3. */
        Decimal = 3,

        /** A double attribute. Value = 4. */
        Double = 4,

        /** An entity name attribute. Value = 20. */
        EntityName = 20,

        /**
         * An integer attribute. Value = 5.
         */
        Integer = 5,

        /**A lookup attribute. Value = 6. */
        Lookup = 6,

        /** A managed property attribute. Value = 0x13. */
        ManagedProperty = 19,

        /** A memo attribute. Value = 7. */
        Memo = 7,

        /** A money attribute. Value = 8. */
        Money = 8,

        /** An owner attribute. Value = 9. */
        Owner = 9,

        /** A partylist attribute. Value = 10.*/
        PartyList = 10,

        /** A picklist attribute. Value = 11. */
        Picklist = 11,

        /** A state attribute. Value = 12. */
        State = 12,

        /** A status attribute. Value = 13. */
        Status = 13,

        /** A string attribute. Value = 14.*/
        String = 14,

        /** An attribute that is an ID. Value = 15. */
        Uniqueidentifier = 15,

        /** An attribute that is created by the system at run time. Value = 0x11. */
        Virtual = 17,
    }
}

export type { ShkoOnline };
