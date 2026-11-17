/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import alasql from 'alasql';

export const CREATE_TABLE_METADATA_PRIVILEGE = `
    CREATE TABLE Metadata__Privilege(
        PrivilegeId UniqueIdentifier,
        EntityId UniqueIdentifier,
        [Name] string,
        PrivilegeType int,
        [Definition] string
    )
`;

export interface PrivilegeDB {
    PrivilegeId: string;
    EntityId: string;
    Name: string;
    PrivilegeType: number;
    /** The JSON of the privilege definition */
    Definition: string;
}

export class PrivilegeMetadataSQL {
    sql: typeof alasql;
    constructor(sql: typeof alasql) {
        this.sql = sql;
        sql(CREATE_TABLE_METADATA_PRIVILEGE);
    }
    AddPrivilegeMetadata(metadata: PrivilegeDB) {
        this.sql('INSERT INTO Metadata__Privilege VALUES (?, ?, ?, ?, ?)', [
            metadata.PrivilegeId,
            metadata.EntityId,
            metadata.Name,
            metadata.PrivilegeType,
            metadata.Definition,
        ]);
    }
    SelectPrivilegeMetadataForTable(EntityId: string) {
        return this.sql('SELECT * FROM Metadata__Privilege WHERE EntityId = ? ORDER BY PrivilegeType', [
            EntityId,
        ]) as PrivilegeDB[];
    }
    DeletePrivilegeMetadata(EntityId: string, Name: string) {
        this.sql('DELETE FROM Metadata__Privilege WHERE EntityId = ? AND [Name] = ?', [EntityId, Name]);
    }
}
