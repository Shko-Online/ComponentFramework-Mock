/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { IInputs, IOutputs } from './generated/ManifestTypes';

export class ContainerSize implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private selection: number[];
    private sizeDiv : HTMLDivElement;

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
    
        const wrapper = document.createElement('form');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        this.sizeDiv = document.createElement('div');
        const list = document.createElement('ul');
        list.className = "ShkoOnline.OptionsList";
        context.parameters.selection.attributes?.Options.forEach(option=>{
            const listItem = document.createElement('li');
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            const tickMark = document.createElement('div');
            tickMark.className = "ShkoOnline.TickMark";
            checkbox.appendChild(tickMark);
            checkbox.type = 'checkbox';
            label.appendChild(checkbox);
            label.append(option.Label);
            listItem.appendChild(label);
            list.appendChild(listItem);
        });
        this.sizeDiv.innerHTML = `${context.mode.allocatedWidth}x${context.mode.allocatedHeight}`;
        wrapper.appendChild(this.sizeDiv);
        container.appendChild(list);
        container.appendChild(wrapper);
        context.mode.trackContainerResize(true);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.sizeDiv.innerHTML = `${context.mode.allocatedWidth}x${context.mode.allocatedHeight}`;
       
        this.selection = context.parameters.selection.raw || [];
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
