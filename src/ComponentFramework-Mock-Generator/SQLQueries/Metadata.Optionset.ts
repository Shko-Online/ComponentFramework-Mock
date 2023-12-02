import alasql from "alasql";

export const CREATE_TABLE_METADATA_OPTIONSET = `
    CREATE TABLE Metadata__Optionset(
        OptionSetId UniqueIdentifier, 
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
        OptionSetId UniqueIdentifier, 
        LogicalName string, 
        IsCustomOptionSet bit,
        OptionSetType  int
    )
`;


export interface OptionSet {
    OptionSetId: string; 
    LogicalName: string;
    IsCustomOptionSet: boolean;
    OptionSetType: number;
}

export class OptionSetMetadataSQL {
    sql: typeof alasql;
    constructor(sql: typeof alasql) {
        this.sql = sql;
        sql(CREATE_TABLE_METADATA_OPTIONSET);
        sql(CREATE_TABLE_METADATA_OPTIONSET_OPTION);
    }
    AddOptionSetMetadata(metadata: OptionSet) {
        this.sql(INSERT_METADATA_OPTIONSET, [
            metadata.OptionSetId,
            metadata.LogicalName,
            metadata.IsCustomOptionSet,
            metadata.OptionSetType
        ]);
    }
    SelectOptionSetMetadata(OptionSetId: string) {
        return this.sql(SELECT_METADATA_OPTIONSET, [OptionSetId]) as OptionSet[];
    }
}
