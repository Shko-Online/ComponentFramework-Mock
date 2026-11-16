/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../../ShkoOnline';
import type { LookupReference, WebApiEntity, WireFormatter } from './Wire.types';
import { AttributeType } from '../AttributeType';
import { ODataAnnotation } from './Wire.types';

const isDate = (value: unknown): value is Date => Object.prototype.toString.call(value) === '[object Date]';

/**
 * Formats a date the way the Web API returns it: UTC, without milliseconds (`2023-02-03T21:42:51Z`).
 */
export const toWebApiDateTime = (value: Date) => value.toISOString().replace(/\.\d{3}Z$/, 'Z');

/**
 * Default formatted value for dates: `M/D/YYYY h:mm AM|PM` in UTC.
 */
export const formatDateTimeForDisplay = (value: Date) => {
    const hours = value.getUTCHours();
    const minutes = ('0' + value.getUTCMinutes()).slice(-2);
    return `${value.getUTCMonth() + 1}/${value.getUTCDate()}/${value.getUTCFullYear()} ${hours % 12 || 12}:${minutes} ${
        hours >= 12 ? 'PM' : 'AM'
    }`;
};

const defaultFormatter: WireFormatter = {
    formatInteger: (value) => value.toLocaleString('en-US'),
};

/**
 * Converts a row of the in-memory database to the shape returned by the Dataverse Web API:
 * * lookups become `_<logicalname>_value` with the lookup logical name, formatted value and navigation annotations
 * * dates become UTC strings with a formatted value
 * * integers, Yes/No and choices get their formatted value
 * * multi-select choices become comma separated strings
 * * missing values become `null` (empty Yes/No and dates are omitted)
 *
 * Lookups are accepted both as `<logicalname>` (store shape) and as `_<logicalname>_value`,
 * holding either a {@link LookupReference} or the raw id.
 * Properties that are not attributes (e.g. aggregate aliases) are kept as they are.
 */
export const toWebApiEntity = (
    row: WebApiEntity,
    tableMetadata: ShkoOnline.EntityMetadata,
    formatter: WireFormatter = defaultFormatter,
): WebApiEntity => {
    const entity: WebApiEntity = { ...row };
    const attributes = tableMetadata.Attributes ?? [];

    attributes.forEach((attribute) => {
        const key = attribute.LogicalName;
        switch (attribute.AttributeType) {
            case AttributeType.Boolean:
                if (entity[key] === undefined || entity[key] === null) {
                    delete entity[key];
                }
                break;
            case AttributeType.Lookup: {
                const valueKey = `_${key}_value`;
                const hasValue = key in row || valueKey in row;
                const raw = key in row ? row[key] : row[valueKey];
                const navigation = row[key + 'navigation'];
                const type = row[key + 'type'];
                delete entity[key];
                delete entity[key + 'type'];
                delete entity[key + 'navigation'];
                if (!hasValue) break;

                const nameAttribute = attributes.find(
                    (attr) => attr.AttributeOf === key && attr.LogicalName !== key + 'yominame',
                )?.LogicalName;
                const lookup: LookupReference | null =
                    raw && typeof raw === 'object'
                        ? raw
                        : raw
                          ? { id: raw, entityType: type, name: nameAttribute ? row[nameAttribute] : undefined }
                          : null;
                entity[valueKey] = lookup?.id ?? null;
                if (lookup?.id) {
                    entity[valueKey + ODataAnnotation.LookupLogicalName] = lookup.entityType;
                    if (lookup.name !== null && lookup.name !== undefined) {
                        entity[valueKey + ODataAnnotation.FormattedValue] = lookup.name;
                    }
                    const navigationProperty = navigation ?? lookup.navigation;
                    if (navigationProperty) {
                        entity[valueKey + ODataAnnotation.AssociatedNavigationProperty] = navigationProperty;
                    }
                }
                break;
            }
            case AttributeType.DateTime: {
                const value = entity[key];
                if (isDate(value)) {
                    entity[key] = toWebApiDateTime(value);
                    entity[key + ODataAnnotation.FormattedValue] = (
                        formatter.formatDateTime ?? formatDateTimeForDisplay
                    )(value);
                } else if (!value) {
                    delete entity[key];
                }
                break;
            }
            case AttributeType.Integer:
            case AttributeType.BigInt:
                if (entity[key] !== null && entity[key] !== undefined) {
                    entity[key + ODataAnnotation.FormattedValue] = formatter.formatInteger(entity[key]);
                }
                break;
            case AttributeType.Picklist:
                if (Array.isArray(entity[key])) {
                    entity[key] = entity[key].join(',');
                }
                break;
        }

        if (attribute.AttributeOf) {
            const original = attributes.find((attr) => attr.LogicalName === attribute.AttributeOf);
            if (
                original &&
                original.AttributeType !== AttributeType.Lookup &&
                row[original.LogicalName] !== undefined &&
                row[original.LogicalName] !== null &&
                row[key] !== undefined &&
                row[key] !== null &&
                original.LogicalName in entity
            ) {
                entity[original.LogicalName + ODataAnnotation.FormattedValue] = row[key];
            }
            delete entity[key];
        }
    });

    Object.keys(entity).forEach((key) => {
        if (entity[key] === undefined) {
            entity[key] = null;
        }
    });
    return entity;
};

/**
 * Applies `$select` to an entity returned by {@link toWebApiEntity}, keeping the annotations of the selected properties.
 * The primary id is always kept.
 */
export const pickWebApiProperties = (entity: WebApiEntity, select: string[], primaryIdAttribute?: string) => {
    const result: WebApiEntity = {};
    Object.keys(entity).forEach((key) => {
        const property = key.split('@')[0];
        if (property === primaryIdAttribute || select.includes(property)) {
            result[key] = entity[key];
        }
    });
    return result;
};
