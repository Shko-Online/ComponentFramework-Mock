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

import { SinonStub, stub } from 'sinon';
import { ClientMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/Client.mock';
import { DeviceMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/Device.mock';
import { FactoryMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/Factory.mocks';
import { FormattingMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/Formatting.mock';
import { ModeMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/Mode.mock';
import { NavigationMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/Navigation.mock';
import {
    MockToRaw,
    PropertyMap,
    PropertyToMock,
} from '@shko.online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/PropertyMap';
import { ResourcesMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/Resources.mock';
import { UserSettingsMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/UserSettings.mock';
import { UtilityMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/Utility.mock';
import { WebApiMock } from '@shko.online/componentframework-mock/ComponentFramework-Mock/WebApi.mock';
import { MetadataDB } from '@shko.online/componentframework-mock/ComponentFramework-Mock-Generator/Metadata.db';

export class ContextMock<IInputs extends ShkoOnline.PropertyTypes<IInputs>>
    implements ComponentFramework.Context<IInputs>
{
    client: ClientMock;
    device: DeviceMock;
    factory: FactoryMock;
    formatting: FormattingMock;
    mode: ModeMock;
    navigation: NavigationMock;
    parameters: IInputs;
    _parameters: PropertyToMock<IInputs>;
    _SetCanvasItems: SinonStub<[MockToRaw<IInputs, PropertyToMock<IInputs>>], void>;
    resources: ResourcesMock;
    userSettings: UserSettingsMock;
    utils: UtilityMock;
    webAPI: WebApiMock;
    updatedProperties: string[];

    constructor(inputs: PropertyMap<IInputs>, db: MetadataDB) {
        this.updatedProperties = [];
        this.client = new ClientMock();
        this.device = new DeviceMock();
        this.factory = new FactoryMock();
        this.formatting = new FormattingMock();
        this.mode = new ModeMock();
        this.navigation = new NavigationMock();
        this.parameters = {} as IInputs;
        this._parameters = {} as PropertyToMock<IInputs>;
        this._SetCanvasItems = stub();
        this._SetCanvasItems.callsFake((parameters) => {
            db.initCanvasItems([parameters]);
        });
        const CanvasEntity = {
            LogicalName: '!CanvasApp',
            EntitySetName: '!CanvasApp',
            Attributes: [],
        } as ShkoOnline.EntityMetadata;

        Object.getOwnPropertyNames<PropertyMap<IInputs>>(inputs).forEach((propertyName) => {
            const parameter = new inputs[propertyName](propertyName as string, db, CanvasEntity);
            parameter._boundColumn = propertyName as string;
            parameter._db = db;
            this._parameters[propertyName] = parameter as unknown as PropertyToMock<IInputs>[keyof IInputs];
            this.parameters[propertyName] = parameter as unknown as IInputs[keyof IInputs];
        });
        db.initMetadata([CanvasEntity]);
        this.resources = new ResourcesMock();
        this.userSettings = new UserSettingsMock();
        this.utils = new UtilityMock();
        this.webAPI = new WebApiMock();
    }
}
