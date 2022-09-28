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

/// <reference types="powerapps-component-framework" />

declare namespace ComponentFramework {

	/** https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/xrm-utility/getentitymetadata */
	export interface EntityMetadata {
		/** Whether a custom activity should appear in the activity menus in the Web application. 0 indicates that the custom activity doesn't appear; 1 indicates that it does appear. */
		ActivityTypeMask: number;
		/** The name of the Web API table set for this table. */
		EntitySetName: string;
		/** The logical name for the table. */
		LogicalName: string;
		/** The name of the primary column for a table. */
		PrimaryNameAttribute: string;
		/** A collection of column definitions objects. The object returned depends on the type of column definitions. */
		Attributes: ComponentFramework.AttributeMetadata[];
	}

	export interface AttributeMetadata {
		/** Type of a column. */
		AttributeType: ComponentFramework.AttributeType;
		/** Display name for the column. */
		DisplayName: string;
		/** Logical name of the table that contains the column. */
		EntityLogicalName: string;
		/** Logical name for the column. */
		LogicalName: string;
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

		/** A partylist attribute. Value = 10.
		 */
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
		Virtual = 17
	}
}
