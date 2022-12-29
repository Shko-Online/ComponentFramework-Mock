/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../ShkoOnline';

import { ContextMock } from '../ComponentFramework-Mock';
import { MetadataDB } from './Metadata.db';

export interface MockGenerator<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
> {
    _RefreshParameters: SinonStub<[], void>;
    context: ContextMock<TInputs>;
    metadata: MetadataDB;
    notifyOutputChanged: SinonStub<[], void>;
    state: ComponentFramework.Dictionary;
    SetControlResource: SinonStub<[resource: string], void>;
}
