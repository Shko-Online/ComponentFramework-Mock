import { spy, fake, SinonSpy, SinonSpiedInstance } from "sinon";
import { ContextMock } from "@shko-online/componentframework-mock/ComponentFramework-Mock/Context.mock";
import { PropertyMap } from "@shko-online/componentframework-mock/ComponentFramework-Mock/PropertyTypes/PropertyMap";

export class ComponentFrameworkMockGenerator<TInputs extends ComponentFrameworkMock.PropertyTypes<TInputs>, TOutputs> {
    control: SinonSpiedInstance<ComponentFramework.StandardControl<TInputs, TOutputs>>;
    context: ContextMock<TInputs>;
    notifyOutputChanged: SinonSpy<[], void>;
    state: ComponentFramework.Dictionary;
    private container: HTMLDivElement;

    constructor(control: new () => ComponentFramework.StandardControl<TInputs, TOutputs>,
        inputs: PropertyMap<TInputs>,
        container?: HTMLDivElement) {

        this.control = spy(new control());
        this.context = new ContextMock(inputs);
        this.context.mode.setControlState.callsFake((state: ComponentFramework.Dictionary) => {
            this.state = { ...state, ...this.state };
            return true;
        });
        this.notifyOutputChanged = fake(() => {
            console.log('notifyOutputChanged')
            console.log(this.control.getOutputs?.());
        });

        this.container = container ?? document.createElement("div");
    }

    ExecuteInit() {
        const state = this.state === undefined ? this.state : { ...this.state };
        this.control.init(this.context, this.notifyOutputChanged, state, this.container);
    }

    ExecuteUpdateView() {
        this.control.updateView(this.context);
    }
}
