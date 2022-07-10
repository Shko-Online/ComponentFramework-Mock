/*
*This is auto generated from the ControlManifest.Input.xml file
*/

// Define IInputs and IOutputs Type. They should match with ControlManifest.
export interface IInputs {
    selection: ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty;
    controlType: ComponentFramework.PropertyTypes.EnumProperty<"0" | "1">;
    orientation: ComponentFramework.PropertyTypes.EnumProperty<"1" | "0">;
}
export interface IOutputs {
    selection?: number[];
}
