/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { SinonStub, stub } from 'sinon';

export class UserSettingsMock implements ComponentFramework.UserSettings {
    dateFormattingInfo: ComponentFramework.UserSettingApi.DateFormattingInfo;
    isRTL: boolean;
    languageId: number;
    numberFormattingInfo: ComponentFramework.UserSettingApi.NumberFormattingInfo;
    securityRoles: string[];
    userId: string;
    userName: string;
    getTimeZoneOffsetMinutes: SinonStub<[date?: Date], number>;

    constructor() {
        this.dateFormattingInfo = {
            amDesignator: 'AM',
            abbreviatedDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            abbreviatedMonthGenitiveNames: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
                '',
            ],
            abbreviatedMonthNames: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
                '',
            ],
            calendarWeekRule: 0,
            calendar: {
                minSupportedDateTime: new Date(1753,0,1),
                maxSupportedDateTime: new Date(9999,11,31),
                algorithmType: 1,
                calendarType: 1,
                twoDigitYearMax: 2029,
            },
            dateSeparator: '/',
            dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            firstDayOfWeek: 0,
            fullDateTimePattern: 'dddd, MMMM d, yyyy h:mm:ss tt',
            longDatePattern: 'dddd, MMMM d, yyyy',
            longTimePattern: 'hh:mm:ss tt',
            monthDayPattern: 'MMMM dd',
            monthGenitiveNames: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
                '',
            ],
            monthNames: [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
                '',
            ],
            pmDesignator: 'PM',
            shortDatePattern: 'M/d/yyyy',
            shortTimePattern: 'h:mm tt',
            shortestDayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
            sortableDateTimePattern: "yyyy'-'MM'-'dd'T'HH':'mm':'ss",
            timeSeparator: ':',
            universalSortableDateTimePattern: "yyyy'-'MM'-'dd HH':'mm':'ss'Z'",
            yearMonthPattern: 'MMMM yyyy',
        };
        this.isRTL = true;
        this.languageId = 1033;
        this.numberFormattingInfo = {
            currencyDecimalDigits: 5,
            currencyDecimalSeparator: '.',
            currencyGroupSeparator: ',',
            currencyGroupSizes: [3],
            currencyNegativePattern: 0,
            currencyPositivePattern: 0,
            currencySymbol: "$",
            nanSymbol: 'NaN',
            nativeDigits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
            negativeInfinitySymbol: '-Infinity',
            negativeSign: '-',
            numberDecimalDigits: 2,
            numberDecimalSeparator: '.',
            numberGroupSeparator: ',',
            numberGroupSizes: [3],
            numberNegativePattern: 1,
            perMilleSymbol: '',
            percentDecimalDigits: 2,
            percentDecimalSeparator: '.',
            percentGroupSeparator: ',',
            percentGroupSizes: [3],
            percentNegativePattern: 0,
            percentPositivePattern: 0,
            percentSymbol: '%',
            positiveInfinitySymbol: 'Infinity',
            positiveSign: '+',
        };
        this.securityRoles = [];
        this.userId = '';
        this.userName = '';
        this.getTimeZoneOffsetMinutes = stub();
    }
}
