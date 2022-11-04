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

import { stub, SinonStub } from 'sinon';

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
