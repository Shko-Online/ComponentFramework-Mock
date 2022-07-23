import { StringPropertyMock } from "./StringProperty.mock";
import { TwoOptionsPropertyMock } from "./TwoOptionsProperty.mock";

export type PropertyMap<T extends ComponentFramework.PropertyTypes<T>> = 
{
    [P in keyof T]: 
        T[P] extends ComponentFramework.PropertyTypes.StringProperty ? 
            new() => StringPropertyMock : 
        T[P] extends ComponentFramework.PropertyTypes.TwoOptionsProperty ? 
            new() => TwoOptionsPropertyMock : 
            never
}