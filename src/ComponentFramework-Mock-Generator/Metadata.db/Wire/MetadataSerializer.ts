/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { AttributeMetadata, AttributeTypeCode, EntityMetadata } from '../Metadata.types';

import { AttributeType, OptionSetType } from '../AttributeType';

/**
 * A localized label, as returned by the Dataverse Web API metadata endpoints.
 */
export interface WebApiLocalizedLabel {
    Label: string;
    LanguageCode: number;
}

/**
 * A label, as returned by the Dataverse Web API metadata endpoints.
 */
export interface WebApiLabel {
    LocalizedLabels: WebApiLocalizedLabel[];
    UserLocalizedLabel: WebApiLocalizedLabel | null;
}

/**
 * A table or column definition, as returned by the `EntityDefinitions` endpoints of the Dataverse Web API.
 */
export type WebApiMetadata = { [property: string]: any };

/** The language of the labels created from the string labels of the store */
export const DEFAULT_LANGUAGE_CODE = 1033;

const ENTITY_LABELS = ['DisplayName', 'DisplayCollectionName', 'Description'];
const ATTRIBUTE_LABELS = ['DisplayName', 'Description'];

const attributeTypeNames = new Map<number, string>(
    Object.entries(AttributeType).map(([name, value]) => [value as number, name]),
);
const optionSetTypeNames = new Map<number, string>(
    Object.entries(OptionSetType).map(([name, value]) => [value as number, name]),
);

/** The derived `AttributeMetadata` type of each attribute type, when it has one */
const attributeODataTypes: { [name: string]: string } = {
    BigInt: 'BigIntAttributeMetadata',
    Boolean: 'BooleanAttributeMetadata',
    Customer: 'LookupAttributeMetadata',
    DateTime: 'DateTimeAttributeMetadata',
    Decimal: 'DecimalAttributeMetadata',
    Double: 'DoubleAttributeMetadata',
    EntityName: 'EntityNameAttributeMetadata',
    Integer: 'IntegerAttributeMetadata',
    Lookup: 'LookupAttributeMetadata',
    ManagedProperty: 'ManagedPropertyAttributeMetadata',
    Memo: 'MemoAttributeMetadata',
    Money: 'MoneyAttributeMetadata',
    Owner: 'LookupAttributeMetadata',
    PartyList: 'LookupAttributeMetadata',
    Picklist: 'PicklistAttributeMetadata',
    State: 'StateAttributeMetadata',
    Status: 'StatusAttributeMetadata',
    String: 'StringAttributeMetadata',
    Uniqueidentifier: 'UniqueIdentifierAttributeMetadata',
};

/**
 * Returns the name of an attribute type, e.g. `Lookup` for `AttributeType.Lookup`.
 */
export const getAttributeTypeName = (attributeType: AttributeTypeCode | string) =>
    typeof attributeType === 'string'
        ? attributeType
        : (attributeTypeNames.get(attributeType) ?? String(attributeType));

/**
 * Creates a label with a single localized label.
 * Returns an empty label when `text` is missing.
 */
export const toWebApiLabel = (text: string | undefined | null, languageCode = DEFAULT_LANGUAGE_CODE): WebApiLabel => {
    if (text === undefined || text === null) {
        return { LocalizedLabels: [], UserLocalizedLabel: null };
    }
    const localizedLabel = { Label: text, LanguageCode: languageCode };
    return { LocalizedLabels: [localizedLabel], UserLocalizedLabel: { ...localizedLabel } };
};

const isLabel = (value: unknown) => !!value && typeof value === 'object' && 'LocalizedLabels' in (value as object);

/** Converts the string labels of the store, leaving the ones already in the Web API shape */
const convertLabels = (definition: WebApiMetadata, properties: string[]) => {
    properties.forEach((property) => {
        if (!isLabel(definition[property])) {
            definition[property] = toWebApiLabel(definition[property]);
        }
    });
};

const toWebApiOption = (option: { Value: number; Label?: unknown; Color?: string }) => {
    const converted: WebApiMetadata = {
        Value: option.Value,
        Label: isLabel(option.Label) ? option.Label : toWebApiLabel(option.Label as string | undefined),
    };
    if (option.Color !== undefined) {
        converted['Color'] = option.Color;
    }
    return converted;
};

/**
 * Converts an option set of the store: `Options` become an array and labels become {@link WebApiLabel}s.
 */
export const toWebApiOptionSet = (optionSet: any): WebApiMetadata | undefined => {
    if (!optionSet || typeof optionSet !== 'object') {
        return optionSet;
    }
    const converted: WebApiMetadata = { ...optionSet };
    if (typeof optionSet.OptionSetType === 'number') {
        converted['OptionSetType'] = optionSetTypeNames.get(optionSet.OptionSetType) ?? optionSet.OptionSetType;
    }
    if (optionSet.Options && !Array.isArray(optionSet.Options)) {
        converted['Options'] = Object.values(optionSet.Options as { [value: number]: { Value: number } })
            .sort((a, b) => a.Value - b.Value)
            .map(toWebApiOption);
    }
    if (optionSet.TrueOption) converted['TrueOption'] = toWebApiOption(optionSet.TrueOption);
    if (optionSet.FalseOption) converted['FalseOption'] = toWebApiOption(optionSet.FalseOption);
    if ('DisplayName' in optionSet || 'Description' in optionSet) {
        convertLabels(converted, ATTRIBUTE_LABELS);
    }
    return converted;
};

/**
 * Converts a column definition of the store to the shape returned by
 * `EntityDefinitions(LogicalName='<table>')/Attributes`.
 * Does not change `attribute`.
 */
export const toWebApiAttributeDefinition = (
    attribute: AttributeMetadata,
    entityLogicalName: string,
): WebApiMetadata => {
    const typeName = getAttributeTypeName(attribute.AttributeType);
    const attributeTypeName =
        (attribute.AttributeTypeName as { value?: string; Value?: string } | undefined)?.Value ||
        attribute.AttributeTypeName?.value ||
        `${typeName}Type`;
    const odataType =
        attributeTypeName === 'MultiSelectPicklistType'
            ? 'MultiSelectPicklistAttributeMetadata'
            : (attributeODataTypes[typeName] ?? 'AttributeMetadata');

    const definition: WebApiMetadata = {
        '@odata.type': `#Microsoft.Dynamics.CRM.${odataType}`,
        ...attribute,
        AttributeType: typeName,
        AttributeTypeName: { Value: attributeTypeName },
        EntityLogicalName: attribute.EntityLogicalName ?? entityLogicalName,
    };
    convertLabels(definition, ATTRIBUTE_LABELS);
    if ('OptionSet' in definition) {
        definition['OptionSet'] = toWebApiOptionSet(definition['OptionSet']);
    }
    return definition;
};

/**
 * Converts a table definition of the store to the shape returned by `EntityDefinitions(LogicalName='<table>')`.
 * The columns are left out, as they are a navigation property: use {@link toWebApiAttributeDefinition}.
 * Does not change `tableMetadata`.
 */
export const toWebApiEntityDefinition = (tableMetadata: EntityMetadata): WebApiMetadata => {
    const { Attributes: _attributes, ...definition } = tableMetadata;
    const converted: WebApiMetadata = { ...definition };
    convertLabels(converted, ENTITY_LABELS);
    return converted;
};

/**
 * Keeps the properties requested with `$select`, plus the ones the Web API always returns
 * (`MetadataId` and the `@odata.type` of derived types).
 */
export const pickMetadataProperties = (definition: WebApiMetadata, select?: string[]): WebApiMetadata => {
    if (!select || select.length === 0) {
        return definition;
    }
    const picked: WebApiMetadata = {};
    ['@odata.type', 'MetadataId', ...select].forEach((property) => {
        if (property in definition) {
            picked[property] = definition[property];
        }
    });
    return picked;
};
