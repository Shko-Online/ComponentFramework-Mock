/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import alasql from 'alasql';

/**
 * The relationships are stored once and returned for both tables:
 * `ReferencedEntity`/`ReferencingEntity` for one-to-many, `Entity1LogicalName`/`Entity2LogicalName` for many-to-many.
 */
export const CREATE_TABLE_METADATA_RELATIONSHIP = `
    CREATE TABLE Metadata__Relationship(
        RelationshipId UniqueIdentifier PRIMARY KEY,
        [SchemaName] string,
        RelationshipType string,
        ReferencedEntity string NULL,
        ReferencingEntity string NULL,
        Entity1LogicalName string NULL,
        Entity2LogicalName string NULL,
        [Definition] string
    )
`;

export interface RelationshipDB {
    RelationshipId: string;
    SchemaName: string;
    RelationshipType: 'OneToManyRelationship' | 'ManyToManyRelationship';
    ReferencedEntity: string | null;
    ReferencingEntity: string | null;
    Entity1LogicalName: string | null;
    Entity2LogicalName: string | null;
    /** The JSON of the relationship definition */
    Definition: string;
}

export class RelationshipMetadataSQL {
    sql: typeof alasql;
    constructor(sql: typeof alasql) {
        this.sql = sql;
        sql(CREATE_TABLE_METADATA_RELATIONSHIP);
    }
    AddRelationshipMetadata(metadata: RelationshipDB) {
        this.sql('INSERT INTO Metadata__Relationship VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            metadata.RelationshipId,
            metadata.SchemaName,
            metadata.RelationshipType,
            metadata.ReferencedEntity,
            metadata.ReferencingEntity,
            metadata.Entity1LogicalName,
            metadata.Entity2LogicalName,
            metadata.Definition,
        ]);
    }
    SelectRelationshipMetadata(SchemaName: string) {
        return this.sql('SELECT * FROM Metadata__Relationship WHERE [SchemaName] = ?', [
            SchemaName,
        ]) as RelationshipDB[];
    }
    SelectAllRelationshipMetadata() {
        return this.sql('SELECT * FROM Metadata__Relationship ORDER BY [SchemaName]') as RelationshipDB[];
    }
    SelectOneToManyRelationshipMetadata(ReferencedEntity: string) {
        return this.sql('SELECT * FROM Metadata__Relationship WHERE ReferencedEntity = ? ORDER BY [SchemaName]', [
            ReferencedEntity,
        ]) as RelationshipDB[];
    }
    SelectManyToOneRelationshipMetadata(ReferencingEntity: string) {
        return this.sql('SELECT * FROM Metadata__Relationship WHERE ReferencingEntity = ? ORDER BY [SchemaName]', [
            ReferencingEntity,
        ]) as RelationshipDB[];
    }
    SelectManyToManyRelationshipMetadata(EntityLogicalName: string) {
        return this.sql(
            'SELECT * FROM Metadata__Relationship WHERE Entity1LogicalName = ? OR Entity2LogicalName = ? ORDER BY [SchemaName]',
            [EntityLogicalName, EntityLogicalName],
        ) as RelationshipDB[];
    }
    DeleteRelationshipMetadata(SchemaName: string) {
        this.sql('DELETE FROM Metadata__Relationship WHERE [SchemaName] = ?', [SchemaName]);
    }
}
