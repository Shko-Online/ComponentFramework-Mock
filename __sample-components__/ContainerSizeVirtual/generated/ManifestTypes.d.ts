/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    trackContainer: ComponentFramework.PropertyTypes.TwoOptionsProperty;
}
export interface IOutputs {
    trackContainer?: boolean;
}
