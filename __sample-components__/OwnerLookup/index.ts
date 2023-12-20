/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { IInputs, IOutputs } from './generated/ManifestTypes';

export class OwnerLookup implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private notifyOutputChanged: () => void;
    private myself: ComponentFramework.LookupValue[];
    private value?: ComponentFramework.LookupValue[];
    /**
     * Empty constructor.
     */
    constructor() {}

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
        // Add control initialization code
        this.container = container;
        this.myself = [{ entityType: 'systemuser', id: context.userSettings.userId, name: 'Assigned from PCF' }];
        const name = document.createElement('p');
        this.updateName(context, name);
        container.appendChild(name);

        const button = document.createElement('button');
        button.innerHTML = 'Assign To Myself';
        button.addEventListener('click', this.assignToMyself.bind(this), false);
        container.appendChild(button);
        this.notifyOutputChanged = notifyOutputChanged;
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Add code to update control view
        const name = this.container.getElementsByTagName('p')[0];
        this.updateName(context, name);
    }

    private updateName(context: ComponentFramework.Context<IInputs>, name: HTMLParagraphElement) {
        const value = context.parameters.value.raw;
        this.value = value;
        name.innerHTML = value && value.length ? `[${value[0].entityType}-${value[0].id}] ${value[0].name}` : '---';
    }

    private assignToMyself() {
        this.value = this.myself;
        this.notifyOutputChanged();
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        const { value } = this;
        return { value };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
