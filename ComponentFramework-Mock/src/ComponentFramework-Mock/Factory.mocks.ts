/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { stub } from 'sinon';
import type { SinonStub }from 'sinon';
import { PopupServiceMock } from './FactoryApi';
export class FactoryMock implements ComponentFramework.Factory {
    _popupService = new PopupServiceMock();
    getPopupService: SinonStub<[], PopupServiceMock>;
    requestRender: SinonStub<[], void>;
    constructor() {
        this.getPopupService = stub();
        this.getPopupService.returns(this._popupService);
        this.requestRender = stub();
    }
}
