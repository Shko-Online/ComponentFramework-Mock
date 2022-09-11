import { stub, SinonStub } from "sinon";
import { PopupServiceMock } from "./FactoryApi/PopupService.mock";
export class FactoryMock implements ComponentFramework.Factory {
    popupService = new PopupServiceMock();
    getPopupService: SinonStub<[void], PopupServiceMock>;
    requestRender: SinonStub<[void], void>;
    constructor() {
        this.getPopupService = stub();
        this.getPopupService.returns(this.popupService);
        this.requestRender = stub();
    }
}
