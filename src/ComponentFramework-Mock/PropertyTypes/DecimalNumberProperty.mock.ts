import { PropertyMock } from
    '@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';
import { DecimalNumberMetadataMock } from
    '@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/DecimalNumberMetadata.mock';

export class DecimalNumberPropertyMock 
    extends PropertyMock 
    implements ComponentFramework.PropertyTypes.DecimalNumberProperty {
    attributes?: DecimalNumberMetadataMock
    constructor(defaultValue?: Date) {
        super();
        this.raw = defaultValue;     
    }
}