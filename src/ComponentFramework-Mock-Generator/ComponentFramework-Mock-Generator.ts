import { spy, fake, SinonSpy, SinonSpiedInstance } from "sinon";
import { ContextMock } from "@albanian-xrm/componentframework-mock/ComponentFramework-Mock/Context.mock";
import { PropertyMap } from "@albanian-xrm/componentframework-mock/ComponentFramework-Mock/PropertyTypes/PropertyMap";

export class ComponentFrameworkMockGenerator<TInputs extends ComponentFrameworkMock.PropertyTypes<TInputs>, TOutputs> {
    control: SinonSpiedInstance<ComponentFramework.StandardControl<TInputs, TOutputs>>;
    context: ComponentFramework.Context<TInputs>;
    notifyOutputChanged: SinonSpy<[], void>;
    private state: ComponentFramework.Dictionary;
    private container: HTMLDivElement;

    constructor(control: new () => ComponentFramework.StandardControl<TInputs, TOutputs>,
        inputs: PropertyMap<TInputs>,
        container?: HTMLDivElement) {
        this.control = spy(new control());
        this.context = new ContextMock(inputs);
        this.state = {};
        this.notifyOutputChanged = fake(() => {
            console.log('notifyOutputChanged')
            console.log(this.control.getOutputs?.());
        });

        this.container = container ?? document.createElement("div");
    }

    ExecuteInit() {
        this.control.init(this.context, this.notifyOutputChanged, this.state, this.container);
    }

    ExecuteUpdateView() {
        this.control.updateView(this.context);
    }
}
