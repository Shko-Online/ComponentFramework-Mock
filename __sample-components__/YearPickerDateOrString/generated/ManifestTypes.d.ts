/*
    Copyright (c) 2023 Delegate https://github.com/delegateas/PCF
    Licensed under the MIT license.
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    value: ComponentFramework.PropertyTypes.Property;
    enum: ComponentFramework.PropertyTypes.EnumProperty<'Yes' | 'No'>;
}
export interface IOutputs {
    value?: any;
}
