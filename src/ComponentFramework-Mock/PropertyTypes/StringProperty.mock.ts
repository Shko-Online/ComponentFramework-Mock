import sinon, { SinonStubbedInstance } from "sinon";
import { PropertyMock } from
    '@albanian-xrm/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';
import { StringMetadataMock } from
    '@albanian-xrm/componentframework-mock/ComponentFramework-Mock/Metadata/StringMetadataMock';

export class StringPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.StringProperty {
    raw: string;
    attributes: StringMetadataMock
    constructor(defaultValue?: string) {
        super();
        this.raw = defaultValue;
        this.attributes = new StringMetadataMock();
    }
}