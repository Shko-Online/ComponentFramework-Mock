/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { stub } from 'sinon';
import type { SinonStub } from 'sinon';

export class ResourcesMock implements ComponentFramework.Resources {
    getResource: SinonStub<[id: string, success: (data: string) => void, failure: () => void], void>;
    getString: SinonStub<[id: string], string>;
    constructor() {
        this.getResource = stub();
        this.getString = stub();
    }
}
