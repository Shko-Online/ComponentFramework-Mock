/*
    Copyright (c) 2025 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import { stub } from 'sinon';

export class CopilotMock implements ComponentFramework.Copilot {
    executeEvent: SinonStub<[string,Record<string,unknown>],Promise<ComponentFramework.MCSResponse[]>>;
    executePrompt: SinonStub<[string],Promise<ComponentFramework.MCSResponse[]>>;
    constructor(){
        this.executeEvent = stub();
        this.executePrompt = stub();
    }
}