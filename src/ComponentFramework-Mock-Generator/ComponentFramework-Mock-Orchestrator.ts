import type { OrchestratorInput } from "./ComponentFramework-Mock-Orchestrator.types";

export class ComponentFrameworkMockOrchestrator<T> {
    constructor(controls: OrchestratorInput<T>) {
        this.controls = controls;
    }

    controls: OrchestratorInput<T>;
}