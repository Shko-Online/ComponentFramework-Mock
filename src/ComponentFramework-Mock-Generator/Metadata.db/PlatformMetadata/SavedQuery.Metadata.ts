/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { AttributeType } from '../AttributeType';
import type { EntityMetadata } from '../Metadata.types';

export const SavedQueryMetadata = {
    LogicalName: 'savedquery',
    PrimaryIdAttribute: 'savedqueryid',
    PrimaryNameAttribute: 'name',
    EntitySetName: 'savedqueries',
    Attributes: [
        {
            AttributeType: AttributeType.Uniqueidentifier,
            LogicalName: 'savedqueryid',
            SchemaName: 'SavedQueryId',
        },
        {
            AttributeType: AttributeType.String,
            LogicalName: 'name',
            SchemaName: 'Name',
        },
        {
            AttributeType: AttributeType.String,
            LogicalName: 'returnedtypecode',
            SchemaName: 'ReturnedTypeCode',
        },
        {
            AttributeType: AttributeType.String,
            LogicalName: 'fetchxml',
            SchemaName: 'FetchXML',
        },
    ],
} as EntityMetadata;
