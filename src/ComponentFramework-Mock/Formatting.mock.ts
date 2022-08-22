import Sinon, { fake, SinonSpy } from "sinon";

export class FormattingMock implements ComponentFramework.Formatting {
    formatCurrency: SinonSpy<[value: number, precision?: number, symbol?: string], string>;
    formatDecimal: SinonSpy<[value: number, precision?: number], string>;
    formatDateAsFilterStringInUTC: SinonSpy<[value: Date, includeTime?: boolean], string>;
    formatDateLong: SinonSpy<[value: Date], string>;
    formatDateLongAbbreviated: SinonSpy<[value: Date], string>;
    formatDateShort: SinonSpy<[value: Date, includeTime?: boolean], string>;
    formatDateYearMonth: SinonSpy<[value: Date], string>;
    formatInteger: SinonSpy<[value: number], string>;
    formatLanguage: SinonSpy<[value: number], string>;
    formatTime: SinonSpy<[value: Date, behavior: ComponentFramework.FormattingApi.Types.DateTimeFieldBehavior], string>;
    getWeekOfYear: SinonSpy<[value: Date], number>;

    constructor() {
        this.formatCurrency = fake((value: number, precision?: number, symbol?: string) => {
            return `${value}`;
        })
        this.formatDecimal = fake((value: number, precision?: number) => {
            return `${value}`;
        });
        this.formatDateAsFilterStringInUTC = fake((value: Date, includeTime?: boolean) => {
            throw new Error("Method not implemented.");
        });
        this.formatDateLong = fake((value: Date) => {
            throw new Error("Method not implemented.");
        });
        this.formatDateLongAbbreviated = fake((value: Date) => {
            throw new Error("Method not implemented.");
        });
        this.formatDateShort = fake((value: Date, includeTime?: boolean) => {
            throw new Error("Method not implemented.");
        });
        this.formatDateYearMonth = fake((value: Date) => {
            return `${value}`;
        });
        this.formatInteger = fake((value: number) => {
            return `${value}`;
        });
        this.formatLanguage = fake((value: number) => {
            return `${value}`
        });
        this.formatTime = fake((value: Date, behavior: ComponentFramework.FormattingApi.Types.DateTimeFieldBehavior) => {
            throw new Error("Method not implemented.");
        });
        this.getWeekOfYear = fake((value: Date) => {
            const leapYear = value.getFullYear() % 4 === 0;
            const monthDays = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            let dayOfYear = 0;
            for(let i=0;i<value.getMonth();i++){
                dayOfYear += monthDays[i];
            }
            dayOfYear += value.getDate();
            return Math.ceil(dayOfYear/7);
        });
    }
}