/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { FilterOperator } from '@shko.online/dataverse-odata';
import type { ShkoOnline } from '../../../ShkoOnline';
import { AttributeType } from '../AttributeType';
import { compareColumnToParameter, sqlIdentifier } from '../SqlHelpers';
import { invalidRequestError } from '../Errors';

const ODATA_TO_SQL_OPERATOR: { [operator: string]: string } = {
    eq: '=',
    ne: '<>',
    gt: '>',
    ge: '>=',
    lt: '<',
    le: '<=',
};

const toSqlOperator = (operator: string) => {
    const sqlOperator = ODATA_TO_SQL_OPERATOR[operator];
    if (!sqlOperator) {
        throw invalidRequestError(`Operator '${operator}' is not supported`);
    }
    return sqlOperator;
};

/**
 * Resolves an OData property name to the attribute that stores it.
 * Lookups are exposed by the Web API as `_<logicalname>_value`.
 * @throws when the property doesn't exist, the same way Dataverse does.
 */
export const resolveODataAttribute = (tableMetadata: ShkoOnline.EntityMetadata, property: string) => {
    const lookupMatch = /^_(.+)_value$/.exec(property);
    const attribute =
        (lookupMatch &&
            tableMetadata.Attributes?.find(
                (attr) => attr.AttributeType === AttributeType.Lookup && attr.LogicalName === lookupMatch[1],
            )) ||
        tableMetadata.Attributes?.find(
            (attr) => attr.LogicalName === property && attr.AttributeType !== AttributeType.Lookup,
        );
    if (!attribute) {
        throw invalidRequestError(
            `Could not find a property named '${property}' on type 'Microsoft.Dynamics.CRM.${tableMetadata.LogicalName}'.`,
        );
    }
    return attribute;
};

/**
 * Translates a parsed OData `$filter` to a SQL `WHERE` condition.
 * @param params receives the values for the `?` placeholders
 */
export const getWhereClauseFromODataFilter = (
    filter: FilterOperator,
    tableMetadata: ShkoOnline.EntityMetadata,
    params: unknown[],
): string => {
    switch (filter.operator) {
        case 'and':
        case 'or':
            return `(${getWhereClauseFromODataFilter(filter.left, tableMetadata, params)}) ${filter.operator.toUpperCase()} (${getWhereClauseFromODataFilter(filter.right, tableMetadata, params)})`;
        case 'not':
            return `NOT (${getWhereClauseFromODataFilter(filter.right, tableMetadata, params)})`;
        case 'eq':
        case 'ne':
        case 'gt':
        case 'ge':
        case 'lt':
        case 'le': {
            const attribute = resolveODataAttribute(tableMetadata, filter.left);
            const column = sqlIdentifier(attribute.LogicalName);
            if ('isColumnOperation' in filter && filter.isColumnOperation) {
                const rightAttribute = resolveODataAttribute(tableMetadata, filter.right);
                return `${column} ${toSqlOperator(filter.operator)} ${sqlIdentifier(rightAttribute.LogicalName)}`;
            }
            if ('isNullOperation' in filter && filter.isNullOperation) {
                return `${column} IS ${filter.operator === 'eq' ? '' : 'NOT '}NULL`;
            }
            return compareColumnToParameter(attribute, column, toSqlOperator(filter.operator), filter.right, params);
        }
        case 'contains':
        case 'startswith':
        case 'endswith': {
            const attribute = resolveODataAttribute(tableMetadata, filter.left);
            const prefix = filter.operator === 'startswith' ? '' : '%';
            const suffix = filter.operator === 'endswith' ? '' : '%';
            params.push(`${prefix}${filter.right}${suffix}`);
            return `${sqlIdentifier(attribute.LogicalName)} LIKE ?`;
        }
        default:
            throw invalidRequestError(`Operator '${(filter as { operator: string }).operator}' is not supported`);
    }
};

/**
 * Translates a parsed OData `$orderby` to a SQL `ORDER BY` clause (empty when there is nothing to order).
 */
export const getOrderByFromOData = (
    orderBy: { column: string; asc: boolean }[] | undefined,
    tableMetadata: ShkoOnline.EntityMetadata,
) => {
    if (!orderBy || orderBy.length === 0) {
        return '';
    }
    return (
        ' ORDER BY ' +
        orderBy
            .map(
                (element) =>
                    `${sqlIdentifier(resolveODataAttribute(tableMetadata, element.column).LogicalName)} ${
                        element.asc ? 'ASC' : 'DESC'
                    }`,
            )
            .join(',')
    );
};
