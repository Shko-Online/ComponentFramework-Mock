import * as sinon from "sinon";
import { SinonStubbedInstance } from 'sinon';
import { ContextMock } from "../ComponentFramework-Mock/Context.mock";
import { PropertyMap } from "../ComponentFramework-Mock/PropertyTypes/PropertyTypes";

export class ComponentFrameworkMockGenerator<TInputs extends ComponentFramework.PropertyTypes<TInputs>, TOutputs> {
    control: SinonStubbedInstance<ComponentFramework.StandardControl<TInputs, TOutputs>>;
    context: SinonStubbedInstance<ComponentFramework.Context<TInputs>>;
    private notifyOutputChanged: () => void;
    private state: ComponentFramework.Dictionary;
    private container: HTMLDivElement;

    constructor(control: new () => ComponentFramework.StandardControl<TInputs, TOutputs>, 
        inputs: PropertyMap<TInputs>) {
        this.control = sinon.createStubInstance(control);
        const parameters = {} as TInputs;
        console.log(inputs);
        for(let k in inputs){
            parameters[k] = sinon.createStubInstance(inputs[k]);
        }
        this.context = sinon.createStubInstance(ContextMock, {
            parameters
        });
        this.notifyOutputChanged = sinon.fake(() => { });
        this.container = document.createElement("div");
    }

    ExecuteInit() {
        this.control.init(this.context, this.notifyOutputChanged, this.state, this.container);
    }
}
