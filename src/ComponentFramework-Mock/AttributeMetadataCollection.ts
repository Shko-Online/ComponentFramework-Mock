/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../ShkoOnline';

import { stub } from 'sinon';

export class AttributeMetadataCollection implements ShkoOnline.AttributeMetadataCollection {
    _attributes: ShkoOnline.AttributeMetadata[];
    add: SinonStub<[]>;
    get: SinonStub<[logicalName: string], ShkoOnline.AttributeMetadata | undefined>;
    getAll: SinonStub<[], ShkoOnline.AttributeMetadata[]>;
    getByFilter: SinonStub<[], ShkoOnline.AttributeMetadata[]>;
    getByName: SinonStub<[name: string], ShkoOnline.AttributeMetadata | undefined>;
    getByIndex: SinonStub<[index: number], ShkoOnline.AttributeMetadata | undefined>;
    getFirst: SinonStub<
        [(attribute: ShkoOnline.AttributeMetadata) => boolean],
        ShkoOnline.AttributeMetadata | undefined
    >;
    getLength: SinonStub<[], number>;
    remove: SinonStub<[]>;

    constructor(attributes: ShkoOnline.AttributeMetadata[]) {
        this._attributes = attributes;
        this.add = stub();

        this.get = stub();
        this.get.callsFake((logicalName: string) => {
            return this._attributes.find((attribute) => attribute.LogicalName === logicalName);
        });

        this.getAll = stub();
        this.getAll.callsFake(() => {
            return this._attributes;
        });

        this.getByFilter = stub();

        this.getByName = stub();
        this.getByName.callsFake((logicalName: string) => {
            return this._attributes.find((attribute) => attribute.LogicalName === logicalName);
        });

        this.getByIndex = stub();
        this.getByIndex.callsFake((index: number) => {
            return this._attributes[index];
        });

        this.getFirst = stub();
        this.getFirst.callsFake((lambda) => {
            return this._attributes.find(lambda);
        });

        this.getLength = stub();
        this.getLength.callsFake(() => {
            return this._attributes.length;
        });

        this.remove = stub();
    }
}
