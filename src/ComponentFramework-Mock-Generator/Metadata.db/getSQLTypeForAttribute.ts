/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { AttributeTypeCode } from './Metadata.types';
import { AttributeType } from './AttributeType';

export const getSqlTypeForAttribute = (attributeType: AttributeTypeCode) => {
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
