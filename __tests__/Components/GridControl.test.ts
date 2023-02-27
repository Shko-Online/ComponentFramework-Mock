/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach } from '@jest/globals';
import { ComponentFrameworkMockGenerator, DataSetMock } from '../../src';
import { GridControl } from '../../__sample-components__/GridControl';
import { IInputs, IOutputs } from '../../__sample-components__/GridControl/generated/ManifestTypes';

describe('GridControl', () => {
    let mockGenerator: ComponentFrameworkMockGenerator<IInputs, IOutputs>;
    beforeEach(() => {
        const container = document.createElement('div');
        mockGenerator = new ComponentFrameworkMockGenerator(
            GridControl,
            {
                records: DataSetMock,
            },
            container,
        );
        mockGenerator.context._parameters.records._InitItems([
            {
                name: 'Betim',
                surname: 'Beja',
            },
        ]);
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.innerHTML = null;
    });

    it('Should render count', (done) => {
        mockGenerator.context._parameters.records._onLoaded.callsFake(() => {
            expect(mockGenerator.container).toMatchSnapshot();
            done();
        });
        mockGenerator.ExecuteInit();
        mockGenerator.ExecuteUpdateView();
    });
});
