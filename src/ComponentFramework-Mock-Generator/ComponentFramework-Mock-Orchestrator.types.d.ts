/*
    Copyright (c) 2024 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ComponentFrameworkMockGeneratorReact } from "./ComponentFramework-Mock-Generator-React";
import type { ComponentFrameworkMockGenerator } from "./ComponentFramework-Mock-Generator";
import type { MockGeneratorOverrides } from "./MockGenerator";
import type { PropertyMap } from "../ComponentFramework-Mock";
import type { ShkoOnline } from "../ShkoOnline";

export type OrchestratorInput<T> =
    T extends [...infer Previous, infer TInputs, infer TOutputs, infer Virtual] ? (
        0 extends 1 & Virtual ? never : (
            [] extends Previous ? (
                Virtual extends boolean ? (
                    TInputs extends { [key: string]: any } ? (
                        TInputs extends ShkoOnline.PropertyTypes<TInputs> ? (
                            TOutputs extends ShkoOnline.KnownTypes<TOutputs> ? (
                                Virtual extends false ?
                                [[
                                    control: new () => ComponentFramework.StandardControl<TInputs, TOutputs>,
                                    inputs: PropertyMap<TInputs>,
                                    container?: HTMLDivElement,
                                    outputs?: ShkoOnline.OutputOnlyTypes<{}, TOutputs>,
                                    overrides?: MockGeneratorOverrides
                                ]] :
                                Virtual extends true ?
                                [[
                                    control: new () => ComponentFramework.ReactControl<TInputs, TOutputs>,
                                    inputs: PropertyMap<TInputs>,
                                    outputs?: ShkoOnline.OutputOnlyTypes<{}, TOutputs>,
                                    overrides?: MockGeneratorOverrides
                                ]] :
                                never
                            ) : never
                        ) : never
                    ) : never
                ) : never
            ) :
            Previous extends [...infer Previous2, infer TInputs2, infer TOutputs2, infer Virtual2] ? (
                TInputs extends { [key: string]: any } ? (
                    TInputs extends ShkoOnline.PropertyTypes<TInputs> ? (
                        TOutputs extends ShkoOnline.KnownTypes<TOutputs> ? (
                            Virtual extends false ?
                            [...OrchestratorInput<Previous>, [
                                control: new () => ComponentFramework.StandardControl<TInputs, TOutputs>,
                                inputs: PropertyMap<TInputs>,
                                container?: HTMLDivElement,
                                outputs?: ShkoOnline.OutputOnlyTypes<{}, TOutputs>
                            ]] :
                            Virtual extends true ?
                            [...OrchestratorInput<Previous>, [
                                control: new () => ComponentFramework.ReactControl<TInputs, TOutputs>,
                                inputs: PropertyMap<TInputs>,
                                outputs?: ShkoOnline.OutputOnlyTypes<{}, TOutputs>
                            ]] :
                            never
                        ) : never
                    ) : never
                ) : never
            ) : never
        )
    ) : never;

export type OrchestratorGenerators<T> =
    T extends [...infer Previous, infer TInputs, infer TOutputs, infer Virtual] ? (
        0 extends 1 & Virtual ?
        never : (
            [] extends Previous ? (
                Virtual extends boolean ? (
                    TInputs extends { [key: string]: any } ? (
                        TInputs extends ShkoOnline.PropertyTypes<TInputs> ? (
                            TOutputs extends ShkoOnline.KnownTypes<TOutputs> ? (
                                Virtual extends false ?
                                [ComponentFrameworkMockGenerator<TInputs, TOutputs>] :
                                Virtual extends true ?
                                [ComponentFrameworkMockGeneratorReact<TInputs, TOutputs>] :
                                never
                            ) : never
                        ) : never
                    ) : never
                ) : never
            ) :
            Previous extends [...infer Previous2, infer TInputs2, infer TOutputs2, infer Virtual2] ? (
                TInputs extends { [key: string]: any } ? (
                    TInputs extends ShkoOnline.PropertyTypes<TInputs> ? (
                        TOutputs extends ShkoOnline.KnownTypes<TOutputs> ? (
                            Virtual extends false ?
                            [...OrchestratorGenerators<Previous>, ComponentFrameworkMockGenerator<TInputs, TOutputs>] :
                            Virtual extends true ?
                            [...OrchestratorGenerators<Previous>, ComponentFrameworkMockGeneratorReact<TInputs, TOutputs>] :
                            never
                        ) : never
                    ) : never
                ) : never
            ) : never
        )
    ) : never;
