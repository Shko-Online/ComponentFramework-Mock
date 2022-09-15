/*
	Unless explicitly acquired and licensed from Licensor under another
	license, the contents of this file are subject to the Reciprocal Public
	License ("RPL") Version 1.5, or subsequent versions as allowed by the RPL,
	and You may not copy or use this file in either source code or executable
	form, except in compliance with the terms and conditions of the RPL.

	All software distributed under the RPL is provided strictly on an "AS
	IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND
	LICENSOR HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT
	LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
	PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT. See the RPL for specific
	language governing rights and limitations under the RPL. 
*/

import { SinonStub, stub } from "sinon";

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
        this.getTimeZoneOffsetMinutes = stub();
        this.numberFormattingInfo = {
              currencyDecimalDigits: 5,              
              currencyDecimalSeparator: ".",
              currencyGroupSeparator: ",",
              currencyGroupSizes: [3],
              currencyNegativePattern: 0,
              currencyPositivePattern: 0,
              currencySymbol: undefined,
              nanSymbol: "NaN",
              nativeDigits: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
              negativeInfinitySymbol: "-Infinity",
              negativeSign: "-",
              numberDecimalDigits: 2,
              numberDecimalSeparator: ".",
              numberGroupSeparator: ",",
              numberGroupSizes: [3],
              numberNegativePattern: 1,
              perMilleSymbol: "",
              percentDecimalDigits: 2,
              percentDecimalSeparator: ".",
              percentGroupSeparator: ",",
              percentGroupSizes: [3],
              percentNegativePattern: 0,
              percentPositivePattern: 0,
              percentSymbol: "%",
              positiveInfinitySymbol: "Infinity",
              positiveSign: "+",
        } 
        
    }
}
