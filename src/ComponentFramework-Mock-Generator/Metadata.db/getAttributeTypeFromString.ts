/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../ShkoOnline';
import { AttributeType } from '../../ComponentFramework-Mock';

export const getAttributeTypeFromString = (attributeType: ShkoOnline.AttributeType | string) => {
    if (typeof attributeType === 'number') {
        return attributeType;
    }
    switch (attributeType) {
        case 'Lookup':
            return AttributeType.Lookup as ShkoOnline.AttributeType.Lookup;
        case 'BigInt':
            return AttributeType.BigInt as ShkoOnline.AttributeType.BigInt;
        case 'Boolean':
            return AttributeType.Boolean as ShkoOnline.AttributeType.Boolean;
        case 'CalendarRules':
            return AttributeType.CalendarRules as ShkoOnline.AttributeType.CalendarRules;
        case 'Customer':
            return AttributeType.Customer as ShkoOnline.AttributeType.Customer;
        case 'DateTime':
            return AttributeType.DateTime as ShkoOnline.AttributeType.DateTime;
        case 'Decimal':
            return AttributeType.Decimal as ShkoOnline.AttributeType.Decimal;
        case 'Double':
            return AttributeType.Double as ShkoOnline.AttributeType.Double;
        case 'EntityName':
            return AttributeType.EntityName as ShkoOnline.AttributeType.EntityName;
        case 'Integer':
            return AttributeType.Integer as ShkoOnline.AttributeType.Integer;
        case 'Lookup':
            return AttributeType.Lookup as ShkoOnline.AttributeType.Lookup;
        case 'ManagedProperty':
            return AttributeType.ManagedProperty as ShkoOnline.AttributeType.ManagedProperty;
        case 'Memo':
            return AttributeType.Memo as ShkoOnline.AttributeType.Memo;
        case 'Money':
            return AttributeType.Money as ShkoOnline.AttributeType.Money;
        case 'Owner':
            return AttributeType.Owner as ShkoOnline.AttributeType.Owner;
        case 'PartyList':
            return AttributeType.PartyList as ShkoOnline.AttributeType.PartyList;
        case 'Picklist':
            return AttributeType.Picklist as ShkoOnline.AttributeType.Picklist;
        case 'State':
            return AttributeType.State as ShkoOnline.AttributeType.State;
        case 'Status':
            return AttributeType.Status as ShkoOnline.AttributeType.Status;
        case 'String':
            return AttributeType.String as ShkoOnline.AttributeType.String;
        case 'Uniqueidentifier':
            return AttributeType.Uniqueidentifier as ShkoOnline.AttributeType.Uniqueidentifier;
        case 'Virtual':
            return AttributeType.Virtual as ShkoOnline.AttributeType.Virtual;
        default:
            console.warn(`Got: '${attributeType}'. Returning Virtual.`);
            return AttributeType.Virtual as ShkoOnline.AttributeType.Virtual;
    }
};
