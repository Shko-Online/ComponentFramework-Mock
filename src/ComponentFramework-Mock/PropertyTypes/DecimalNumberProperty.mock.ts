import { PropertyMock } from
    '@albanian-xrm/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';
import { DecimalNumberMetadataMock } from
    '@albanian-xrm/componentframework-mock/ComponentFramework-Mock/Metadata/DecimalNumberMetadata.mock';

export class DecimalNumberPropertyMock 
    extends PropertyMock 
    implements ComponentFramework.PropertyTypes.DecimalNumberProperty {
    attributes?: DecimalNumberMetadataMock
    constructor(defaultValue?: Date) {
        super();
        this.raw = defaultValue;     
    }
}