/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { ShkoOnline } from '../../ShkoOnline';
import { AttributeType } from './AttributeType';
import { PropertyMock } from './Property.mock';
import { OptionMetadataMock, OptionSetMetadataMock } from '../Metadata';
import { MetadataDB } from '../../ComponentFramework-Mock-Generator';

export class OptionSetPropertyMock extends PropertyMock implements ComponentFramework.PropertyTypes.OptionSetProperty {
    raw: number | null;
    attributes: OptionSetMetadataMock;

    constructor(propertyName: string, db: MetadataDB, entityMetadata: ShkoOnline.EntityMetadata) {
        super(db, entityMetadata.LogicalName, propertyName);
        this.raw = null;
        this.attributes = new OptionSetMetadataMock();
        this._Refresh.callsFake(() => {
            const { value, attributeMetadata } = this._db.GetValueAndMetadata<ShkoOnline.PickListAttributeMetadata>(
                this._boundTable,
                this._boundColumn,
                this._boundRow,
            );
            if (attributeMetadata === null || attributeMetadata.AttributeType !== AttributeType.Picklist) {
                throw new Error('Type Error');
            }
            this.attributes.LogicalName = attributeMetadata.LogicalName;
            this.attributes.Options = Object.getOwnPropertyNames(attributeMetadata.OptionSet.Options).map((value) => {
                const metadata = attributeMetadata.OptionSet.Options[value];
                return new OptionMetadataMock(metadata.Value, metadata.Label, metadata.Color);
            });
            this.attributes.DefaultValue = attributeMetadata.DefaultFormValue;
            this.raw = value;
        });
        const attribute = {
            AttributeType: AttributeType.Picklist,
            EntityLogicalName: entityMetadata.LogicalName,
            LogicalName: propertyName,
        } as ShkoOnline.PickListAttributeMetadata;
        entityMetadata.Attributes?.push(attribute);
    }
}
