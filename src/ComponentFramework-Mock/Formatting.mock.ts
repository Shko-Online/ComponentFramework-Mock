import { stub, SinonStub } from "sinon";

export class FormattingMock implements ComponentFramework.Formatting {
    formatCurrency: SinonStub<[value: number, precision?: number, symbol?: string], string>;
    formatDecimal: SinonStub<[value: number, precision?: number], string>;
    formatDateAsFilterStringInUTC: SinonStub<[value: Date, includeTime?: boolean], string>;
    formatDateLong: SinonStub<[value: Date], string>;
    formatDateLongAbbreviated: SinonStub<[value: Date], string>;
    formatDateShort: SinonStub<[value: Date, includeTime?: boolean], string>;
    formatDateYearMonth: SinonStub<[value: Date], string>;
    formatInteger: SinonStub<[value: number], string>;
    formatLanguage: SinonStub<[value: number], string>;
    formatTime: SinonStub<[value: Date, behavior: ComponentFramework.FormattingApi.Types.DateTimeFieldBehavior], string>;
    getWeekOfYear: SinonStub<[value: Date], number>;
    locale: 'en-US' | 'it-IT'
    constructor() {
        this.locale = 'en-US';
        this.formatCurrency = stub<[value: number, precision?: number, symbol?: string], string>();
        this.formatCurrency.callsFake((value: number, precision?: number, symbol?: string) => {
            return value.toLocaleString(this.locale, {
                maximumSignificantDigits: precision,
                currencySign: symbol
            });
        })
        this.formatDecimal = stub<[value: number, precision?: number], string>();
        this.formatDecimal.callsFake((value: number, precision?: number) => {
            return value.toLocaleString(
                this.locale,
                {
                    maximumSignificantDigits: precision
                }
            );
        });
        this.formatDateAsFilterStringInUTC = stub<[value: Date, includeTime?: boolean], string>();
        this.formatDateAsFilterStringInUTC.callsFake((value: Date, includeTime?: boolean) => {
            throw new Error("Method not implemented.");
        });
        this.formatDateLong = stub<[value: Date], string>();
        this.formatDateLong.callsFake((value: Date) => {
            throw new Error("Method not implemented.");
        });
        this.formatDateLongAbbreviated = stub<[value: Date], string>();
        this.formatDateLongAbbreviated.callsFake((value: Date) => {
            return value !== null ? value.toLocaleString(this.locale, {
                day: '2-digit',
                weekday: 'short',
                year: 'numeric',
                month: 'long',
            }) : null;
        });
        this.formatDateShort = stub<[value: Date, includeTime?: boolean], string>();
        this.formatDateShort.callsFake((value: Date, includeTime?: boolean) => {
            throw new Error("Method not implemented.");
        });
        this.formatDateYearMonth = stub<[value: Date], string>();
        this.formatDateYearMonth.callsFake((value: Date) => {
            return value !== null ? value.toLocaleString(this.locale, {
                year: 'numeric',
                month: 'long',
            }) : null;
        });
        this.formatInteger = stub<[value: number], string>();
        this.formatInteger.callsFake((value: number) => {
            return `${value}`;
        });
        this.formatLanguage = stub<[value: number], string>();
        this.formatLanguage.callsFake((value: number) => {
            return `${value}`
        });
        this.formatTime = stub<[value: Date, behavior: ComponentFramework.FormattingApi.Types.DateTimeFieldBehavior], string>();
        this.formatTime.callsFake((value: Date, behavior: ComponentFramework.FormattingApi.Types.DateTimeFieldBehavior) => {
            throw new Error("Method not implemented.");
        });
        this.getWeekOfYear = stub<[value: Date], number>();
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