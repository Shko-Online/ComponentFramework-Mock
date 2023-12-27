import type { IInputs, IOutputs } from './generated/ManifestTypes';

export class ComplexControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private boundProperty: boolean;
    private inputProperty: boolean;
    private notifyOutputChanged: () => void;
    private updateCount = 0;
    private container: HTMLDivElement;
    /**
     * Empty constructor.
     */
    constructor() {}

    public async getOutputSchema(context: ComponentFramework.Context<IInputs>): Promise<Record<string, unknown>> {
        return Promise.resolve({
            outputProperty: {
                $schema: 'http://json-schema.org/draft-04/schema#',
                type: 'object',
                properties: {
                    inputProperty: {
                        type: 'boolean',
                    },
                    updateCount: {
                        type: 'number',
                    },
                },
            },
        });
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement,
    ): void {
        this.notifyOutputChanged = notifyOutputChanged;
        // Add control initialization code
        this.container = container;
        this.container.innerHTML = `Updated ${this.updateCount} ${this.updateCount === 1 ? 'time' : 'times'}`;
        this.inputProperty = context.parameters.inputProperty.raw;
        this.boundProperty = context.parameters.boundProperty.raw;
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Add control initialization code
        this.updateCount += 1;
        this.container.innerHTML = `Updated ${this.updateCount} ${this.updateCount === 1 ? 'time' : 'times'}`;
        this.boundProperty = context.parameters.boundProperty.raw;
        if (this.inputProperty !== context.parameters.inputProperty.raw) {
            this.inputProperty = context.parameters.inputProperty.raw;
            this.notifyOutputChanged();
        }
    }
    
    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        const updateCount = this.updateCount;
        const boundProperty = this.boundProperty;
        const inputProperty = this.inputProperty;
        const outputProperty = { updateCount, inputProperty };
        return { boundProperty, outputProperty };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
