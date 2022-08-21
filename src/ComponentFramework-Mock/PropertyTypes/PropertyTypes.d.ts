declare namespace ComponentFrameworkMock {
    type PropertyTypes<T extends {
        [P in keyof T]: ComponentFramework.PropertyTypes.Property }
        > = {
            [P in keyof T]:
            T[P] extends ComponentFramework.PropertyTypes.TwoOptionsProperty ?
            ComponentFramework.PropertyTypes.TwoOptionsProperty :
            T[P] extends ComponentFramework.PropertyTypes.StringProperty ?
            ComponentFramework.PropertyTypes.StringProperty :
            never
        }

    /**
       * The entire property bag interface available to control via Context Object
       */
    interface Context<TInputs extends PropertyTypes<TInputs>> {
        parameters: TInputs;
    }
}