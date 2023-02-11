/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub }from 'sinon';

import { stub } from 'sinon';

export class PopupServiceMock implements ComponentFramework.FactoryApi.Popup.PopupService {
    createPopup: SinonStub<[props: ComponentFramework.FactoryApi.Popup.Popup], void>;
    openPopup: SinonStub<[name: string], void>;
    closePopup: SinonStub<[name: string], void>;
    updatePopup: SinonStub<[name: string, newProps: ComponentFramework.FactoryApi.Popup.Popup], void>;
    deletePopup: SinonStub<[name: string], void>;
    setPopupsId: SinonStub<[id: string], void>;
    getPopupsId: SinonStub<[], string>;
    constructor() {
        this.createPopup = stub();

        this.openPopup = stub();

        this.closePopup = stub();

        this.updatePopup = stub();

        this.deletePopup = stub();

        this.setPopupsId = stub();

        this.getPopupsId = stub();
    }
}
