declare namespace ComponentFrameworkMock {
    type PropertyTypes<T extends {
        [P in keyof T]: ComponentFramework.PropertyTypes.Property }
        > = {
            [P in keyof T]:
            T[P] extends ComponentFramework.PropertyTypes.TwoOptionsProperty ?
            ComponentFramework.PropertyTypes.TwoOptionsProperty :
            T[P] extends ComponentFramework.PropertyTypes.StringProperty ?
            ComponentFramework.PropertyTypes.StringProperty :
            T[P] extends ComponentFramework.PropertyTypes.NumberProperty ?
            ComponentFramework.PropertyTypes.NumberProperty :
            T[P] extends ComponentFramework.PropertyTypes.DateTimeProperty ?
            ComponentFramework.PropertyTypes.DateTimeProperty :
            T[P] extends ComponentFramework.PropertyTypes.DecimalNumberProperty ?
            ComponentFramework.PropertyTypes.DecimalNumberProperty :
            T[P] extends ComponentFramework.PropertyTypes.WholeNumberProperty ?
            ComponentFramework.PropertyTypes.WholeNumberProperty :
            never
        }

    /**
       * The entire property bag interface available to control via Context Object
       */
    interface Context<TInputs extends PropertyTypes<TInputs>> {
        parameters: TInputs;
    }
}