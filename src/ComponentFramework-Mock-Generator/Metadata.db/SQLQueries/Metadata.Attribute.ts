/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../../ShkoOnline';
import alasql from 'alasql';

export const CREATE_TABLE_METADATA_ATTRIBUTE = `
    CREATE TABLE Metadata__Attribute(
        EntityId UniqueIdentifier, 
        AttributeId UniqueIdentifier PRIMARY KEY, 
        LogicalName string, 
        AttributeType int,
        DefaultFormValue int NULL,
        OptionSetId UniqueIdentifier,
        AttributeOf string NULL,
        AttributeTypeName string
    )
`;

export const INSERT_METADATA_ATTRIBUTE = `
    INSERT INTO Metadata__Attribute VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )
`;

export const SELECT_METADATA_ATTRIBUTE = `
    SELECT
        E.LogicalName as EntityLogicalName, 
        AttributeId, 
        A.LogicalName as LogicalName, 
        AttributeType,
        DefaultFormValue,
        OptionSetId,
        AttributeOf,
        AttributeTypeName
    FROM 
        Metadata__Attribute A 
            INNER JOIN
        Metadata__Entity E ON A.EntityId=E.EntityId
    WHERE A.LogicalName = ? AND E.LogicalName = ?
`;

export const SELECT_METADATA_ATTRIBUTE_BY_ID = `
    SELECT
        E.LogicalName as EntityLogicalName, 
        AttributeId, 
        A.LogicalName as LogicalName, 
        AttributeType,
        DefaultFormValue,
        OptionSetId,
        AttributeOf,
        AttributeTypeName
    FROM 
        Metadata__Attribute A 
            INNER JOIN
        Metadata__Entity E ON A.EntityId=E.EntityId
    WHERE A.AttributeId = ?
`;

export const SELECT_METADATA_ATTRIBUTES = `
    SELECT
        E.LogicalName as EntityLogicalName, 
        AttributeId, 
        A.LogicalName as LogicalName, 
        AttributeType,
        DefaultFormValue,
        OptionSetId,
        AttributeOf,
        AttributeTypeName
    FROM 
        Metadata__Attribute AS A 
            INNER JOIN
        Metadata__Entity AS E ON A.EntityId=E.EntityId
    WHERE E.LogicalName = ?
`;

export interface AttributeDB {
    EntityId: string;
    AttributeId: string;
    LogicalName: string;
    AttributeType: ShkoOnline.AttributeType;
    AttributeTypeName: string;
    DefaultFormValue?: number;
    OptionSetId?: string;
    AttributeOf?: string;
}

export class AttributeMetadataSQL {
    sql: typeof alasql;
    constructor(sql: typeof alasql) {
        this.sql = sql;
        sql(CREATE_TABLE_METADATA_ATTRIBUTE);
    }
    AddAttributeMetadata(metadata: AttributeDB) {
        this.sql(INSERT_METADATA_ATTRIBUTE, [
            metadata.EntityId,
            metadata.AttributeId,
            metadata.LogicalName,
            metadata.AttributeType,
            metadata.DefaultFormValue,
            metadata.OptionSetId,
            metadata.AttributeOf,
            metadata.AttributeTypeName,
        ]);
    }
    SelectAttributeMetadata(AttributeLogicalName: string, EntityLogicalName: string) {
        return this.sql(SELECT_METADATA_ATTRIBUTE, [AttributeLogicalName, EntityLogicalName]) as AttributeDB[];
    }
    SelectAttributeMetadataById(AttributeId: string) {
        return this.sql(SELECT_METADATA_ATTRIBUTE, [AttributeId]) as AttributeDB[];
    }
    SelectAttributeMetadataForTable(EntityLogicalName: string) {
        return this.sql(SELECT_METADATA_ATTRIBUTES, [EntityLogicalName]) as AttributeDB[];
    }
}
