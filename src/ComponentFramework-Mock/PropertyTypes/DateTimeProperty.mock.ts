import { PropertyMock } from
    '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';
import { DateTimeMetadataMock } from
    '@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/DateTimeMetadata.mock';

export class DateTimePropertyMock
    extends PropertyMock
    implements ComponentFramework.PropertyTypes.DateTimeProperty {
    raw: Date;
    attributes: DateTimeMetadataMock
    constructor(defaultValue?: Date) {
        super();
        this.raw = defaultValue;
        this.attributes = new DateTimeMetadataMock();
    }
}