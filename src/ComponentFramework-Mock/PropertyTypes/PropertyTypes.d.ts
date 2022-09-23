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

declare namespace ComponentFrameworkMock {
    type PropertyTypes<T extends {
        [P in keyof T]: ComponentFramework.PropertyTypes.Property | ComponentFramework.PropertyTypes.DataSet | ComponentFramework.PropertyTypes.EnumProperty<string> }
        > = {
            [P in keyof T]:
            T[P] extends ComponentFramework.PropertyTypes.TwoOptionsProperty ?
            ComponentFramework.PropertyTypes.TwoOptionsProperty :
            T[P] extends ComponentFramework.PropertyTypes.DataSet ?
            ComponentFramework.PropertyTypes.DataSet :
            T[P] extends ComponentFramework.PropertyTypes.StringProperty ?
            ComponentFramework.PropertyTypes.StringProperty :
            T[P] extends ComponentFramework.PropertyTypes.NumberProperty ?
            ComponentFramework.PropertyTypes.NumberProperty :
            T[P] extends ComponentFramework.PropertyTypes.DateTimeProperty ?
            ComponentFramework.PropertyTypes.DateTimeProperty :
            T[P] extends ComponentFramework.PropertyTypes.DecimalNumberProperty ?
            ComponentFramework.PropertyTypes.DecimalNumberProperty :
            T[P] extends ComponentFramework.PropertyTypes.LookupProperty ?
            ComponentFramework.PropertyTypes.LookupProperty :
            T[P] extends ComponentFramework.PropertyTypes.WholeNumberProperty ?
            ComponentFramework.PropertyTypes.WholeNumberProperty :
            T[P] extends ComponentFramework.PropertyTypes.EnumProperty<string> ?
            ComponentFramework.PropertyTypes.EnumProperty<string> :
            T[P] extends ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty ?
            ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty :
            never
        }

    /**
       * The entire property bag interface available to control via Context Object
       */
    interface Context<TInputs extends PropertyTypes<TInputs>> {
        parameters: TInputs;
    }
}