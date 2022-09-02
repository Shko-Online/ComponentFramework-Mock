import { DateTimePropertyMock }
    from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DateTimeProperty.mock";
import { DecimalNumberPropertyMock }
    from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/DecimalNumberProperty.mock";
import { StringPropertyMock }
    from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/StringProperty.mock";
import { TwoOptionsPropertyMock }
    from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/TwoOptionsProperty.mock";
import { LookupPropertyMock }
    from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/LookupProperty.mock";

export type PropertyMap<T extends ComponentFrameworkMock.PropertyTypes<T>> =
    {
        [P in keyof T]:
        T[P] extends ComponentFramework.PropertyTypes.DateTimeProperty ?
        new () => DateTimePropertyMock :
        T[P] extends ComponentFramework.PropertyTypes.DecimalNumberProperty ?
        new () => DecimalNumberPropertyMock :
        T[P] extends ComponentFramework.PropertyTypes.LookupProperty ?
        new () => LookupPropertyMock :
        T[P] extends ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty ?
        never :
        T[P] extends ComponentFramework.PropertyTypes.OptionSetProperty ?
        never :
        T[P] extends ComponentFramework.PropertyTypes.WholeNumberProperty ?
        never :
        T[P] extends ComponentFramework.PropertyTypes.StringProperty ?
        new () => StringPropertyMock :
        T[P] extends ComponentFramework.PropertyTypes.TwoOptionsProperty ?
        new () => TwoOptionsPropertyMock :
        never
    }