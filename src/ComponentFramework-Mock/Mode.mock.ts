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

import { SinonStub, stub } from 'sinon';

export class ModeMock implements ComponentFramework.Mode {
    allocatedHeight: number;
    allocatedWidth: number;
    isControlDisabled: boolean;
    isVisible: boolean;
    label: string;
    setControlState: SinonStub<[ComponentFramework.Dictionary], boolean>;
    setFullScreen: SinonStub<[value: boolean], void>;
    trackContainerResize: SinonStub<[value: boolean], void>;
    constructor() {
        this.setControlState = stub(); // this is mocked in ComponentFrameworkMockGenerator
        this.setFullScreen = stub();

        this.trackContainerResize = stub();
        this.trackContainerResize.callsFake((value: boolean) => {});
    }
}
