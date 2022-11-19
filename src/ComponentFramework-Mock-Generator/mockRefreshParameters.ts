import { stub } from 'sinon';
import { MockGenerator } from './MockGenerator';

export const mockRefreshParameters = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
) => { 
    mockGenerator._RefreshParameters.callsFake(() => {
        Object.getOwnPropertyNames<ShkoOnline.PropertyTypes<TInputs>>(mockGenerator.context.parameters).forEach(
            (propertyName) => {
                mockGenerator.context._parameters[propertyName]._Refresh();
            },
        );  
    });
};
