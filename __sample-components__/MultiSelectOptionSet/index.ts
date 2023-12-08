/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { IInputs, IOutputs } from './generated/ManifestTypes';

export class ContainerSize implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private list: HTMLUListElement;
    private selection: number[];

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
        const wrapper = document.createElement('form');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        this.list = document.createElement('ul');
        this.list.className = 'ShkoOnline.OptionsList';
        this.selection = context.parameters.selection.raw || [];
        context.parameters.selection.attributes?.Options.forEach((option) => {
            const listItem = document.createElement('li');
            const label = document.createElement('label');
            label.className = 'ShkoOnline.Label';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = this.selection.includes(option.Value);
            checkbox.dataset['optionValue'] = '' + option.Value;
            checkbox.className = 'ShkoOnline.Checkbox';
            checkbox.onchange = () => {
                const selection = [];
                this.list.querySelectorAll('input').forEach((e: HTMLInputElement) => {
                    if (e.checked) {
                        selection.push(parseInt(e.dataset['optionValue']));
                    }
                });
                this.selection = selection;
                notifyOutputChanged();
            };
            label.appendChild(checkbox);
            label.append(option.Label);
            listItem.appendChild(label);
            this.list.appendChild(listItem);
        });
        container.appendChild(this.list);
        container.appendChild(wrapper);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.selection = context.parameters.selection.raw || [];
        this.list.querySelectorAll('input').forEach((e: HTMLInputElement) => {
            e.checked = this.selection.includes(parseInt(e.dataset['optionValue']));
        });
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs {
        const { selection } = this;
        return { selection };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
