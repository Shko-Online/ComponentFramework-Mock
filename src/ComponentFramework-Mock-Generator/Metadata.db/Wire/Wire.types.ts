/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

/**
 * Annotations used by the Dataverse Web API.
 * See {@link https://learn.microsoft.com/power-apps/developer/data-platform/webapi/query/format-results Format query results}
 */
export const ODataAnnotation = {
    FormattedValue: '@OData.Community.Display.V1.FormattedValue',
    LookupLogicalName: '@Microsoft.Dynamics.CRM.lookuplogicalname',
    AssociatedNavigationProperty: '@Microsoft.Dynamics.CRM.associatednavigationproperty',
    Bind: '@odata.bind',
} as const;

/**
 * A reference to a row, as stored in a lookup column.
 * Structurally compatible with `ComponentFramework.LookupValue`.
 */
export interface LookupReference {
    id: string;
    entityType: string;
    name?: string;
    /** The single-valued navigation property used to set the lookup */
    navigation?: string;
}

/**
 * A row as exchanged with the Dataverse Web API (`ComponentFramework.WebApi.Entity`, `Xrm.WebApi` entities, ...).
 */
export type WebApiEntity = { [property: string]: any };

/**
 * Formats values for the `@OData.Community.Display.V1.FormattedValue` annotations.
 */
export interface WireFormatter {
    formatInteger(value: number): string;
    formatDateTime?(value: Date): string;
}

export interface WebApiPage {
    entities: WebApiEntity[];
    /** Set only when there are more records */
    nextLink?: string;
}
