/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { MetadataStoreOptions } from './MetadataStore';

import { stub } from 'sinon';
import { AttributeType } from './AttributeType';
import { MetadataStore } from './MetadataStore';

export type MetadataDBOptions = MetadataStoreOptions;

/**
 * The {@link MetadataStore} used by the PCF mocks.
 * Adds the `!CanvasApp` pseudo-table used to bind the properties of a component
 * and a sinon stub to control the generated ids.
 */
export class MetadataDB extends MetadataStore {
    static readonly CanvasLogicalName = '!CanvasApp';
    /**
     * Counter used by the property mocks to generate unique column names on the `!CanvasApp` pseudo-table.
     */
    static Collisions = 0;

    /**
     * Generates the ids of new rows and metadata items. Stub it to control the generated ids.
     */
    _newId: SinonStub<[], string>;

    constructor(options?: MetadataDBOptions) {
        super(options);
        this._newId = stub();
        this._newId.callsFake(() => super.newId());
    }

    newId() {
        return this._newId();
    }

    /**
     * Initialize the in-memory database with the items passed as param.
     * Items of the `!CanvasApp` pseudo-table update its only row instead of adding new rows.
     * @param items Object as returned from the Dataverse OData API
     */
    initItems(items: { '@odata.context': string; value: any[] }) {
        const entitySetName = items['@odata.context']?.substring(items['@odata.context'].indexOf('#') + 1);
        const table = this.EntityMetadataSQL.SelectTableMetadataByEntitySet(entitySetName)[0];
        if (table?.LogicalName !== MetadataDB.CanvasLogicalName) {
            super.initItems(items);
            return;
        }

        const tableMetadata = this.getTableMetadata(MetadataDB.CanvasLogicalName);
        items.value.forEach((item) => {
            if (this.db.exec<{ Records: number }[]>('SELECT Count(1) as Records FROM _canvasapp')[0].Records > 0) {
                tableMetadata?.Attributes?.forEach((attribute) => {
                    if (attribute.LogicalName in item) {
                        this.UpdateValue(
                            item[attribute.LogicalName],
                            MetadataDB.CanvasLogicalName,
                            attribute.LogicalName,
                        );
                    }
                });
            } else {
                this.AddRow(MetadataDB.CanvasLogicalName, item, tableMetadata);
            }
        });
    }

    /**
     * Same as init items but for Pseudo-Table #!CanvasApp
     * @param items
     */
    initCanvasItems(items: any[]) {
        this.initItems({
            '@odata.context': '#' + MetadataDB.CanvasLogicalName,
            value: items,
        });
    }

    /**
     * @deprecated Use {@link GetRow} and `toWebApiEntity` from `Metadata.db/Wire`.
     * Gets a row from a table and the associated  metadata
     * @param entity The target table
     * @param id The target row
     * @returns
     */
    GetRowForAPI(entity: string, id?: string) {
        const result = this.GetRow(entity, id);
        if (result.entityMetadata?.Attributes && result.row) {
            result.entityMetadata.Attributes.filter((attr) => attr.AttributeType === AttributeType.Lookup).forEach(
                (lookupAttribute) => {
                    const key = lookupAttribute.LogicalName;
                    const lookupValue = result.row[key] as ComponentFramework.LookupValue;
                    delete result.row[key];
                    result.row[`_${key}_value`] = lookupValue;
                },
            );
        }
        return result;
    }
}
