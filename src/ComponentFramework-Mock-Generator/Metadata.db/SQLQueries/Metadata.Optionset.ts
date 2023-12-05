/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import alasql from 'alasql';

export const CREATE_TABLE_METADATA_OPTIONSET = `
    CREATE TABLE Metadata__Optionset(
        OptionSetId UniqueIdentifier PRIMARY KEY, 
        LogicalName string, 
        IsCustomOptionSet bit,
        OptionSetType  int
    )
`;

export const INSERT_METADATA_OPTIONSET = `
    INSERT INTO Metadata__Optionset
    VALUES (
        ?, 
        ?, 
        ?,
        ?
    )
`;

export const SELECT_METADATA_OPTIONSET = `
    SELECT  
        OptionSetId, 
        LogicalName, 
        IsCustomOptionSet,
        OptionSetType
    FROM 
        Metadata__Optionset
    WHERE OptionSetId = ?
`;

export const CREATE_TABLE_METADATA_OPTIONSET_OPTION = `
    CREATE TABLE Metadata__Optionset_Option(
        [OptionId] UniqueIdentifier PRIMARY KEY, 
        [OptionSetId] UniqueIdentifier,
        [Color] string NULL, 
        [Value] int,
        [Label] string,
        [Description] string NULL,
        [DefaultStatus] int NULL,        
        [State] int NULL
    )
`;

export const INSERT_METADATA_OPTIONSET_OPTION = `
    INSERT INTO Metadata__Optionset_Option
    VALUES (
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

export const SELECT_METADATA_OPTIONSET_OPTION = `
    SELECT  
        OptionId, 
        OptionSetId,
        Color, 
        [Value],
        Label,
        Description,
        DefaultStatus,        
        State    
    FROM 
        Metadata__Optionset_Option
    WHERE OptionSetId = ?
`;

export interface OptionSet {
    OptionSetId: string;
    LogicalName: string;
    IsCustomOptionSet: boolean;
    OptionSetType: number;
}

export interface OptionSetOption {
    OptionId: string;
    OptionSetId: string;
    Color?: string;
    Value: number;
    Label: string;
    Description?: string;
    DefaultStatus?: number;
    State?: number;
}

export class OptionSetMetadataSQL {
    sql: typeof alasql;
    constructor(sql: typeof alasql) {
        this.sql = sql;
        sql(CREATE_TABLE_METADATA_OPTIONSET);
        sql(CREATE_TABLE_METADATA_OPTIONSET_OPTION);
    }
    AddOptionSetMetadata(metadata: OptionSet) {
       return this.sql(INSERT_METADATA_OPTIONSET, [
            metadata.OptionSetId,
            metadata.LogicalName,
            metadata.IsCustomOptionSet,
            metadata.OptionSetType,
        ]);
    }
    SelectOptionSetMetadata(OptionSetId: string) {
        return this.sql(SELECT_METADATA_OPTIONSET, [OptionSetId]) as OptionSet[];
    }
    AddOptionMetadata(metadata: OptionSetOption) {
       return this.sql(INSERT_METADATA_OPTIONSET_OPTION, [
            metadata.OptionId,
            metadata.OptionSetId,
            metadata.Color,
            metadata.Value,
            metadata.Label,
            metadata.Description,
            metadata.DefaultStatus,
            metadata.State,
        ]);
    }
    SelectOptionSetOptionMetadata(OptionSetId: string) {
        return this.sql(SELECT_METADATA_OPTIONSET_OPTION, [OptionSetId]) as OptionSetOption[];
    }
}
