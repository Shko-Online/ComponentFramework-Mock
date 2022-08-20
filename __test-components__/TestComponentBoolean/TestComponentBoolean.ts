import { ReactElement, JSXElementConstructor } from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";

export class TestComponentBoolean implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private _value: boolean;
    updateView(context: ComponentFramework.Context<IInputs>): ReactElement<any, string | JSXElementConstructor<any>> {
        throw new Error("Method not implemented.");
    }
    init(context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged?: () => void,
        state?: ComponentFramework.Dictionary,
        container?: HTMLDivElement): void {
        this._value = context.parameters.turnedOn.raw;
        console.log(context.client.getClient());
        notifyOutputChanged();
    }
    destroy(): void {
        throw new Error("Method not implemented.");
    }
    getOutputs?(): IOutputs {
        return {
            turnedOn: this._value
        }
    }

}