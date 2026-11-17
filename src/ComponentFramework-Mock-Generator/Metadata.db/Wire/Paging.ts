/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { WebApiEntity, WebApiPage } from './Wire.types';

export const MOCK_WEB_API_URL = 'https://localhost/api/data/v9.2/';
export const DEFAULT_PAGE_SIZE = 5000;

/**
 * Returns the page requested by the `$skiptoken` in `options`.
 * `nextLink` is set only when there are more records, the same way Dataverse does.
 * The query part of `nextLink` can be passed back as `options` to get the next page.
 * @param entitySetName Used to build `nextLink`
 */
export const getPage = (
    entities: WebApiEntity[],
    entitySetName: string,
    options?: string,
    maxPageSize?: number,
    baseUrl = MOCK_WEB_API_URL,
): WebApiPage => {
    const params = new URLSearchParams(options ?? '');
    const skip = Math.max(Number.parseInt(params.get('$skiptoken') ?? '0', 10) || 0, 0);
    const pageSize = maxPageSize && maxPageSize > 0 ? maxPageSize : DEFAULT_PAGE_SIZE;
    const page: WebApiPage = { entities: entities.slice(skip, skip + pageSize) };
    if (skip + pageSize < entities.length) {
        params.set('$skiptoken', String(skip + pageSize));
        page.nextLink = `${baseUrl}${entitySetName}?${params.toString()}`;
    }
    return page;
};
