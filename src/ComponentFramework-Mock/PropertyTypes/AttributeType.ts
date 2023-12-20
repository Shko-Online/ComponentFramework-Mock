/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

/**
 * Describes the type of an attribute.
 * For the Web API use the AttributeTypeCode EnumType.
 */
export const AttributeType = {
    /** A big integer attribute */
    BigInt: 18,
    /** A Boolean attribute. Value = 0. */
    Boolean: 0,

    /** An attribute that contains calendar rules. Value = 0x10. */
    CalendarRules: 16,

    /** An attribute that represents a customer. Value = 1.*/
    Customer: 1,

    /** A date/time attribute. Value = 2. */
    DateTime: 2,

    /** A decimal attribute. Value = 3. */
    Decimal: 3,

    /** A double attribute. Value = 4. */
    Double: 4,

    /** An entity name attribute. Value = 20. */
    EntityName: 20,

    /**
     * An integer attribute. Value = 5.
     */
    Integer: 5,

    /**A lookup attribute. Value = 6. */
    Lookup: 6,

    /** A managed property attribute. Value = 0x13. */
    ManagedProperty: 19,

    /** A memo attribute. Value = 7. */
    Memo: 7,

    /** A money attribute. Value = 8. */
    Money: 8,

    /** An owner attribute. Value = 9. */
    Owner: 9,

    /** A partylist attribute. Value = 10.*/
    PartyList: 10,

    /** A picklist attribute. Value = 11. */
    Picklist: 11,

    /** A state attribute. Value = 12. */
    State: 12,

    /** A status attribute. Value = 13. */
    Status: 13,

    /** A string attribute. Value = 14.*/
    String: 14,

    /** An attribute that is an ID. Value = 15. */
    Uniqueidentifier: 15,

    /** An attribute that is created by the system at run time. Value = 0x11. */
    Virtual: 17,
} as const;

export const OptionSetType = {
    /** The option set provides a list of options. */
    Picklist: 0,
    /** The option set represents state options for a StateAttributeMetadata attribute. */
    State: 1,
    /** The option set represents status options for a StatusAttributeMetadata attribute. */
    Status: 2,
    /** The option set provides two options for a BooleanAttributeMetadata attribute. */
    Boolean: 3,
} as const;
