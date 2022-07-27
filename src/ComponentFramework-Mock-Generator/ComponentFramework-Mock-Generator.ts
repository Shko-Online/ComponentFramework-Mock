import {spy, fake, SinonSpy, SinonSpiedInstance} from "sinon";
import { ContextMock } from "../ComponentFramework-Mock/Context.mock";
import { PropertyMap } from "../ComponentFramework-Mock/PropertyTypes/PropertyMap";

export class ComponentFrameworkMockGenerator<TInputs extends ComponentFramework.PropertyTypes<TInputs>, TOutputs> {
    control: SinonSpiedInstance<ComponentFramework.StandardControl<TInputs, TOutputs>>;
    context: ComponentFramework.Context<TInputs>;
    notifyOutputChanged: SinonSpy<[], void>;
    private state: ComponentFramework.Dictionary;
    private container: HTMLDivElement;

    constructor(control: new () => ComponentFramework.StandardControl<TInputs, TOutputs>,
        inputs: PropertyMap<TInputs>) {
        this.control = spy(new control());
        this.context = new ContextMock(inputs);
        this.notifyOutputChanged = fake(() => { console.log('notifyOutputChanged') });
      
        this.container = document.createElement("div");
    }

    ExecuteInit() {
        this.control.init(this.context, this.notifyOutputChanged, this.state, this.container);
    }
}
