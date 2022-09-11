import { stub, SinonStub } from "sinon";
import { PropertyMock } from "./Property.mock";

export class LookupPropertyMock
    extends PropertyMock
    implements ComponentFramework.PropertyTypes.LookupProperty {
    getTargetEntityType: SinonStub<[], string>;
    getViewId: SinonStub<[], string>;
    constructor() {
        super();
        this.getTargetEntityType = stub();
        this.getTargetEntityType.returns("mocked_entity");
        this.getViewId = stub();
        this.getViewId.returns("00000000-0000-0000-0000-000000000000");
    }
}