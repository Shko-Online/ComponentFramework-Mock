import sinon, { SinonStubbedInstance } from "sinon";
import { PropertyMock } from
    '@albanian-xrm/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';
import { TwoOptionMetadataMock } from
    '@albanian-xrm/componentframework-mock/ComponentFramework-Mock/Metadata/TwoOptionMetadata.mock';

export class TwoOptionsPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.TwoOptionsProperty {
    raw: boolean;
    attributes?: SinonStubbedInstance<ComponentFramework.PropertyHelper.FieldPropertyMetadata.TwoOptionMetadata> | undefined;
    constructor(defaultValue?: boolean) {
        super();
        this.raw = defaultValue;
        this.attributes = new TwoOptionMetadataMock();
    }
}