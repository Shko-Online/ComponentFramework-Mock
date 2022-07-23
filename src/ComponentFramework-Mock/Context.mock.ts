import sinon, { SinonStubbedInstance } from "sinon";
import { PropertyMap } from "./PropertyTypes/PropertyTypes";

export class ContextMock<IInputs extends ComponentFramework.PropertyTypes<IInputs>>
    implements ComponentFramework.Context<IInputs> {
    private _parameters: IInputs;
    client: ComponentFramework.Client;
    device: ComponentFramework.Device;
    factory: ComponentFramework.Factory;
    formatting: ComponentFramework.Formatting;
    mode: ComponentFramework.Mode;
    navigation: ComponentFramework.Navigation;
    resources: ComponentFramework.Resources;
    userSettings: ComponentFramework.UserSettings;
    utils: ComponentFramework.Utility;
    webAPI: ComponentFramework.WebApi;
    get parameters(): IInputs {
        return this._parameters;
    };
    updatedProperties: string[];
    constructor(inputs: PropertyMap<IInputs>) {
        this._parameters = {} as IInputs;
        for (let k in inputs) {
            this.parameters[k] = sinon.createStubInstance(inputs[k])();
        }
    }
}
