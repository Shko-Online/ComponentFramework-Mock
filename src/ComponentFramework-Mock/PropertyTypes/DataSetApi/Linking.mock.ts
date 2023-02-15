/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { stub } from 'sinon';
import type { SinonStub }from 'sinon';

type LinkEntityExposedExpression = ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression;

export class LinkingMock implements ComponentFramework.PropertyHelper.DataSetApi.Linking {
    getLinkedEntities: SinonStub<[], LinkEntityExposedExpression[]>;
    addLinkedEntity: SinonStub<[expression: LinkEntityExposedExpression], void>;

    constructor() {
        this.addLinkedEntity = stub();
        this.getLinkedEntities = stub();
    }
}
