import { ComponentFrameworkMockGenerator } from '@albanian-xrm/componentframework-mock/ComponentFramework-Mock-Generator';
import * as sinon from 'sinon';
import { TestComponent } from '@albanian-xrm/test-components/TestComponent/TestComponent';

describe("dumb test", () => {
    it("should work",()=>{
        const testComponent = sinon.createStubInstance(TestComponent);
        const mockGenerator = new ComponentFrameworkMockGenerator(testComponent);
        mockGenerator.ExecuteInit();
        sinon.assert.calledOnce(testComponent.init);
    })
});
