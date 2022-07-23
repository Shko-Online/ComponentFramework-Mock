import * as sinon from 'sinon';
import { ComponentFrameworkMockGenerator } from '@albanian-xrm/componentframework-mock/ComponentFramework-Mock-Generator';
import { TestComponentBoolean } from '@albanian-xrm/test-components/TestComponentBoolean/TestComponentBoolean';
import { TwoOptionsPropertyMock } from '@albanian-xrm/componentframework-mock/ComponentFramework-Mock/PropertyTypes/TwoOptionsProperty.mock';

describe("dumb test", () => {
    it("should work", () => {
        const mockGenerator = new ComponentFrameworkMockGenerator(TestComponentBoolean, {
            turnedOn: TwoOptionsPropertyMock
        });
        mockGenerator.ExecuteInit();
        sinon.assert.calledOnce(mockGenerator.control.init);
        sinon.assert.called(mockGenerator.notifyOutputChanged);
    })
});
