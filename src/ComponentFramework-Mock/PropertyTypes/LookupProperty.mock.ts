import { stub, SinonStubbedMember } from "sinon";
import { PropertyMock } from "./Property.mock";

export class LookupPropertyMock
    extends PropertyMock 
    implements ComponentFramework.PropertyTypes.LookupProperty {
    getTargetEntityType(): SinonStubbedMember<string> {
        throw new Error("Method not implemented.");
    }
    getViewId(): SinonStubbedMember<string> {
        throw new Error("Method not implemented.");
    }
    constructor() {
        super();
        stub(this, "getTargetEntityType").returns("mocked_entity");
        stub(this, "getViewId").returns("00000000-0000-0000-0000-000000000000");
    }
}