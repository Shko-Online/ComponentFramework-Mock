import Sinon, { stub, SinonSpy, SinonStub, SinonMock} from "sinon";
import { ClientMock } from "./Client.mock";
import { DeviceMock } from "./Device.mock";
import { FactoryMock } from "./Factory.mocks";
import { FormattingMock } from "./Formatting.mock";
import { ModeMock } from "./Mode.mock";
import { NavigationMock } from "./Navigation.mock";
import { PropertyMap } from "./PropertyTypes/PropertyMap";
import { ResourcesMock } from "./Resources.mock";
import { UserSettingsMock } from "./UserSettings.mock";
import { UtilityMock } from "./Utility.mock";
import { WebApiMock } from "./WebApi.mock";

export class ContextMock<IInputs extends ComponentFrameworkMock.PropertyTypes<IInputs>>
    implements ComponentFramework.Context<IInputs> {
    client:  ClientMock;   
    device: DeviceMock;
    factory: FactoryMock;
    formatting: FormattingMock;
    mode: ModeMock;
    navigation: NavigationMock;
    parameters: IInputs;
    resources: ResourcesMock;
    userSettings: UserSettingsMock;
    utils: UtilityMock;
    webAPI: WebApiMock;
    updatedProperties: string[];

    constructor(inputs: PropertyMap<IInputs>) {
        this.client = new ClientMock();
        this.device = new DeviceMock();
        this.factory = new FactoryMock();
        this.formatting = new FormattingMock();
        this.mode = new ModeMock();
        this.navigation = new NavigationMock();
        this.parameters = {} as IInputs;
        Object.getOwnPropertyNames(inputs).forEach(k => {
            this.parameters[k] = new inputs[k]();
        });
        this.resources = new ResourcesMock();
        this.userSettings = new UserSettingsMock();
        this.utils = new UtilityMock();
        this.webAPI = new WebApiMock();
    }
}
