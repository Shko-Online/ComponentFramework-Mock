/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { FormattingMock } from '../src';

describe('FormattingMock', () => {
    let formatting: FormattingMock;

    beforeEach(() => {
        formatting = new FormattingMock();
    });

    it('Format Currency works as expected for USD', () => {
        const result = formatting.formatCurrency(100500, 2, '$');
        expect(result).toEqual('$100,500.00');
    });

    it('Format Currency works as expected for EUR', () => {
        const result = formatting.formatCurrency(100600, 2, '€');
        expect(result).toEqual('€100,600.00');
    });

    it('Format Currency works as expected for ALL', () => {
        const result = formatting.formatCurrency(100400, 2, 'L');
        expect(result).toEqual('L100,400.00');
    });

    it('Format Currency works as expected for unspecified', () => {
        const result = formatting.formatCurrency(100100);
        expect(result).toEqual('100,100');
    });

    it('Format Decimal works as expected with precision specified', () => {
        const result = formatting.formatDecimal(10098, 2);
        expect(result).toEqual('10,098.00');
    });
});
