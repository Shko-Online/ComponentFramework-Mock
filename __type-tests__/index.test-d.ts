import { EnumPropertyMock, MetadataDB, PropertyToMock, StringPropertyMock } from '../src';
import { expectType } from 'tsd';
import '.';

namespace Output_Number_Array_Optional_Tests {
    interface TOutput {
        selection?: number[];
    }

    let T: TOutput = {
        selection: [1],
    };

    expectType<ShkoOnline.KnownTypes<TOutput>>(T);
}

namespace Output_Number_Array_Required_Tests {
    interface TOutput {
        selection: number[];
    }

    let T = {
        selection: [1],
    };

    expectType<ShkoOnline.KnownTypes<TOutput>>(T);
}

namespace EnumPropertyMock_Tests {
    interface TInputs {
        string1: ComponentFramework.PropertyTypes.StringProperty;
        enum1: ComponentFramework.PropertyTypes.EnumProperty<'A' | 'B'>;
    }

    const B: PropertyToMock<TInputs> = {
        string1: new StringPropertyMock('string1', new MetadataDB(), { LogicalName: 'test' }),
        enum1: new EnumPropertyMock<'A' | 'B'>('enum1', new MetadataDB(), { LogicalName: 'test' }),
    };
}
