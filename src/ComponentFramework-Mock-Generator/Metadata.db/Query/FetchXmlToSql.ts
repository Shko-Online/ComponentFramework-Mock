/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../../ShkoOnline';
import { coerceValueForAttribute, compareColumnToParameter, sqlIdentifier } from '../SqlHelpers';

const FETCH_TO_SQL_OPERATOR: { [operator: string]: string } = {
    eq: '=',
    ne: '<>',
    neq: '<>',
    gt: '>',
    ge: '>=',
    lt: '<',
    le: '<=',
};

const childElements = (node: Element, tagName: string) =>
    Array.from(node.children).filter((child) => child.tagName === tagName);

/**
 * Resolves a FetchXML attribute name to its metadata.
 * @throws when the attribute doesn't exist, the same way Dataverse does.
 */
export const resolveFetchAttribute = (tableMetadata: ShkoOnline.EntityMetadata, name: string | null) => {
    const attribute = tableMetadata.Attributes?.find((attr) => attr.LogicalName === name);
    if (!attribute) {
        throw new Error(`'${tableMetadata.LogicalName}' entity doesn't contain attribute with Name = '${name}'.`);
    }
    return attribute;
};

const getConditionClause = (condition: Element, tableMetadata: ShkoOnline.EntityMetadata, params: unknown[]) => {
    const attribute = resolveFetchAttribute(tableMetadata, condition.getAttribute('attribute'));
    const column = sqlIdentifier(attribute.LogicalName);
    const operator = condition.getAttribute('operator') ?? 'eq';
    const value = condition.getAttribute('value');

    if (operator in FETCH_TO_SQL_OPERATOR) {
        return compareColumnToParameter(attribute, column, FETCH_TO_SQL_OPERATOR[operator], value, params);
    }

    switch (operator) {
        case 'null':
            return `${column} IS NULL`;
        case 'not-null':
            return `${column} IS NOT NULL`;
        case 'like':
        case 'not-like':
            params.push(value);
            return `${column} ${operator === 'like' ? '' : 'NOT '}LIKE ?`;
        case 'begins-with':
        case 'not-begin-with':
            params.push(`${value}%`);
            return `${column} ${operator === 'begins-with' ? '' : 'NOT '}LIKE ?`;
        case 'ends-with':
        case 'not-end-with':
            params.push(`%${value}`);
            return `${column} ${operator === 'ends-with' ? '' : 'NOT '}LIKE ?`;
        case 'in':
        case 'not-in': {
            const values = childElements(condition, 'value').map((v) => v.textContent);
            if (values.length === 0) {
                throw new Error(
                    `Condition for attribute '${attribute.LogicalName}': expected argument(s) of type 'value'.`,
                );
            }
            const placeholders = values.map((v) => {
                params.push(coerceValueForAttribute(attribute, v));
                return '?';
            });
            return `${column} ${operator === 'in' ? '' : 'NOT '}IN (${placeholders.join(',')})`;
        }
        default:
            throw new Error(`FetchXML condition operator '${operator}' is not supported`);
    }
};

/**
 * Translates a FetchXML `<filter>` element (with nested filters) to a SQL `WHERE` condition.
 * @param params receives the values for the `?` placeholders
 */
export const getWhereClauseFromFetchFilter = (
    filter: Element,
    tableMetadata: ShkoOnline.EntityMetadata,
    params: unknown[],
): string => {
    const joiner = filter.getAttribute('type') === 'or' ? ' OR ' : ' AND ';
    const parts = Array.from(filter.children)
        .map((child) => {
            if (child.tagName === 'condition') return getConditionClause(child, tableMetadata, params);
            if (child.tagName === 'filter') return getWhereClauseFromFetchFilter(child, tableMetadata, params);
            return '';
        })
        .filter((part) => part !== '')
        .map((part) => `(${part})`);
    return parts.join(joiner);
};

/**
 * Translates the `<order>` elements of a FetchXML `<entity>` to a SQL `ORDER BY` clause.
 */
export const getOrderByFromFetch = (entityNode: Element, tableMetadata: ShkoOnline.EntityMetadata) => {
    const orders = childElements(entityNode, 'order');
    if (orders.length === 0) {
        return '';
    }
    return (
        ' ORDER BY ' +
        orders
            .map((order) => {
                const alias = order.getAttribute('alias');
                const column = alias
                    ? sqlIdentifier(alias)
                    : sqlIdentifier(resolveFetchAttribute(tableMetadata, order.getAttribute('attribute')).LogicalName);
                return `${column} ${order.getAttribute('descending') === 'true' ? 'DESC' : 'ASC'}`;
            })
            .join(',')
    );
};

export { childElements as getFetchChildElements };
