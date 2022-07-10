import { PropertyMock } from '@albanian-xrm/componentframework-mock/ComponentFramework-Mock/PropertyTypes/Property.mock';

export class TwoOptionsPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.TwoOptionsProperty {
    raw: boolean;
    attributes?: ComponentFramework.PropertyHelper.FieldPropertyMetadata.TwoOptionMetadata | undefined;
}