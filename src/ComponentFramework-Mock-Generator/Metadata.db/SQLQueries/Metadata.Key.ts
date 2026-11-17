/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import alasql from 'alasql';

export const CREATE_TABLE_METADATA_KEY = `
    CREATE TABLE Metadata__Key(
        KeyId UniqueIdentifier PRIMARY KEY,
        EntityId UniqueIdentifier,
        LogicalName string,
        [Definition] string
    )
`;

export interface KeyDB {
    KeyId: string;
    EntityId: string;
    LogicalName: string;
    /** The JSON of the key definition */
    Definition: string;
}

export class KeyMetadataSQL {
    sql: typeof alasql;
    constructor(sql: typeof alasql) {
        this.sql = sql;
        sql(CREATE_TABLE_METADATA_KEY);
    }
    AddKeyMetadata(metadata: KeyDB) {
        this.sql('INSERT INTO Metadata__Key VALUES (?, ?, ?, ?)', [
            metadata.KeyId,
            metadata.EntityId,
            metadata.LogicalName,
            metadata.Definition,
        ]);
    }
    SelectKeyMetadataForTable(EntityId: string) {
        return this.sql('SELECT * FROM Metadata__Key WHERE EntityId = ? ORDER BY LogicalName', [EntityId]) as KeyDB[];
    }
    DeleteKeyMetadata(EntityId: string, LogicalName: string) {
        this.sql('DELETE FROM Metadata__Key WHERE EntityId = ? AND LogicalName = ?', [EntityId, LogicalName]);
    }
}
