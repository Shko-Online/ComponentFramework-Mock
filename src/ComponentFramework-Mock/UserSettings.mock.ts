export class UserSettingsMock implements ComponentFramework.UserSettings{
    dateFormattingInfo: ComponentFramework.UserSettingApi.DateFormattingInfo;
    isRTL: boolean;
    languageId: number;
    numberFormattingInfo: ComponentFramework.UserSettingApi.NumberFormattingInfo;
    securityRoles: string[];
    userId: string;
    userName: string;
    getTimeZoneOffsetMinutes(date?: Date): number {
        throw new Error("Method not implemented.");
    }
}
