import { PropertyMock } from
    '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';
import { NumberMetadataMock } from
    '@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/NumberMetadata.mock';

export class NumberPropertyMock 
    extends PropertyMock 
    implements ComponentFramework.PropertyTypes.NumberProperty {
    attributes?: NumberMetadataMock
    constructor(defaultValue?: Date) {
        super();
        this.raw = defaultValue;     
    }
}