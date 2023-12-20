/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

export type { AttributeDB } from './Metadata.Attribute';

export {
    EntityMetadataSQL,
    CREATE_TABLE_METADATA_ENTITY,
    INSERT_METADATA_ENTITY,
    SELECT_METADATA_ENTITY,
    SELECT_METADATA_ENTITY_BY_ENTITYSET,
} from './Metadata.Entity';
export {
    AttributeMetadataSQL,
    CREATE_TABLE_METADATA_ATTRIBUTE,
    INSERT_METADATA_ATTRIBUTE,
    SELECT_METADATA_ATTRIBUTE,
    SELECT_METADATA_ATTRIBUTE_BY_ID,
    SELECT_METADATA_ATTRIBUTES,
} from './Metadata.Attribute';

export {
    CREATE_TABLE_METADATA_OPTIONSET,
    CREATE_TABLE_METADATA_OPTIONSET_OPTION,
    INSERT_METADATA_OPTIONSET,
    INSERT_METADATA_OPTIONSET_OPTION,
    OptionSetMetadataSQL,
    SELECT_METADATA_OPTIONSET,
    SELECT_METADATA_OPTIONSET_OPTION,
} from './Metadata.Optionset';
