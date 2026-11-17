/*
    Copyright (c) 2026 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import { stub } from 'sinon';

export class EventsBagMock implements ComponentFramework.IEventBag {
    [x: string]: SinonStub<[...params: unknown[]], void>;

    private static indexedHandler: ProxyHandler<EventsBagMock> = {
        get(target, property) {
            let targetProperty = target[property as string];
            if (targetProperty === undefined) {
                targetProperty = stub();
                target[property as string] = targetProperty;
                targetProperty.callsFake((...args: unknown[]) => {
                    console.warn(`Event '${property as string}' was raised!`, args);
                });
            }
            return targetProperty;
        },
    };
    constructor() {
        return new Proxy(this, EventsBagMock.indexedHandler);
    }
}
