import { SinonStub, stub } from "sinon";

export class ResourcesMock implements ComponentFramework.Resources {
    getResource: SinonStub<[id: string, success: (data: string) => void, failure: () => void], void>;
    getString: SinonStub<[id: string], string>;
    constructor() {
        this.getResource = stub();

        this.getString = stub();
    }
}
