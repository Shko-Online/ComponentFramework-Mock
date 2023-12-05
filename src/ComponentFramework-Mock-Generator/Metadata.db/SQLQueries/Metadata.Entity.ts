/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import alasql from 'alasql';

export const CREATE_TABLE_METADATA_ENTITY = `
    CREATE TABLE Metadata__Entity(
        EntityId UniqueIdentifier PRIMARY KEY, 
        LogicalName string, 
        EntitySetName string, 
        PrimaryIdAttribute string, 
        PrimaryNameAttribute string,
        PrimaryImageAttribute string
    )
`;

export const INSERT_METADATA_ENTITY = `
    INSERT INTO Metadata__Entity VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )
`;

export const SELECT_METADATA_ENTITY = `
    SELECT 
        EntityId, 
        LogicalName, 
        EntitySetName, 
        PrimaryIdAttribute, 
        PrimaryNameAttribute,
        PrimaryImageAttribute
    FROM
        Metadata__Entity
    WHERE LogicalName = ?
`;

export const SELECT_METADATA_ENTITY_BY_ENTITYSET = `
    SELECT 
        EntityId, 
        LogicalName, 
        EntitySetName, 
        PrimaryIdAttribute, 
        PrimaryNameAttribute,
        PrimaryImageAttribute
    FROM
        Metadata__Entity
    WHERE EntitySetName = ?
`;

export interface EntityMetadata {
    EntityId: string;
    LogicalName: string;
    EntitySetName?: string;
    PrimaryIdAttribute: string;
    PrimaryNameAttribute: string;
    PrimaryImageAttribute?: string;
}

export class EntityMetadataSQL {
    sql: typeof alasql;
    constructor(sql: typeof alasql) {
        this.sql = sql;
        sql(CREATE_TABLE_METADATA_ENTITY);
    }
    AddEntityMetadata(metadata: EntityMetadata) {
        this.sql(INSERT_METADATA_ENTITY, [
            metadata.EntityId,
            metadata.LogicalName,
            metadata.EntitySetName,
            metadata.PrimaryIdAttribute,
            metadata.PrimaryNameAttribute,
            metadata.PrimaryImageAttribute
        ]);
    }
    SelectTableMetadata(LogicalName: string) {
        return this.sql(SELECT_METADATA_ENTITY, [LogicalName]) as EntityMetadata[];
    }
    SelectTableMetadataByEntitySet(EntitySetName: string) {
        return this.sql(SELECT_METADATA_ENTITY_BY_ENTITYSET, [EntitySetName]) as EntityMetadata[];
    }
}
