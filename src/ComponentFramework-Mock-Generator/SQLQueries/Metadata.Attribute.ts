import { ShkoOnline } from '@shko.online/componentframework-mock/ShkoOnline';
import alasql from 'alasql';

export const CREATE_TABLE_METADATA_ATTRIBUTE = `
    CREATE TABLE Metadata__Attribute(
        EntityId UniqueIdentifier, 
        AttributeId UniqueIdentifier, 
        LogicalName string, 
        AttributeType int,
        DefaultFormValue int,
        OptionSetId UniqueIdentifier,
        AttributeOf string,
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

interface Attribute {
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
    AddAttributeMetadata(metadata: Attribute) {
        this.sql(INSERT_METADATA_ATTRIBUTE, [
            metadata.EntityId,
            metadata.AttributeId,
            metadata.LogicalName,
            metadata.AttributeType,
            metadata.DefaultFormValue,
            metadata.OptionSetId,
            metadata.AttributeOf,
            metadata.AttributeTypeName
        ]);
    }
    SelectAttributeMetadata(AttributeLogicalName: string, EntityLogicalName: string ) {
        return this.sql(SELECT_METADATA_ATTRIBUTE, [AttributeLogicalName, EntityLogicalName ]) as Attribute[];
    }
    SelectAttributeMetadataForTable(EntityLogicalName: string) {
        return this.sql(SELECT_METADATA_ATTRIBUTES, [EntityLogicalName]) as Attribute[];
    }
}
