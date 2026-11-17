/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { AttributeMetadata, EntityMetadata } from '../Metadata.types';
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

/** Converts a lookup to `_<logicalname>_value` with its annotations */
const serializeLookup = (entity: WebApiEntity, row: WebApiEntity, attributes: AttributeMetadata[], key: string) => {
    const valueKey = `_${key}_value`;
    const hasValue = key in row || valueKey in row;
    const raw = key in row ? row[key] : row[valueKey];
    const navigation = row[key + 'navigation'];
    const type = row[key + 'type'];
    delete entity[key];
    delete entity[key + 'type'];
    delete entity[key + 'navigation'];
    if (!hasValue) return;

    const lookup = toLookupReference(raw, type, attributes, key, row);
    entity[valueKey] = lookup?.id ?? null;
    if (!lookup?.id) return;

    entity[valueKey + ODataAnnotation.LookupLogicalName] = lookup.entityType;
    if (lookup.name !== null && lookup.name !== undefined) {
        entity[valueKey + ODataAnnotation.FormattedValue] = lookup.name;
    }
    const navigationProperty = navigation ?? lookup.navigation;
    if (navigationProperty) {
        entity[valueKey + ODataAnnotation.AssociatedNavigationProperty] = navigationProperty;
    }
};

/** A lookup stored either as a {@link LookupReference} or as the raw id */
const toLookupReference = (
    raw: unknown,
    type: string,
    attributes: AttributeMetadata[],
    key: string,
    row: WebApiEntity,
): LookupReference | null => {
    if (raw && typeof raw === 'object') {
        return raw as LookupReference;
    }
    if (!raw) {
        return null;
    }
    const nameAttribute = attributes.find(
        (attr) => attr.AttributeOf === key && attr.LogicalName !== key + 'yominame',
    )?.LogicalName;
    return { id: raw as string, entityType: type, name: nameAttribute ? row[nameAttribute] : undefined };
};

/** Converts a date to a UTC string with its formatted value; empty dates are omitted */
const serializeDateTime = (entity: WebApiEntity, key: string, formatter: WireFormatter) => {
    const value = entity[key];
    if (isDate(value)) {
        entity[key] = toWebApiDateTime(value);
        entity[key + ODataAnnotation.FormattedValue] = (formatter.formatDateTime ?? formatDateTimeForDisplay)(value);
    } else if (!value) {
        delete entity[key];
    }
};

/** Converts a column to the Web API shape, according to its type */
const serializeAttribute = (
    entity: WebApiEntity,
    row: WebApiEntity,
    attributes: AttributeMetadata[],
    attribute: AttributeMetadata,
    formatter: WireFormatter,
) => {
    const key = attribute.LogicalName;
    switch (attribute.AttributeType) {
        case AttributeType.Boolean:
            if (entity[key] === undefined || entity[key] === null) {
                delete entity[key];
            }
            break;
        case AttributeType.Lookup:
            serializeLookup(entity, row, attributes, key);
            break;
        case AttributeType.DateTime:
            serializeDateTime(entity, key, formatter);
            break;
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
};

const hasValue = (value: unknown) => value !== undefined && value !== null;

/**
 * Moves the value of a name column (`AttributeOf`) to the formatted value annotation of the column it describes.
 * Lookups get their formatted value from the lookup itself.
 */
const serializeNameAttribute = (
    entity: WebApiEntity,
    row: WebApiEntity,
    attributes: AttributeMetadata[],
    attribute: AttributeMetadata,
) => {
    const key = attribute.LogicalName;
    const original = attributes.find((attr) => attr.LogicalName === attribute.AttributeOf);
    if (
        original &&
        original.AttributeType !== AttributeType.Lookup &&
        hasValue(row[original.LogicalName]) &&
        hasValue(row[key]) &&
        original.LogicalName in entity
    ) {
        entity[original.LogicalName + ODataAnnotation.FormattedValue] = row[key];
    }
    delete entity[key];
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
    tableMetadata: EntityMetadata,
    formatter: WireFormatter = defaultFormatter,
): WebApiEntity => {
    const entity: WebApiEntity = { ...row };
    const attributes = tableMetadata.Attributes ?? [];

    attributes.forEach((attribute) => {
        serializeAttribute(entity, row, attributes, attribute, formatter);
        if (attribute.AttributeOf) {
            serializeNameAttribute(entity, row, attributes, attribute);
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
