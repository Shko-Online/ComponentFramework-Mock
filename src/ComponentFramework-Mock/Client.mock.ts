import { stub, SinonStubbedMember } from "sinon";

export class ClientMock implements ComponentFramework.Client {
    disableScroll: boolean;
    getClient(): SinonStubbedMember<string> {
        throw new Error("Method not implemented.");
    }
    getFormFactor(): SinonStubbedMember<number> {
        throw new Error("Method not implemented.");
    }
    isOffline(): SinonStubbedMember<boolean> {
        throw new Error("Method not implemented.");
    }
    constructor() {
        this.disableScroll = false;
        stub(this, "getClient").returns("Web");
        stub(this, "getFormFactor").returns(1);
        stub(this, "isOffline").returns(false);
    }
}
