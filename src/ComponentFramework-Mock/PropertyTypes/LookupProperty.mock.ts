/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { ShkoOnline } from '../../ShkoOnline';

import { stub } from 'sinon';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';
import { LookupMetadataMock } from '../Metadata';
import { PropertyMock } from './Property.mock';
import { AttributeType } from './AttributeType';

export class LookupPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.LookupProperty {
    _SetValue: SinonStub<[value: ComponentFramework.LookupValue | null], void>;
    attributes?: LookupMetadataMock;
    raw: ComponentFramework.LookupValue[];
    getTargetEntityType: SinonStub<[], string>;
    getViewId: SinonStub<[], string>;
    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(db, entityMetadata.LogicalName, propertyName);
        this.raw = [];
        this._SetValue = stub();
        this._SetValue.callsFake((value) => {
            this._db.UpdateValue<ComponentFramework.LookupValue | null>(
                value,
                this._boundTable,
                this._boundColumn,
                this._boundRow,
            );
        });
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<
                ShkoOnline.LookupAttributeMetadata,
                ComponentFramework.LookupValue
            >(this._boundTable, this._boundColumn, this._boundRow);
            if (attributeMetadata.AttributeType !== AttributeType.Lookup) {
                throw new Error('Type Error');
            }
            this.attributes = new LookupMetadataMock();
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.Targets = attributeMetadata.Targets;
            if (value) {
                this.raw = [value];
                this.formatted = value.name;
            } else {
                this.raw = [];
                this.formatted = '';
            }
        });
        const attribute = {
            AttributeType: AttributeType.Lookup,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.LookupAttributeMetadata;
        entityMetadata.Attributes?.push(attribute);

        this.getTargetEntityType = stub();
        this.getTargetEntityType.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<
                ShkoOnline.LookupAttributeMetadata,
                ComponentFramework.LookupValue
            >(this._boundTable, this._boundColumn, this._boundRow);
            if (attributeMetadata.AttributeType !== AttributeType.Lookup) {
                throw new Error('Type Error');
            }
            return attributeMetadata.Targets?.[0] || value?.entityType;
        });
        this.getViewId = stub();
        this.getViewId.returns('00000000-0000-0000-0000-000000000000');
    }
}
