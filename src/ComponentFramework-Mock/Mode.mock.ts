import { SinonStubbedMember, SinonSpy } from "sinon";

export class ModeMock implements ComponentFramework.Mode {
    allocatedHeight: number;
    allocatedWidth: number;
    isControlDisabled: boolean;
    isVisible: boolean;
    label: string;
    setControlState: SinonSpy<[ComponentFramework.Dictionary], boolean>;
    setFullScreen(value: boolean): SinonStubbedMember<void> {
        throw new Error("Method not implemented.");
    }
    trackContainerResize(value: boolean): SinonStubbedMember<void> {
        throw new Error("Method not implemented.");
    }
    constructor(setControlState:SinonSpy<[ComponentFramework.Dictionary], boolean>) {
        this.setControlState = setControlState;
    }
}
