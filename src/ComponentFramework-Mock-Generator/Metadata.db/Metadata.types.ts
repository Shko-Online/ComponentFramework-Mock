/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { AttributeType, OptionSetType } from './AttributeType';

/** One of the values of {@link AttributeType} */
export type AttributeTypeCode = (typeof AttributeType)[keyof typeof AttributeType];

/** One of the values of {@link OptionSetType} */
export type OptionSetTypeCode = (typeof OptionSetType)[keyof typeof OptionSetType];

/** https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/xrm-utility/getentitymetadata */
export interface EntityMetadata {
    /** Whether a custom activity should appear in the activity menus in the Web application. 0 indicates that the custom activity doesn't appear; 1 indicates that it does appear. */
    ActivityTypeMask?: number;
    /**Indicates whether to automatically move records to the owner’s default queue when a record of this type is created or assigned.*/
    AutoRouteToOwnerQueue?: boolean;
    /**For internal use only. */
    CanEnableSyncToExternalSearchIndex?: boolean;
    /**Indicates whether the table can trigger a workflow process.*/
    CanTriggerWorkflow?: boolean;
    /**Description for the table.*/
    Description?: string;
    /**Plural display name for the table.*/
    DisplayCollectionName?: string;
    /**Display name for the table.*/
    DisplayName?: string;
    /**Indicates whether the table will enforce custom state transitions.*/
    EnforceStateTransitions?: boolean;
    /**The hexadecimal code to represent the color to be used for this table in the application.*/
    EntityColor?: string;
    /**Indicates whether activities are associated with this table.*/
    HasActivities?: boolean;
    /**Indicates whether the table is an activity.*/
    IsActivity?: boolean;
    /**Indicates whether the email messages can be sent to an email address stored in a record of this type.*/
    IsActivityParty?: boolean;
    /**Indicates whether the table is enabled for business process flows.*/
    IsBusinessProcessEnabled?: boolean;
    /**Indicates whether the table is a business process flow table.*/
    IsBPFEntity?: boolean;
    /**Indicates whether the table is a child table.*/
    IsChildEntity?: boolean;
    /**Indicates whether connections are enabled for this table.*/
    IsConnectionsEnabled?: boolean;
    /**Indicates whether the table is a custom table.*/
    IsCustomEntity?: boolean;
    /**Indicates whether the table is customizable.*/
    IsCustomizable?: boolean;
    /**Indicates whether document management is enabled.*/
    IsDocumentManagementEnabled?: boolean;
    /** Indicates whether the document recommendations is enabled.*/
    IsDocumentRecommendationsEnabled?: boolean;
    /** Indicates whether duplicate detection is enabled.*/
    IsDuplicateDetectionEnabled?: boolean;
    /**Indicates whether charts are enabled.*/
    IsEnabledForCharts?: boolean;
    /**Indicates whether the table can be imported using the Import Wizard.*/
    IsImportable?: boolean;
    /**Indicates the table is enabled for interactive experience.*/
    IsInteractionCentricEnabled?: boolean;
    /**Indicates whether knowledge management is enabled for the table.*/
    IsKnowledgeManagementEnabled?: boolean;
    /**Indicates whether mail merge is enabled for this table.*/
    IsMailMergeEnabled?: boolean;
    /**Indicates whether the table is part of a managed solution.*/
    IsManaged?: boolean;
    /**Indicates whether OneNote integration is enabled for the table.*/
    IsOneNoteIntegrationEnabled?: boolean;
    /**Indicates whether optimistic concurrency is enabled for the table.*/
    IsOptimisticConcurrencyEnabled?: boolean;
    /**Indicates whether the table is enabled for quick create forms.*/
    IsQuickCreateEnabled?: boolean;
    /**Indicates whether the table supports setting custom state transitions.*/
    IsStateModelAware?: boolean;
    /**Indicates whether the table is will be shown in Advanced Find.*/
    IsValidForAdvancedFind?: boolean;
    /**Indicates whether Microsoft Dynamics 365 for tablets users can see data for this table.*/
    IsVisibleInMobileClient?: boolean;
    /**Indicates whether the table is enabled for Unified Interface.*/
    IsEnabledInUnifiedInterface?: boolean;
    /**The logical collection name.*/
    LogicalCollectionName?: string;
    /**The table type code.*/
    ObjectTypeCode?: number;
    /**The ownership type for the table: "UserOwned" or "OrganizationOwned".*/
    OwnershipType?: string;
    /** The name of the Web API table set for this table. */
    EntitySetName?: string;
    /** The logical name for the table. */
    LogicalName: string;
    /** The unique identifier of the table definition. Generated when missing. */
    MetadataId?: string;
    /**The name of the column that is the primary id for the table.*/
    PrimaryIdAttribute?: string;
    /**The name of the primary image column for a table.*/
    PrimaryImageAttribute?: string;
    /** The name of the primary column for a table. */
    PrimaryNameAttribute?: string;
    /**The privilege definitions for the table where *each* object contains the following values to define the security privilege for access to a table*/
    Privileges?: Privileges[];
    /** A collection of column definitions objects. The object returned depends on the type of column definitions. */
    Attributes?: AttributeMetadata[];
    /** The alternate keys of the table. */
    Keys?: EntityKeyMetadata[];
    /** The one-to-many relationships where this table is the referenced (primary) table. */
    OneToManyRelationships?: OneToManyRelationshipMetadata[];
    /** The many-to-one relationships: the one-to-many relationships where this table is the referencing (related) table. */
    ManyToOneRelationships?: OneToManyRelationshipMetadata[];
    /** The many-to-many relationships this table takes part in. */
    ManyToManyRelationships?: ManyToManyRelationshipMetadata[];
}

export interface AttributeMetadataCollection {
    add: () => void;
    get: (name: string) => AttributeMetadata | undefined;
    getAll: () => AttributeMetadata[];
    getByFilter: () => AttributeMetadata[];
    getByName: (name: string) => AttributeMetadata | undefined;
    getByIndex: (index: number) => AttributeMetadata | undefined;
    getFirst: (lambda: (attribute: AttributeMetadata) => boolean) => AttributeMetadata | undefined;
    getLength: () => number;
    remove: () => void;
}

export interface Privileges {
    /**Whether the privilege can be basic access level.*/
    CanBeBasic: boolean;
    /**Whether the privilege can be deep access level*/
    CanBeDeep: boolean;
    /**Whether the privilege for an external party can be basic access level.*/
    CanBeEntityReference: boolean;
    /**Whether the privilege can be global access level.*/
    CanBeGlobal: boolean;
    /**Whether the privilege can be local access level*/
    CanBeLocal: boolean;
    /**Whether the privilege for an external party can be parent access level.*/
    CanBeParentEntityReference: boolean;
    /**The name of the privilege*/
    Name: string;
    /**Whether the privilege can be RecordFilter based access level.*/
    CanBeRecordFilter?: boolean;
    /**The ID of the privilege.*/
    PrivilegeId: string;
    /**
   The type of privilege, which is one of the following:
     0: None
     1: Create
     2: Read
     3: Write
     4: Delete
     5: Assign
     6: Share
     7: Append
     8: AppendTo
  */
    PrivilegeType: PrivilegeType;
}

/** https://learn.microsoft.com/power-apps/developer/data-platform/webapi/reference/entitykeyindexstatus */
export type EntityKeyIndexStatus = 'Pending' | 'InProgress' | 'Active' | 'Failed';

/**
 * An alternate key of a table.
 * https://learn.microsoft.com/power-apps/developer/data-platform/webapi/reference/entitykeymetadata
 */
export interface EntityKeyMetadata {
    /** The unique identifier of the key definition. Generated when missing. */
    MetadataId?: string;
    /** The logical name of the key. */
    LogicalName: string;
    /** The schema name of the key. */
    SchemaName?: string;
    /** The display name of the key. */
    DisplayName?: string;
    /** The logical name of the table. Set to the table the key is defined on. */
    EntityLogicalName?: string;
    /** The logical names of the columns of the key. Lookup columns use their logical name, e.g. `primarycontactid`. */
    KeyAttributes: string[];
    /** The status of the index of the key, `Active` when missing. Numbers are converted to the names. */
    EntityKeyIndexStatus?: EntityKeyIndexStatus | 0 | 1 | 2 | 3;
    /** Whether the key is part of a managed solution. */
    IsManaged?: boolean;
    /** Whether the key is customizable. */
    IsCustomizable?: BooleanManagedProperty;
    /** The solution version that added the key. */
    IntroducedVersion?: string;
}

/** https://learn.microsoft.com/power-apps/developer/data-platform/webapi/reference/cascadetype */
export type CascadeType = 'NoCascade' | 'Cascade' | 'Active' | 'UserOwned' | 'RemoveLink' | 'Restrict';

/**
 * The cascading behaviors of a one-to-many relationship. Numbers are converted to the {@link CascadeType} names.
 * https://learn.microsoft.com/power-apps/developer/data-platform/webapi/reference/cascadeconfiguration
 */
export interface CascadeConfiguration {
    Archive?: CascadeType | number;
    Assign?: CascadeType | number;
    Delete?: CascadeType | number;
    Merge?: CascadeType | number;
    Reparent?: CascadeType | number;
    RollupView?: CascadeType | number;
    Share?: CascadeType | number;
    Unshare?: CascadeType | number;
}

/** https://learn.microsoft.com/power-apps/developer/data-platform/webapi/reference/relationshiptype */
export type RelationshipType = 'OneToManyRelationship' | 'ManyToManyRelationship';

/** https://learn.microsoft.com/power-apps/developer/data-platform/webapi/reference/securitytypes */
export type SecurityTypes = 'None' | 'Append' | 'ParentChild' | 'Pointer' | 'Inheritance';

/**
 * The properties shared by the relationships.
 * https://learn.microsoft.com/power-apps/developer/data-platform/webapi/reference/relationshipmetadatabase
 */
export interface RelationshipMetadataBase {
    /** The unique identifier of the relationship definition. Generated when missing. */
    MetadataId?: string;
    /** The schema name of the relationship. Identifies the relationship across the tables. */
    SchemaName: string;
    /** Set from the property the relationship is defined in. */
    RelationshipType?: RelationshipType;
    /** The security type of the relationship. Numbers are converted to the names. */
    SecurityTypes?: SecurityTypes | number;
    IsCustomRelationship?: boolean;
    IsCustomizable?: BooleanManagedProperty;
    IsManaged?: boolean;
    IsValidForAdvancedFind?: boolean;
    IntroducedVersion?: string;
}

/**
 * A one-to-many relationship. The same definition is returned by
 * `OneToManyRelationships` of the referenced table and `ManyToOneRelationships` of the referencing table.
 * https://learn.microsoft.com/power-apps/developer/data-platform/webapi/reference/onetomanyrelationshipmetadata
 */
export interface OneToManyRelationshipMetadata extends RelationshipMetadataBase {
    /** The referenced (primary) table. Defaults to the table, when defined in `OneToManyRelationships`. */
    ReferencedEntity?: string;
    /** The primary key of the referenced table. Defaults to its `PrimaryIdAttribute`. */
    ReferencedAttribute?: string;
    /** The referencing (related) table. Defaults to the table, when defined in `ManyToOneRelationships`. */
    ReferencingEntity?: string;
    /** The lookup column of the referencing table. */
    ReferencingAttribute: string;
    /** The collection-valued navigation property of the referenced table. */
    ReferencedEntityNavigationPropertyName?: string;
    /** The single-valued navigation property of the referencing table. */
    ReferencingEntityNavigationPropertyName?: string;
    CascadeConfiguration?: CascadeConfiguration;
    AssociatedMenuConfiguration?: { [property: string]: unknown };
    IsHierarchical?: boolean;
    RelationshipBehavior?: number;
}

/**
 * A many-to-many relationship.
 * https://learn.microsoft.com/power-apps/developer/data-platform/webapi/reference/manytomanyrelationshipmetadata
 */
export interface ManyToManyRelationshipMetadata extends RelationshipMetadataBase {
    /** The first table. Defaults to the table the relationship is defined on. */
    Entity1LogicalName?: string;
    /** The second table. */
    Entity2LogicalName: string;
    /** The intersect table. */
    IntersectEntityName: string;
    Entity1IntersectAttribute?: string;
    Entity2IntersectAttribute?: string;
    Entity1NavigationPropertyName?: string;
    Entity2NavigationPropertyName?: string;
    Entity1AssociatedMenuConfiguration?: { [property: string]: unknown };
    Entity2AssociatedMenuConfiguration?: { [property: string]: unknown };
}

export interface AttributeMetadata {
    /** Type of a column. */
    AttributeType: AttributeTypeCode;
    /** The name of the attribute that this attribute extends.*/
    AttributeOf: string;
    /** The name of the type for the attribute.*/
    AttributeTypeName: {
        value: string;
    };
    /** */
    AutoNumberFormat: string;
    /** Whether field-level security can be applied to prevent a user from adding data to this attribute.*/
    CanBeSecuredForCreate: boolean;
    /** Whether field-level security can be applied to prevent a user from viewing data from this attribute.*/
    CanBeSecuredForRead: boolean;
    /** Whether field-level security can be applied to prevent a user from updating data for this attribute.*/
    CanBeSecuredForUpdate: boolean;
    /** Whether any settings not controlled by managed properties can be changed.*/
    CanModifyAdditionalSettings: BooleanManagedProperty;
    /**An organization-specific ID for the attribute used for auditing.*/
    ColumnNumber: number;
    CreatedOn: Date;
    /**The Microsoft Dynamics 365 version that the attribute was deprecated in.*/
    DeprecatedVersion: string;
    /** The label containing the description for the attribute.*/
    Description: {
        LocalizedLabels: [
            {
                /** The localized label string.*/
                Label: string;
                /** The language code for the label.*/
                LanguageCode: number;
                /** Whether the label is managed.*/
                IsManaged: boolean;
                /** A unique identifier for the metadata item.*/
                MetadataId: string;
                /** Whether the item of metadata has changed.*/
                HasChanged: boolean;
            },
        ];
        UserLocalizedLabel: {
            /** The localized label string.*/
            Label: string;
            /** The language code for the label.*/
            LanguageCode: number;
            /** Whether the label is managed.*/
            IsManaged: boolean;
            /** A unique identifier for the metadata item.*/
            MetadataId: string;
            /** Whether the item of metadata has changed.*/
            HasChanged: boolean;
        };
    };
    /** Display name for the column. */
    DisplayName: string;
    /** Logical name of the table that contains the column. */
    EntityLogicalName: string;
    ExternalName: string;
    /**Indicates whether the item of metadata has changed. */
    HasChanged: string;
    /**For internal use only. */
    InheritsFrom: string;
    /** A string identifying the solution version that the solution component was added in. */
    IntroducedVersion: string;
    /** Whether the attribute is enabled for auditing. */
    IsAuditEnabled: BooleanManagedProperty;
    /** Whether the attribute is a custom attribute. */
    IsCustomAttribute: boolean;
    /** Whether the attribute allows customization.*/
    IsCustomizable: BooleanManagedProperty;
    IsDataSourceSecret: boolean;
    /** For internal use only. */
    IsFilterable: boolean;
    /** For internal use only. */
    IsGlobalFilterEnabled: BooleanManagedProperty;
    /** Whether the attribute is a logical attribute. */
    IsLogical: boolean;
    /** Whether the attribute is part of a managed solution. */
    IsManaged: boolean;
    /** Whether the attribute represents the unique identifier for the record. */
    IsPrimaryId: boolean;
    /** Whether the attribute represents the primary attribute for the entity. */
    IsPrimaryName: boolean;
    /** Whether the attribute display name can be changed.*/
    IsRenameable: BooleanManagedProperty;
    IsRequiredForForm: boolean;
    /** For internal use only. */
    IsRetrievable: boolean;
    /** For internal use only. */
    IsSearchable: boolean;
    /** Whether the attribute is secured for field-level security. */
    IsSecured: boolean;
    /** For internal use only. */
    IsSortableEnabled: BooleanManagedProperty;
    /** Whether the attribute appears in Advanced Find.*/
    IsValidForAdvancedFind: BooleanManagedProperty;
    /**Whether the value can be set when a record is created.*/
    IsValidForCreate: boolean;
    IsValidForForm: boolean;
    IsValidForGrid: boolean;
    /** Whether the value can be retrieved. */
    IsValidForRead: boolean;
    /** Whether the value can be updated.*/
    IsValidForUpdate: boolean;
    IsValidODataAttribute: boolean;
    /** The id of the attribute that is linked between appointments and recurring appointments. */
    LinkedAttributeId: string;
    /** Logical name for the column. */
    LogicalName: string;
    /** A unique identifier for the metadata item. */
    MetadataId: string;
    ModifiedOn: Date;
    /** The property that determines the data entry requirement level enforced for the attribute. */
    RequiredLevel: {
        /** The value of the managed property.*/
        Value: AttributeRequiredLevel;
        /** Whether the managed property value can be changed.*/
        CanBeChanged: boolean;
        /**The logical name for the managed property.*/
        ManagedPropertyLogicalName: string;
    };
    /**  Schema name for the column.  */
    SchemaName: string;
    Settings: { name: string };
    /** A value that indicates the source type for a calculated or rollup attribute. */
    SourceType: number;
}

export interface BooleanAttributeMetadata extends AttributeMetadata {
    /** Type of a column. */
    AttributeType: typeof AttributeType.Boolean;
    /**Default value for a Yes/No column.*/
    DefaultFormValue: boolean;
    /**Options for the boolean column where each option is a key:value pair.*/
    OptionSet: BooleanOptionSet;
}

export interface BooleanOptionSet {
    MetadataId: string;
    IsCustomOptionSet: boolean;
    Name: string;
    OptionSetType: typeof OptionSetType.Boolean;
    DisplayName: string;
    TrueOption: {
        Value: number;
        Label: string;
        Color?: string;
    };
    FalseOption: {
        Value: number;
        Label: string;
        Color?: string;
    };
}
export interface BooleanManagedProperty {
    /** The value of the managed property.*/
    Value: boolean;
    /** Whether the managed property value can be changed.*/
    CanBeChanged: boolean;
    /**The logical name for the managed property.*/
    ManagedPropertyLogicalName: string;
}

export interface StringAttributeMetadata extends AttributeMetadata {
    AttributeType: typeof AttributeType.String;
    Format: string;
    MaxLength: number;
    ImeMode: ImeMode;
}

export interface NumberAttributeMetadata extends AttributeMetadata {
    AttributeType:
        | typeof AttributeType.Integer
        | typeof AttributeType.BigInt
        | typeof AttributeType.Decimal
        | typeof AttributeType.Double;
    ImeMode: ImeMode;
    MaxValue: number;
    MinValue: number;
}

export interface DecimalNumberAttributeMetadata extends NumberAttributeMetadata {
    AttributeType: typeof AttributeType.Decimal;
    Precision: number;
}

export interface IntegerNumberAttributeMetadata extends NumberAttributeMetadata {
    AttributeType: typeof AttributeType.Integer;
    Format: string;
}

export interface DateTimeAttributeMetadata extends AttributeMetadata {
    AttributeType: typeof AttributeType.DateTime;
    Format: string;
    ImeMode: ImeMode;
    Behaviour: DateTimeFieldBehavior;
}

export interface LookupAttributeMetadata extends AttributeMetadata {
    AttributeType: typeof AttributeType.Lookup;
    Targets: string[];
}

export interface EnumTypeAttributeMetadata extends AttributeMetadata {
    /** Type of a column. */
    AttributeType: typeof AttributeType.String;
    /**Options for the column where each option is a key:value pair*/
    OptionSet: {
        [key: string]: string;
    };
}

export interface PickListAttributeMetadata extends AttributeMetadata {
    /** Type of a column. */
    AttributeType: typeof AttributeType.Picklist;
    /**Default form value for the column.*/
    DefaultFormValue: number;
    /**Options for the column where each option is a key:value pair.*/
    OptionSet: OptionSet<typeof OptionSetType.Picklist>;
}

export interface OptionSet<T extends OptionSetTypeCode> {
    MetadataId: string;
    IsCustomOptionSet: boolean;
    Name: string;
    OptionSetType: T;
    Options: {
        [value: number]: {
            Value: number;
            Label: string;
            Color?: string;
        };
    };
}

export interface StateAttributeMetadata extends AttributeMetadata {
    /** Type of a column. */
    AttributeType: typeof AttributeType.State;
    /**Options for the column where each option is a key:value pair*/
    OptionSet: {
        [key: string]: string;
    };
    /**Returns the default status (number) based on the passed in state value for a table*/
    getDefaultStatus(state: number): number;
    /**Returns possible status values (array of numbers) for a specified state value.*/
    getStatusValuesForState(state: number): number[];
}

export interface StatusAttributeMetadata extends AttributeMetadata {
    /** Type of a column. */
    AttributeType: typeof AttributeType.Status;
    /**Options for the column where each option is a key:value pair.*/
    OptionSet: {
        [key: string]: string;
    };
    /**Returns the state value (number) for the specified status value (number).*/
    getState(status: number): number;
}

export type ImeMode = 0 | 1 | 2 | 3;
export type DateTimeFieldBehavior = 0 | 1 | 3;
export type PrivilegeType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type AttributeRequiredLevel = 0 | 1 | 2 | 3;
