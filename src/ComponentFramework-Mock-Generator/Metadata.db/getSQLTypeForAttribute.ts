/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../ShkoOnline';
import { AttributeType } from '../../ComponentFramework-Mock';

export const getSqlTypeForAttribute = (attributeType: ShkoOnline.AttributeType) => {
    switch (attributeType) {
        case AttributeType.Boolean:
            return 'bit';
        case AttributeType.DateTime:
            return 'datetime';
        case AttributeType.Decimal:
            return 'decimal';
        case AttributeType.Double:
            return 'double';
        case AttributeType.Integer:
            return 'int';
        case AttributeType.Picklist:
        default:
            return 'string';
    }
};
