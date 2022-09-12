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
