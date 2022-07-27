import { PropertyMock } from
    '@albanian-xrm/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';
import { DateTimeMetadataMock } from
    '@albanian-xrm/componentframework-mock/ComponentFramework-Mock/Metadata/DateTimeMetadataMock';

export class DateTimePropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.DateTimeProperty {
    raw: Date;
    attributes: DateTimeMetadataMock
    constructor(defaultValue?: Date) {
        super();
        this.raw = defaultValue;
        this.attributes = new DateTimeMetadataMock();
    }
}