import { stub, SinonStub } from "sinon";

export class ClientMock implements ComponentFramework.Client {
    disableScroll: boolean;
    getClient: SinonStub<[void], string>;
    getFormFactor: SinonStub<[void], number>;
    isOffline: SinonStub<[void], boolean>;
    constructor() {
        this.disableScroll = false;
        this.getClient = stub<[void], string>().returns("Web");
        this.getFormFactor = stub<[void], number>().returns(1);
        this.isOffline = stub<[void], boolean>().returns(false);
    }
}
