/*
    Copyright (c) 2024 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { PropertyMap } from '../ComponentFramework-Mock';
import type { ShkoOnline } from '../ShkoOnline';
import { ComponentFrameworkMockGenerator } from './ComponentFramework-Mock-Generator';
import { ComponentFrameworkMockGeneratorReact } from './ComponentFramework-Mock-Generator-React';
import type { OrchestratorGenerators, OrchestratorInput } from './ComponentFramework-Mock-Orchestrator.types';

export class ComponentFrameworkMockOrchestrator<T> {
    constructor(controls: OrchestratorInput<T>) {
        this.controls = controls;
        this.mockGenerators = [] as OrchestratorGenerators<T>;
            (controls as ([
                control: new () => ComponentFramework.StandardControl<{ [key: string]: any }, { [key: string]: any }>,
                inputs: PropertyMap<{ [key: string]: any }>,
                container?: HTMLDivElement,
                outputs?: ShkoOnline.OutputOnlyTypes<{}, { [key: string]: any }>
            ]|[
                control: new () => ComponentFramework.ReactControl<{ [key: string]: any }, { [key: string]: any }>,
                inputs: PropertyMap<{ [key: string]: any }>,
                outputs?: ShkoOnline.OutputOnlyTypes<{}, { [key: string]: any }>
            ])[]).forEach((element) => {
            
            if(element[2] instanceof HTMLDivElement){
                (this.mockGenerators as any[]).push(new ComponentFrameworkMockGenerator(element[0], element[1], element[2], element[3]));
            }else {
                (this.mockGenerators as any[]).push(new ComponentFrameworkMockGeneratorReact(element[0] as new () => ComponentFramework.ReactControl<{ [key: string]: any }, { [key: string]: any }>, element[1], element[2]));
            }
        });
    }

    controls: OrchestratorInput<T>;

    mockGenerators: OrchestratorGenerators<T>;
}
