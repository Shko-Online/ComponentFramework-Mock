/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { stub } from 'sinon';
import type { SinonStub } from 'sinon';

type DateTimeFieldBehavior = ComponentFramework.FormattingApi.Types.DateTimeFieldBehavior;

const symbolToCurrency: { [key: string]: string } = {
    '€': 'EUR',
    $: 'USD',
};

export class FormattingMock implements ComponentFramework.Formatting {
    formatCurrency: SinonStub<[value: number, precision?: number, currencySymbol?: string], string>;
    formatDecimal: SinonStub<[value: number, precision?: number], string>;
    formatDateAsFilterStringInUTC: SinonStub<[value: Date, includeTime?: boolean], string>;
    formatDateLong: SinonStub<[value: Date], string>;
    formatDateLongAbbreviated: SinonStub<[value: Date], string>;
    formatDateShort: SinonStub<[value: Date, includeTime?: boolean], string>;
    formatDateYearMonth: SinonStub<[value: Date], string>;
    formatInteger: SinonStub<[value: number], string>;
    formatLanguage: SinonStub<[value: number], string>;
    formatTime: SinonStub<[value: Date, behavior: DateTimeFieldBehavior], string>;
    getWeekOfYear: SinonStub<[value: Date], number>;
    locale: 'en-US' | 'it-IT';
    constructor() {
        this.locale = 'en-US';
        this.formatCurrency = stub();
        this.formatCurrency.callsFake((value: number, precision?: number, currencySymbol?: string) => {
            const currency = currencySymbol ? symbolToCurrency[currencySymbol] : undefined;
            return (
                (currencySymbol && !currency ? currencySymbol : '') +
                value.toLocaleString(this.locale, {
                    style: currency ? 'currency' : 'decimal',
                    currency,
                    maximumFractionDigits: precision,
                    minimumFractionDigits: precision,
                })
            );
        });
        this.formatDecimal = stub();
        this.formatDecimal.callsFake((value: number, precision?: number) => {
            return value.toLocaleString(this.locale, {
                maximumFractionDigits: precision,
                minimumFractionDigits: precision
            });
        });
        this.formatDateAsFilterStringInUTC = stub();
        this.formatDateAsFilterStringInUTC.callsFake((value: Date, includeTime?: boolean) => {
            return value.toLocaleString(this.locale, {
                day: '2-digit',
                year: 'numeric',
                month: '2-digit',
            });
        });
        this.formatDateLong = stub();
        this.formatDateLong.callsFake((value: Date) => {
            return value.toLocaleString(this.locale, {
                dateStyle: 'long',
            });
        });
        this.formatDateLongAbbreviated = stub();
        this.formatDateLongAbbreviated.callsFake((value: Date) => {
            return value.toLocaleString(this.locale, {
                dateStyle: 'medium',
            });
        });
        this.formatDateShort = stub();
        this.formatDateShort.callsFake((value: Date, includeTime?: boolean) => {
            if (includeTime === true) {
                return value
                    .toLocaleString(this.locale, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                    })
                    .replace(',', '');
            }
            return value.toLocaleDateString(this.locale, {
                dateStyle: 'short',
            });
        });
        this.formatDateYearMonth = stub();
        this.formatDateYearMonth.callsFake((value: Date) => {
            return value.toLocaleString(this.locale, {
                year: 'numeric',
                month: 'long',
            });
        });
        this.formatInteger = stub();
        this.formatInteger.callsFake((value: number) => {
            return value.toLocaleString(this.locale, {});
        });
        this.formatLanguage = stub();
        this.formatLanguage.callsFake((value: number) => {
            return `${value}`;
        });
        this.formatTime = stub();
        this.formatTime.callsFake((value: Date, behavior: DateTimeFieldBehavior) => {
            throw new Error('Method not implemented.');
        });
        this.getWeekOfYear = stub();
        this.getWeekOfYear.callsFake((value: Date) => {
            const leapYear = value.getFullYear() % 4 === 0;
            const monthDays = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            let dayOfYear = 0;
            for (let i = 0; i < value.getMonth(); i++) {
                dayOfYear += monthDays[i];
            }
            dayOfYear += value.getDate();
            return Math.ceil(dayOfYear / 7);
        });
    }
}
