/*
	Unless explicitly acquired and licensed from Licensor under another
	license, the contents of this file are subject to the Reciprocal Public
	License ("RPL") Version 1.5, or subsequent versions as allowed by the RPL,
	and You may not copy or use this file in either source code or executable
	form, except in compliance with the terms and conditions of the RPL.

	All software distributed under the RPL is provided strictly on an "AS
	IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND
	LICENSOR HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT
	LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
	PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT. See the RPL for specific
	language governing rights and limitations under the RPL. 
*/

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
import { NumberPropertyMock } from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/NumberProperty.mock";
import { WholeNumberPropertyMock } from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/WholeNumberProperty.mock";
import { MultiSelectOptionSetPropertyMock } from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/MultiSelectOptionSetProperty.mock";

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
        new() => MultiSelectOptionSetPropertyMock :
        T[P] extends ComponentFramework.PropertyTypes.OptionSetProperty ?
        never :
        T[P] extends ComponentFramework.PropertyTypes.WholeNumberProperty ?
        new () => WholeNumberPropertyMock :
        T[P] extends ComponentFramework.PropertyTypes.NumberProperty ?
        new () => NumberPropertyMock :
        T[P] extends ComponentFramework.PropertyTypes.StringProperty ?
        new () => StringPropertyMock :
        T[P] extends ComponentFramework.PropertyTypes.TwoOptionsProperty ?
        new () => TwoOptionsPropertyMock :
        never
    }