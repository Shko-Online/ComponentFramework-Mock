/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { stub, SinonStub } from 'sinon';

export class ClientMock implements ComponentFramework.Client {
    disableScroll: boolean;
    getClient: SinonStub<[], string>;
    getFormFactor: SinonStub<[], number>;
    isOffline: SinonStub<[], boolean>;
    constructor() {
        this.disableScroll = false;
        this.getClient = stub();
        this.getClient.returns('Web');
        this.getFormFactor = stub();
        this.getFormFactor.returns(1);
        this.isOffline = stub();
        this.isOffline.returns(false);
    }
}
