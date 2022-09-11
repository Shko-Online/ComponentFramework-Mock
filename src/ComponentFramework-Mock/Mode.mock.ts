import { SinonStub, stub } from "sinon";

export class ModeMock implements ComponentFramework.Mode {
    allocatedHeight: number;
    allocatedWidth: number;
    isControlDisabled: boolean;
    isVisible: boolean;
    label: string;
    setControlState: SinonStub<[ComponentFramework.Dictionary], boolean>;
    setFullScreen: SinonStub<[value: boolean],void>;
    trackContainerResize: SinonStub<[value: boolean],void>;
    constructor() {
        this.setControlState = stub(); // this is mocked in ComponentFrameworkMockGenerator
        this.setFullScreen = stub();

        this.trackContainerResize = stub();
        
    }
}
