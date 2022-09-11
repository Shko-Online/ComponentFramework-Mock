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
    }
}
