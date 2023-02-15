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
    /**
     * Used to refresh the context parameters values from the bound columns in the in-memory database.
     *
     * This is called internally by the framework at each UpdateView.
     */
    RefreshParameters: SinonStub<[], void>;

    /**
     * Mocked context that will be passed to the component in the init or update calls.
     */
    context: ContextMock<TInputs>;

    /**
     * In-Memory database for data and metadata
     */
    metadata: MetadataDB;

    /**
     * Mocked notifyOutputChanged that will be passed to the component on init 
     * and that informs the framework that the component changed the outputs.
     * 
     * Can be used in tests to assert if this method was called.
     */
    notifyOutputChanged: SinonStub<[], void>;

    /**
     * Will be called by the platform after the output has changed. 
     * 
     * You can use this method to be notified by the platform that the outputs have changed.
     */
    onOutputChanged: SinonStub<[], void>;

    state: ComponentFramework.Dictionary;

    /**
     * Sets the Control resource to a specific ResX that will be used to respond
     * to {@link ComponentFramework.Resources.getString context.resources.getString() }
     */
    SetControlResource: SinonStub<[resource: string], void>;
}
