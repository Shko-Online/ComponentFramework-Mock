/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../ShkoOnline';
import { AttributeType } from '../../ComponentFramework-Mock/PropertyTypes/AttributeType';

/**
 * Converts a table logical name to the name of the physical alasql table.
 * `!` and `@` are used for pseudo-tables (e.g. `!CanvasApp`, `table@columns`) and are not valid SQL identifiers.
 */
export const toSqlTableName = (logicalName: string) => logicalName.toLowerCase().replace(/[!@]/g, '_');

/**
 * Wraps a column name in brackets so it can be safely interpolated in a SQL statement.
 * Names come from metadata or from user queries, so reject anything that could break out of the brackets.
 */
export const sqlIdentifier = (name: string) => {
    if (!name || /[[\]]/.test(name)) {
        throw new Error(`Invalid column name '${name}'`);
    }
    return `[${name}]`;
};

/**
 * Column types that have a companion `<logicalname>name` virtual column holding the formatted value / lookup name.
 */
const NAME_COLUMN_TYPES = new Set<ShkoOnline.AttributeType>([
    AttributeType.Boolean,
    AttributeType.Lookup,
    AttributeType.Picklist,
    AttributeType.State,
    AttributeType.Status,
]);

/**
 * Column types whose `<logicalname>name` companion holds a formatted label (as opposed to a lookup name).
 */
const LABEL_COLUMN_TYPES = new Set<ShkoOnline.AttributeType>([
    AttributeType.Boolean,
    AttributeType.Picklist,
    AttributeType.State,
    AttributeType.Status,
]);

export const hasNameColumn = (attributeType: ShkoOnline.AttributeType) => NAME_COLUMN_TYPES.has(attributeType);

export const hasLabelColumn = (attributeType: ShkoOnline.AttributeType) => LABEL_COLUMN_TYPES.has(attributeType);

/**
 * Finds the virtual attribute that stores the name / formatted value of `attribute`.
 */
export const getNameAttribute = (
    tableMetadata: ShkoOnline.EntityMetadata,
    attribute: ShkoOnline.AttributeMetadata,
): string | undefined =>
    tableMetadata.Attributes?.find(
        (attr) => attr.AttributeOf === attribute.LogicalName && attr.LogicalName !== attribute.LogicalName + 'yominame',
    )?.LogicalName;

/**
 * Converts a raw query value (from OData or FetchXML) to the type stored in the in-memory table.
 */
export const coerceValueForAttribute = (attribute: ShkoOnline.AttributeMetadata | undefined, value: unknown) => {
    if (value === null || value === undefined || !attribute) {
        return value;
    }
    switch (attribute.AttributeType) {
        case AttributeType.Boolean:
            return typeof value === 'string' ? value === '1' || value.toLowerCase() === 'true' : !!value;
        case AttributeType.BigInt:
        case AttributeType.Decimal:
        case AttributeType.Double:
        case AttributeType.Integer:
        case AttributeType.Money:
        case AttributeType.Picklist:
        case AttributeType.State:
        case AttributeType.Status:
            return typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value)) ? Number(value) : value;
        case AttributeType.DateTime:
            return typeof value === 'string' ? new Date(value) : value;
        default:
            return value;
    }
};

/**
 * Builds a SQL comparison between a column and a parameter, taking care of types that alasql
 * can't compare with `=` (Dates are compared by reference).
 */
/** `instanceof Date` fails across realms (e.g. jsdom), so check the tag instead */
const isDate = (value: unknown): value is Date => Object.prototype.toString.call(value) === '[object Date]';

export const compareColumnToParameter = (
    attribute: ShkoOnline.AttributeMetadata | undefined,
    column: string,
    sqlOperator: string,
    value: unknown,
    params: unknown[],
) => {
    const coerced = coerceValueForAttribute(attribute, value);
    if (isDate(coerced) && (sqlOperator === '=' || sqlOperator === '<>')) {
        params.push(coerced, coerced);
        const equals = `(${column} >= ? AND ${column} <= ?)`;
        return sqlOperator === '=' ? equals : `NOT ${equals}`;
    }
    params.push(coerced);
    return `${column} ${sqlOperator} ?`;
};

const cloneValue = <T>(value: T): T => {
    if (Array.isArray(value)) {
        return value.map(cloneValue) as unknown as T;
    }
    if (isDate(value)) {
        return new Date(value.getTime()) as unknown as T;
    }
    if (value && typeof value === 'object') {
        const result: { [key: string]: unknown } = {};
        Object.keys(value).forEach((key) => {
            result[key] = cloneValue((value as { [key: string]: unknown })[key]);
        });
        return result as T;
    }
    return value;
};

/**
 * Deep clones metadata so callers can't corrupt the metadata cache.
 */
export const cloneEntityMetadata = (metadata: ShkoOnline.EntityMetadata) => cloneValue(metadata);
