/// <reference types="powerapps-component-framework" />
declare namespace ComponentFramework {
    type PropertyTypes<T extends {
        [P in keyof T]: PropertyTypes.Property }
        > = {
            [P in keyof T]:
            T[P] extends PropertyTypes.TwoOptionsProperty ?
            PropertyTypes.TwoOptionsProperty :
            T[P] extends PropertyTypes.StringProperty ?
            PropertyTypes.StringProperty :
            never
        }

    /**
       * The entire property bag interface available to control via Context Object
       */
    interface Context<TInputs extends PropertyTypes<TInputs>> {
        parameters: TInputs;
    }
}