/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import { stub } from 'sinon';

export class ClientMock implements ComponentFramework.Client {
    disableScroll: boolean;
    getClient: SinonStub<[], string>;
    getFormFactor: SinonStub<[], number>;
    isNetworkAvailable: SinonStub<[], boolean>;
    isOffline: SinonStub<[], boolean>;
    constructor() {
        this.disableScroll = false;
        this.getClient = stub();
        this.getClient.returns('Web');
        this.getFormFactor = stub();
        this.getFormFactor.returns(1);
        this.isNetworkAvailable = stub();
        this.isNetworkAvailable.returns(true);
        this.isOffline = stub();
        this.isOffline.returns(false);
    }
}
