import { it, expect, describe, beforeEach } from '@jest/globals';
import { EventsBagMock } from '../src';

describe('EventsBagMock', () => {
    it('warns when raising unconfigured event without args', ()=>{
        const eventsBag = new EventsBagMock();
        eventsBag.Test();
        expect(eventsBag.Test.calledOnce);
    })

    it('warns when raising unconfigured event with args', ()=>{
        const eventsBag = new EventsBagMock();
        eventsBag.Test('myEventArgs');
        expect(eventsBag.Test.calledOnce);
    })

    it('can mock event',()=>{
        const eventsBag = new EventsBagMock();
        eventsBag.Test.callsFake((a,b)=>{
            console.log(a,b);
        });
          eventsBag.Test('myEventArgs', 'and more args');
        expect(eventsBag.Test.calledOnce);
    })
});