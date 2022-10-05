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

import { stub, SinonStub } from "sinon";
import { PopupServiceMock } from '@shko-online/componentframework-mock/ComponentFramework-Mock/FactoryApi/PopupService.mock';
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
