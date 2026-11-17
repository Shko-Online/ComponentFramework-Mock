/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

export {
    AttributeMetadataSQL,
    CREATE_TABLE_METADATA_ATTRIBUTE,
    CREATE_TABLE_METADATA_ENTITY,
    CREATE_TABLE_METADATA_OPTIONSET,
    CREATE_TABLE_METADATA_OPTIONSET_OPTION,
    EntityMetadataSQL,
    INSERT_METADATA_ATTRIBUTE,
    INSERT_METADATA_ENTITY,
    INSERT_METADATA_OPTIONSET,
    INSERT_METADATA_OPTIONSET_OPTION,
    KeyMetadataSQL,
    OptionSetMetadataSQL,
    PrivilegeMetadataSQL,
    RelationshipMetadataSQL,
    SELECT_METADATA_ATTRIBUTE,
    SELECT_METADATA_ATTRIBUTES,
    SELECT_METADATA_ENTITY,
    SELECT_METADATA_ENTITY_BY_ENTITYSET,
    SELECT_METADATA_ATTRIBUTE_BY_ID,
    SELECT_METADATA_OPTIONSET,
    SELECT_METADATA_OPTIONSET_OPTION,
} from './SQLQueries';

export { getAttributeTypeFromString } from './getAttributeTypeFromString';
export { getSqlTypeForAttribute } from './getSQLTypeForAttribute';
export { AttributeType, OptionSetType } from './AttributeType';
import type * as DataverseMetadata from './Metadata.types';
export type { DataverseMetadata };
export { MetadataStore } from './MetadataStore';
export type { LookupValueWithNavigation, MetadataStoreOptions, RelationshipMetadata } from './MetadataStore';
export { MetadataDB } from './Metadata.db';
export type { MetadataDBOptions } from './Metadata.db';
export type {
    LookupReference,
    WebApiEntity,
    WebApiLabel,
    WebApiLocalizedLabel,
    WebApiMetadata,
    WebApiPage,
    WireFormatter,
} from './Wire';
export {
    getPage,
    ODataAnnotation,
    parseODataBind,
    pickWebApiProperties,
    readLookupFromItem,
    toWebApiAttributeDefinition,
    toWebApiEntity,
    toWebApiEntityDefinition,
    toWebApiKeyDefinition,
    toWebApiLabel,
    toWebApiPrivilege,
    toWebApiRelationshipDefinition,
} from './Wire';
export { DataverseWebApi, getDataverseErrorCode, toDataverseError } from './Api/DataverseWebApi';
export { DataverseErrorCode } from './Errors';
export type { DataverseError, DataverseWebApiOptions, RecordReference, WebApiCollection } from './Api/DataverseWebApi';
