/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { AttributeTypeCode } from './Metadata.types';
import { AttributeType } from './AttributeType';

export const getAttributeTypeFromString = (attributeType: AttributeTypeCode | string) => {
    if (typeof attributeType === 'number') {
        return attributeType;
    }
    switch (attributeType) {
        case 'Lookup':
            return AttributeType.Lookup;
        case 'BigInt':
            return AttributeType.BigInt;
        case 'Boolean':
            return AttributeType.Boolean;
        case 'CalendarRules':
            return AttributeType.CalendarRules;
        case 'Customer':
            return AttributeType.Customer;
        case 'DateTime':
            return AttributeType.DateTime;
        case 'Decimal':
            return AttributeType.Decimal;
        case 'Double':
            return AttributeType.Double;
        case 'EntityName':
            return AttributeType.EntityName;
        case 'Integer':
            return AttributeType.Integer;
        case 'ManagedProperty':
            return AttributeType.ManagedProperty;
        case 'Memo':
            return AttributeType.Memo;
        case 'Money':
            return AttributeType.Money;
        case 'Owner':
            return AttributeType.Owner;
        case 'PartyList':
            return AttributeType.PartyList;
        case 'Picklist':
            return AttributeType.Picklist;
        case 'State':
            return AttributeType.State;
        case 'Status':
            return AttributeType.Status;
        case 'String':
            return AttributeType.String;
        case 'Uniqueidentifier':
            return AttributeType.Uniqueidentifier;
        case 'Virtual':
            return AttributeType.Virtual;
        default:
            console.warn(`Got: '${attributeType}'. Returning Virtual.`);
            return AttributeType.Virtual;
    }
};
