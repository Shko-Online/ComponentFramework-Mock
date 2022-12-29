/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { stub } from 'sinon';
import type { SinonStub }from 'sinon';

export class ModeMock implements ComponentFramework.Mode {
    allocatedHeight: number;
    allocatedWidth: number;
    isControlDisabled: boolean;
    isVisible: boolean;
    label: string;
    setControlState: SinonStub<[state: ComponentFramework.Dictionary], boolean>;
    _FullScreen: boolean;
    setFullScreen: SinonStub<[value: boolean], void>;
    trackContainerResize: SinonStub<[value: boolean], void>;
    constructor() {
        this.allocatedHeight = -1;
        this.allocatedWidth = -1;
        this.isVisible = true;
        this.isControlDisabled = false;
        this.label = 'Mocked with @shko.online/componentframework-mock';
        this.setControlState = stub(); // this is mocked in ComponentFrameworkMockGenerator
        this._FullScreen = false;
        this.setFullScreen = stub();
        this.setFullScreen.callsFake((value) => {
            this._FullScreen = value;
        });
        this.trackContainerResize = stub(); // this is mocked in ComponentFrameworkMockGenerator
    }
}
