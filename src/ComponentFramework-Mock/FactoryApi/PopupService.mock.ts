import { stub, SinonStub } from "sinon";

export class PopupServiceMock implements ComponentFramework.FactoryApi.Popup.PopupService {
    createPopup: SinonStub<[props: ComponentFramework.FactoryApi.Popup.Popup], void>;
    openPopup: SinonStub<[name: string], void>;
    closePopup: SinonStub<[name: string], void>;
    updatePopup: SinonStub<[name: string, newProps: ComponentFramework.FactoryApi.Popup.Popup], void>;
    deletePopup: SinonStub<[name: string], void>;
    setPopupsId: SinonStub<[id: string], void>;
    getPopupsId: SinonStub<[], string>;
    constructor(){
        //to-do
    }
}