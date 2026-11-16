/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { LookupReference, WebApiEntity } from './Wire.types';
import { ODataAnnotation } from './Wire.types';

/**
 * Parses a Web API `@odata.bind` reference, e.g. `/contacts(00000000-0000-0000-0000-000000000001)`.
 * @throws when the value is not a reference to a row
 */
export const parseODataBind = (bind: string) => {
    const match = /([A-Za-z_][A-Za-z0-9_]*)\(([^)]+)\)\s*$/.exec(bind);
    if (!match) {
        throw new Error(`Invalid @odata.bind value '${bind}'`);
    }
    return { entitySetName: match[1], id: match[2].replace(/^\{|\}$/g, '') };
};

/**
 * Reads the value of a lookup column from a Web API payload. Supported formats:
 * * `<navigation>@odata.bind`: resolved with `resolveBind`
 * * `_<logicalname>_value` with its annotations, or holding a {@link LookupReference}
 * * a {@link LookupReference} (e.g. `ComponentFramework.LookupValue`) in `<logicalname>`
 * @returns `undefined` when the payload doesn't contain the lookup, `null` when it clears it
 */
export const readLookupFromItem = (
    item: WebApiEntity,
    logicalName: string,
    resolveBind: (entitySetName: string, id: string) => LookupReference,
): LookupReference | null | undefined => {
    if (logicalName in item && typeof item[logicalName] === 'object') {
        return item[logicalName];
    }

    const bindKey = Object.keys(item).find(
        (key) => key.toLowerCase() === (logicalName + ODataAnnotation.Bind).toLowerCase(),
    );
    if (bindKey) {
        const bind = item[bindKey];
        if (bind === null || bind === undefined) {
            return null;
        }
        const { entitySetName, id } = parseODataBind(bind);
        return resolveBind(entitySetName, id);
    }

    const valueKey = `_${logicalName}_value`;
    if (valueKey in item) {
        const value = item[valueKey];
        if (value === null || value === undefined) return null;
        if (typeof value === 'object') return value;
        return {
            id: value,
            entityType: item[valueKey + ODataAnnotation.LookupLogicalName],
            name: item[valueKey + ODataAnnotation.FormattedValue],
            navigation: item[valueKey + ODataAnnotation.AssociatedNavigationProperty],
        };
    }
    return undefined;
};

/**
 * Reads the formatted value annotation of a property from a Web API payload.
 */
export const readFormattedValue = (item: WebApiEntity, property: string): string | undefined =>
    item[property + ODataAnnotation.FormattedValue];

/**
 * Multi-select choices are exchanged as comma separated strings (`"1,2"`).
 * @returns the values as numbers, or the input when it is not a multi-select value
 */
export const readMultiSelectValue = (value: unknown) =>
    typeof value === 'string' && /^\s*-?\d+(\s*,\s*-?\d+)*\s*$/.test(value)
        ? value.split(',').map((v) => Number(v))
        : value;
