import { WholeNumberMetadataMock } from
    '@shko-online/componentframework-mock/ComponentFramework-Mock/Metadata/WholeNumberMetadata.mock';
import { NumberPropertyMock } from './NumberProperty.mock';

export class WholeNumberPropertyMock
    extends NumberPropertyMock
    implements ComponentFramework.PropertyTypes.WholeNumberProperty {
    attributes?: WholeNumberMetadataMock
    constructor(defaultValue?: Date) {
        super();
        this.raw = defaultValue;
    }
}