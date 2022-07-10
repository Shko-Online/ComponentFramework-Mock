import * as sinon from "sinon";

export class ComponentFrameworkMockGenerator<TInputs, TOutputs> {
    private control: ComponentFramework.StandardControl<TInputs, TOutputs>;
    private context: ComponentFramework.Context<TInputs>;
    private notifyOutputChanged: () => void;
    private state: ComponentFramework.Dictionary;
    private container: HTMLDivElement;

    constructor(control: ComponentFramework.StandardControl<TInputs, TOutputs>) {
        this.control = control;
        this.notifyOutputChanged = sinon.fake(() => { });
        this.container = document.createElement("div");
    }

    ExecuteInit() {
        this.control.init(this.context, this.notifyOutputChanged, this.state, this.container);
    }
}