import { DateTimePropertyMock } from "./DateTimeProperty.mock";
import { StringPropertyMock } from "./StringProperty.mock";
import { TwoOptionsPropertyMock } from "./TwoOptionsProperty.mock";

export type PropertyMap<T extends ComponentFramework.PropertyTypes<T>> =
    {
        [P in keyof T]:
        T[P] extends ComponentFramework.PropertyTypes.DateTimeProperty ?
        new () => DateTimePropertyMock :
        T[P] extends ComponentFramework.PropertyTypes.DecimalNumberProperty ?
        never :
        T[P] extends ComponentFramework.PropertyTypes.LookupProperty ?
        never : 
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