/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { SinonStub, stub } from 'sinon';
import { AttributeType } from '../ComponentFramework-Mock';

export class AttributeMetadataGenerator {
    Attributes: ShkoOnline.AttributeMetadata[];
    AddString: SinonStub<[args: string[]], AttributeMetadataGenerator>;
    AddBoolean: SinonStub<[args: string[]], AttributeMetadataGenerator>;
    constructor(entityLogicalName: string) {
        this.Attributes = [];
        this.AddString = stub();
        this.AddString.callsFake((args) => {
            this.Attributes = this.Attributes.concat(
                args.map(
                    (logicalName) =>
                        ({
                            EntityLogicalName: entityLogicalName,
                            LogicalName: logicalName,
                            AttributeType: AttributeType.String,
                        } as ShkoOnline.StringAttributeMetadata),
                ),
            );
            return this;
        });
        this.AddBoolean = stub();
        this.AddBoolean.callsFake((args) => {
            this.Attributes = this.Attributes.concat(
                args.map(
                    (logicalName) =>
                        ({
                            EntityLogicalName: entityLogicalName,
                            LogicalName: logicalName,
                            AttributeType: AttributeType.Boolean,
                        } as ShkoOnline.BooleanAttributeMetadata),
                ),
            );
            return this;
        });
    }
}
