import * as sinon from "sinon";
import { SinonStubbedInstance } from "sinon";
import { ClientMock } from "./Client.mock";
import { PropertyMap } from "./PropertyTypes/PropertyMap";

export class ContextMock<IInputs extends ComponentFramework.PropertyTypes<IInputs>>
    implements ComponentFramework.Context<IInputs> {
    client: ClientMock;
    device: ComponentFramework.Device;
    factory: ComponentFramework.Factory;
    formatting: ComponentFramework.Formatting;
    mode: ComponentFramework.Mode;
    navigation: ComponentFramework.Navigation;
    parameters: IInputs;
    resources: ComponentFramework.Resources;
    userSettings: ComponentFramework.UserSettings;
    utils: ComponentFramework.Utility;
    webAPI: ComponentFramework.WebApi;
    updatedProperties: string[];
    constructor(inputs: PropertyMap<IInputs>) {
        this.parameters = {} as IInputs;
        Object.getOwnPropertyNames(inputs).forEach(k=>{
            this.parameters[k] = new inputs[k]() ;
        });
    }
}
