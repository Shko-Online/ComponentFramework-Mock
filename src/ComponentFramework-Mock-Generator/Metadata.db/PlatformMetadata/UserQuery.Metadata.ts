/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { AttributeType } from '../AttributeType';
import { ShkoOnline } from '../../../ShkoOnline';

export const UserQueryMetadata = {
    LogicalName: 'userquery',
    PrimaryIdAttribute: 'userqueryid',
    PrimaryNameAttribute: 'name',
    EntitySetName: 'userqueries',
    Attributes: [
        {
            AttributeType: AttributeType.Uniqueidentifier,
            LogicalName: 'userqueryid',
            SchemaName: 'UserQueryId',
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
} as ShkoOnline.EntityMetadata;
