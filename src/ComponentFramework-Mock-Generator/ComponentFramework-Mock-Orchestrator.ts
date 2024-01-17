/*
    Copyright (c) 2024 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { PropertyMap } from '../ComponentFramework-Mock';
import type { ShkoOnline } from '../ShkoOnline';
import type { MockGenerator, MockGeneratorOverrides } from './MockGenerator';
import type { OrchestratorGenerators, OrchestratorInput } from './ComponentFramework-Mock-Orchestrator.types';
import { ComponentFrameworkMockGenerator } from './ComponentFramework-Mock-Generator';
import { ComponentFrameworkMockGeneratorReact } from './ComponentFramework-Mock-Generator-React';
import { MetadataDB } from './Metadata.db';

type IInputs = { [key: string]: any };
type IOutputs = IInputs;
type IOutputOnly = ShkoOnline.OutputOnlyTypes<{}, IOutputs>;
type StandardMock = [
    control: new () => ComponentFramework.StandardControl<IInputs, IOutputs>,
    inputs: PropertyMap<IInputs>,
    container?: HTMLDivElement,
    outputs?: IOutputOnly,
    overrides?: MockGeneratorOverrides
];
type VirtualMock = [
    control: new () => ComponentFramework.ReactControl<IInputs, IOutputs>,
    inputs: PropertyMap<IInputs>,
    outputs?: IOutputOnly,
    overrides?: MockGeneratorOverrides
];


export class ComponentFrameworkMockOrchestrator<T> {
    constructor(controls: OrchestratorInput<T>) {
        this.controls = controls;
        this.mockGenerators = [] as OrchestratorGenerators<T>;
        let overrides: MockGeneratorOverrides | undefined;
        (controls as (StandardMock | VirtualMock)[]).forEach((element) => {
            if (element[2] instanceof HTMLDivElement) {
                if (!overrides) {
                    overrides = element[4] ?? { metadata: new MetadataDB() }
                }
                (this.mockGenerators as any[]).push(
                    new ComponentFrameworkMockGenerator(
                        element[0],
                        element[1],
                        element[2],
                        element[3] as IOutputOnly,
                        overrides));
            } else {
                if (!overrides) {
                    overrides = element[3] ?? { metadata: new MetadataDB() }
                }
                (this.mockGenerators as any[]).push(
                    new ComponentFrameworkMockGeneratorReact(
                        element[0] as VirtualMock[0],
                        element[1],
                        element[2],
                        overrides));
            }
        });
    }

    controls: OrchestratorInput<T>;

    mockGenerators: OrchestratorGenerators<T>;

    ExecuteInit(){
        (this.mockGenerators as MockGenerator<IInputs,IOutputs>[]).forEach(mockGenerator=>{
            mockGenerator.ExecuteInit();
        });
    }
}
