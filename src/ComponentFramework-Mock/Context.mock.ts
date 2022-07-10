export class ContextMock<IInputs> implements ComponentFramework.Context<IInputs> {
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
    parameters: IInputs;
    updatedProperties: string[];
}
