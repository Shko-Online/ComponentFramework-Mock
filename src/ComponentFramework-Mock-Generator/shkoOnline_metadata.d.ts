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

export namespace ShkoOnline {
  /** https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/xrm-utility/getentitymetadata */
  export interface EntityMetadata {
    /** Whether a custom activity should appear in the activity menus in the Web application. 0 indicates that the custom activity doesn't appear; 1 indicates that it does appear. */
    ActivityTypeMask: number;
    /**Indicates whether to automatically move records to the owner’s default queue when a record of this type is created or assigned.*/
    AutoRouteToOwnerQueue: boolean;
    /**For internal use only. */
    CanEnableSyncToExternalSearchIndex: boolean;
    /**Indicates whether the table can trigger a workflow process.*/
    CanTriggerWorkflow: boolean;
    /**Description for the table.*/
    Description: string;
    /**Plural display name for the table.*/
    DisplayCollectionName: string;
    /**Display name for the table.*/
    DisplayName: string;
    /**Indicates whether the table will enforce custom state transitions.*/
    EnforceStateTransitions: boolean;
    /**The hexadecimal code to represent the color to be used for this table in the application.*/
    EntityColor: string;
	  /**Indicates whether activities are associated with this table.*/
	  HasActivities:boolean;
	  /**Indicates whether the table is an activity.*/
	  IsActivity:boolean
	  /**Indicates whether the email messages can be sent to an email address stored in a record of this type.*/
	  IsActivityParty:boolean;
	  /**Indicates whether the table is enabled for business process flows.*/
	  IsBusinessProcessEnabled:boolean;
	  /**Indicates whether the table is a business process flow table.*/
	  IsBPFEntity:boolean;
	  /**Indicates whether the table is a child table.*/
    IsChildEntity: boolean;
	  /**Indicates whether connections are enabled for this table.*/
	  IsConnectionsEnabled:boolean
	  /**Indicates whether the table is a custom table.*/
    IsCustomEntity: boolean;
	  /**Indicates whether the table is customizable.*/
    IsCustomizable: boolean;
	  /**Indicates whether document management is enabled.*/
	  IsDocumentManagementEnabled:boolean;
	  /** Indicates whether the document recommendations is enabled.*/
	  IsDocumentRecommendationsEnabled: boolean;
	  /** Indicates whether duplicate detection is enabled.*/
	  IsDuplicateDetectionEnabled:boolean;
	  /**Indicates whether charts are enabled.*/
	  IsEnabledForCharts:boolean;
	  /**Indicates whether the table can be imported using the Import Wizard.*/
	  IsImportable:boolean;
	  /**Indicates the table is enabled for interactive experience.*/
	  IsInteractionCentricEnabled:boolean;
	  /**Indicates whether knowledge management is enabled for the table.*/
	  IsKnowledgeManagementEnabled:boolean;
	  /**Indicates whether mail merge is enabled for this table.*/
	  IsMailMergeEnabled:boolean;
	  /**Indicates whether the table is part of a managed solution.*/
    IsManaged: boolean;
	  /**Indicates whether OneNote integration is enabled for the table.*/
	  IsOneNoteIntegrationEnabled:boolean;
	  /**Indicates whether optimistic concurrency is enabled for the table.*/
	  IsOptimisticConcurrencyEnabled:boolean;
	  /**Indicates whether the table is enabled for quick create forms.*/
	  IsQuickCreateEnabled:boolean;
	  /**Indicates whether the table supports setting custom state transitions.*/
	  IsStateModelAware:boolean;
	  /**Indicates whether the table is will be shown in Advanced Find.*/
	  IsValidForAdvancedFind:boolean;
	  /**Indicates whether Microsoft Dynamics 365 for tablets users can see data for this table.*/
	  IsVisibleInMobileClient	:boolean;
	  /**Indicates whether the table is enabled for Unified Interface.*/
	  IsEnabledInUnifiedInterface:boolean;
	  /**The logical collection name.*/
	  LogicalCollectionName:string;
	  /**The table type code.*/
    ObjectTypeCode: number;
	  /**The ownership type for the table: "UserOwned" or "OrganizationOwned".*/
    OwnershipType: string;
    /** The name of the Web API table set for this table. */
    EntitySetName: string;
    /** The logical name for the table. */
    LogicalName: string;
	  /**The name of the column that is the primary id for the table.*/
	  PrimaryIdAttribute:string;
	  /**The name of the primary image column for a table.*/
	  PrimaryImageAttribute:string;
    /** The name of the primary column for a table. */
    PrimaryNameAttribute: string;
    /**The privilege definitions for the table where *each* object contains the following values to define the security privilege for access to a table*/ 
    Privileges: ShkoOnline.Privileges[];
    /** A collection of column definitions objects. The object returned depends on the type of column definitions. */
    Attributes: ShkoOnline.AttributeMetadata[];
  }

  export interface Privileges{
    /**Whether the privilege can be basic access level.*/
    CanBeBasic: boolean;
    /**Whether the privilege can be deep access level*/
    CanBeDeep:boolean;
    /**Whether the privilege for an external party can be basic access level.*/
    CanBeEntityReference:boolean;
    /**Whether the privilege can be global access level.*/
    CanBeGlobal:boolean;
    /**Whether the privilege can be local access level*/
    CanBeLocal:boolean;
    /**Whether the privilege for an external party can be parent access level.*/
    CanBeParentEntityReference:boolean;
    /**The name of the privilege*/
    Name:string;
    /**The ID of the privilege.*/
    PrivilegeId:string;
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
    PrivilegeType:number
 }

  export interface AttributeMetadata {
    /** Type of a column. */
    AttributeType: ShkoOnline.AttributeType;
    /** Display name for the column. */
    DisplayName: string;
    /** Logical name of the table that contains the column. */
    EntityLogicalName: string;
    /** Logical name for the column. */
    LogicalName: string;
	  /**  Schema name for the column.  */
    SchemaName: string;
    /** MetadataId */
    MetadataId: string;
  }

  export interface BooleanAttributeMetadata
    extends ShkoOnline.AttributeMetadata {
    /** Type of a column. */
    AttributeType: ShkoOnline.AttributeType.Boolean;
    /**Default value for a Yes/No column.*/
    DefaultFormValue: boolean;
    /**Options for the boolean column where each option is a key:value pair.*/
    OptionSet: {
      [key: string]: string;
    };
  }

  export interface EnumTypeAttributeMetadata
    extends ShkoOnline.AttributeMetadata {
    /** Type of a column. */
    AttributeType: ShkoOnline.AttributeType;
    /**Options for the column where each option is a key:value pair*/
    OptionSet: {
      [key: string]: string;
    };
  }

  export interface ChoicesAttributeMetadata
    extends ShkoOnline.AttributeMetadata {
    /** Type of a column. */
    AttributeType: ShkoOnline.AttributeType.Picklist;
    /**Default form value for the column.*/
    DefaultFormValue: number;
    /**Options for the column where each option is a key:value pair.*/
    OptionSet: {
      [key: string]: string;
    };
  }

  export interface StateAttributeMetadata
    extends ShkoOnline.AttributeMetadata {
    /** Type of a column. */
    AttributeType: ShkoOnline.AttributeType.State;
    /**Options for the column where each option is a key:value pair*/
    OptionSet: {
      [key: string]: string;
    };
    /**Returns the default status (number) based on the passed in state value for a table*/
    getDefaultStatus(state: number): number;
    /**Returns possible status values (array of numbers) for a specified state value.*/
    getStatusValuesForState(state: number): number[];
  }

  export interface StatusAttributeMetadata
    extends ShkoOnline.AttributeMetadata {
    /** Type of a column. */
    AttributeType: ShkoOnline.AttributeType.Status;
    /**Options for the column where each option is a key:value pair.*/
    OptionSet: {
      [key: string]: string;
    };
    /**Returns the state value (number) for the specified status value (number).*/
    getState(status: number): number;
  }

  /**
   * Describes the type of an attribute.
   * For the Web API use the AttributeTypeCode EnumType.
   */
  export const enum AttributeType {
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
