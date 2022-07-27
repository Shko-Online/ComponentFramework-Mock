import { stub, SinonStubbedMember } from "sinon";
import { PopupServiceMock } from "./FactoryApi/PopupService.mock";
export class FactoryMock implements ComponentFramework.Factory {
    popupService = new PopupServiceMock();
    getPopupService(): SinonStubbedMember<PopupServiceMock> {
        throw new Error("Method not implemented.");
    }
    requestRender(): void {
        throw new Error("Method not implemented.");
    }
    constructor() {
        stub(this, "getPopupService").returns(this.popupService);
        stub(this, "requestRender");
    }
}
