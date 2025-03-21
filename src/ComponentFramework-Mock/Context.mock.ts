/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../ShkoOnline';
import type { MockToRaw, PropertyMap, PropertyToMock } from './PropertyTypes';

import { stub } from 'sinon';
import { ClientMock } from './Client.mock';
import { DeviceMock } from './Device.mock';
import { FactoryMock } from './Factory.mocks';
import { FluentDesignStateMock } from './FluentDesignState.mock';
import { FormattingMock } from './Formatting.mock';
import { ModeMock } from './Mode.mock';
import { NavigationMock } from './Navigation.mock';
import { ResourcesMock } from './Resources.mock';
import { UserSettingsMock } from './UserSettings.mock';
import { UtilityMock } from './Utility.mock';
import { WebApiMock } from './WebApi.mock';
import { MetadataDB } from '../ComponentFramework-Mock-Generator';

export class ContextMock<IInputs extends ShkoOnline.PropertyTypes<IInputs>,TEvents = ComponentFramework.IEventBag>
    implements ComponentFramework.Context<IInputs, TEvents>
{
    client: ClientMock;
    device: DeviceMock;
    factory: FactoryMock;
    formatting: FormattingMock;
    mode: ModeMock;
    navigation: NavigationMock;
    parameters: IInputs;
    _parameters: PropertyToMock<IInputs>;
    _SetCanvasItems: SinonStub<[items: Partial<MockToRaw<IInputs, PropertyToMock<IInputs>>>], void>;
    resources: ResourcesMock;
    userSettings: UserSettingsMock;
    utils: UtilityMock;
    webAPI: WebApiMock;
    updatedProperties: string[];
    fluentDesignLanguage?: FluentDesignStateMock;
    events: TEvents;
    constructor(inputs: PropertyMap<IInputs>, db: MetadataDB) {
        this.updatedProperties = [];
        this.events = {} as TEvents;
        this.client = new ClientMock();
        this.device = new DeviceMock();
        this.factory = new FactoryMock();
        this.formatting = new FormattingMock();
        this.fluentDesignLanguage = new FluentDesignStateMock();
        this.mode = new ModeMock();
        this.navigation = new NavigationMock();
        this.parameters = {} as IInputs;
        this._parameters = {} as PropertyToMock<IInputs>;
        this._SetCanvasItems = stub();
        this._SetCanvasItems.callsFake((parameters) => {
            const mappedParameters: { [key: string]: any } = {};
            Object.getOwnPropertyNames<PropertyToMock<IInputs>>(this._parameters).forEach((propertyName) => {
                const parameter = this._parameters[propertyName];
                if (propertyName in parameters) {
                    mappedParameters[parameter._boundColumn] =
                        parameters[propertyName as unknown as keyof typeof parameters];
                }
            });
            db.initCanvasItems([mappedParameters]);
        });
        const CanvasEntity =
            db.getTableMetadata(MetadataDB.CanvasLogicalName) ??
            ({
                LogicalName: MetadataDB.CanvasLogicalName,
                EntitySetName: MetadataDB.CanvasLogicalName,
                Attributes: [],
            } as ShkoOnline.EntityMetadata);

        Object.getOwnPropertyNames<PropertyMap<IInputs>>(inputs).forEach((propertyName) => {
            const parameterClass = inputs[propertyName] as unknown as new (
                propertyName: string,
                db: MetadataDB,
                CanvasEntity: ShkoOnline.EntityMetadata,
            ) => PropertyToMock<IInputs>[keyof IInputs];
            const parameter = new parameterClass(propertyName as string, db, CanvasEntity);
            // parameter._boundColumn = propertyName as string;
            // parameter._db = db;
            this._parameters[propertyName] = parameter;
            this.parameters[propertyName] = parameter as unknown as IInputs[keyof IInputs];
        });
        db.initMetadata([CanvasEntity]);
        this.resources = new ResourcesMock();
        this.userSettings = new UserSettingsMock();
        this.utils = new UtilityMock();
        this.webAPI = new WebApiMock(db, this.formatting);
    }
}

declare global {
    interface ObjectConstructor {
        getOwnPropertyNames<T>(o: T): (keyof T)[];
    }
}