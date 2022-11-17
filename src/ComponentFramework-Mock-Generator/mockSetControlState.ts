import { MockGenerator } from './MockGenerator';

export const mockSetControlState = <
    TInputs extends ShkoOnline.PropertyTypes<TInputs>,
    TOutputs extends ShkoOnline.KnownTypes<TOutputs>,
>(
    mockGenerator: MockGenerator<TInputs, TOutputs>,
) => {
    mockGenerator.context.mode.setControlState.callsFake((state: ComponentFramework.Dictionary) => {
        mockGenerator.state = { ...state, ...mockGenerator.state };
        return true;
    });
};
