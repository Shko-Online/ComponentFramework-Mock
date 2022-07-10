import { ReactElement, JSXElementConstructor } from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class TestComponent implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    updateView(context: ComponentFramework.Context<IInputs>): ReactElement<any, string | JSXElementConstructor<any>> {
        throw new Error("Method not implemented.");
    }
    init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged?: () => void, state?: ComponentFramework.Dictionary, container?: HTMLDivElement): void {
        throw new Error("Method not implemented.");
    }
    destroy(): void {
        throw new Error("Method not implemented.");
    }
    getOutputs?(): IOutputs {
        throw new Error("Method not implemented.");
    }

}