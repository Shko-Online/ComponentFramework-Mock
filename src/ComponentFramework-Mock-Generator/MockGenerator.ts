/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../ShkoOnline';

import type { ContextMock, MockToRaw, PropertyToMock } from '../ComponentFramework-Mock';
import type { MetadataDB } from './Metadata.db';

export type ComponentValues< TInputs extends ShkoOnline.PropertyTypes<TInputs>> = Partial<MockToRaw<TInputs, PropertyToMock<TInputs>>>[Extract<keyof MockToRaw<TInputs, PropertyToMock<TInputs>>, string>]; 

export interface MockGeneratorOverrides {
    metadata?: MetadataDB;
}

export interface MockGenerator<
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
> {
    _PendingUpdates: {
        value: ComponentFramework.LookupValue | ComponentValues<TInputs>;
        table: string;
        column: string;
        row?: string;
    }[];

    /**
     * This method triggers the controls init method
     */
    ExecuteInit: () => void;

    /**
     * Used to refresh the context parameters values from the bound columns in the in-memory database.
     *
     * This is called internally by the framework at each UpdateView.
     */
    RefreshParameters: SinonStub<[], void>;

    /**
     * Used to refresh the dataset parameters that might be still loading
     *
     * This is called internally by the framework at each UpdateView.
     */
    RefreshDatasets: SinonStub<[], void>;

    /**
     * Sets the Control resource to a specific ResX that will be used to respond
     * to {@link ComponentFramework.Resources.getString context.resources.getString() }
     */
    SetControlResource: SinonStub<[resource: string], void>;

    UpdateValues: SinonStub<[items: Partial<MockToRaw<TInputs, PropertyToMock<TInputs>>>], void>;

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
    onOutputChanged: SinonStub<[updates: Partial<TOutputs>], void>;

    /**
     * Properties defined as output only. Specific any type allowed.
     */
    outputOnlyProperties: ShkoOnline.OutputOnlyTypes<TInputs, TOutputs>;

    /**
     * Will be used by the track container when asked by {@link ComponentFramework.Mode.trackContainerResize}
     */
    resizeObserver: ResizeObserver;

    /**
     * the state object that is passed to the component
     */
    state: ComponentFramework.Dictionary;
}
