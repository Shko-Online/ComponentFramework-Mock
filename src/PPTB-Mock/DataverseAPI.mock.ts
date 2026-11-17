/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import type { MetadataStore } from '../ComponentFramework-Mock-Generator/Metadata.db/MetadataStore';
import type {
    DataverseWebApiOptions,
    WebApiCollection,
} from '../ComponentFramework-Mock-Generator/Metadata.db/Api/DataverseWebApi';
import type { WebApiEntity, WebApiMetadata } from '../ComponentFramework-Mock-Generator/Metadata.db/Wire';

import { stub } from 'sinon';
import {
    DataverseWebApi,
    getDataverseErrorCode,
} from '../ComponentFramework-Mock-Generator/Metadata.db/Api/DataverseWebApi';
import { DEFAULT_LANGUAGE_CODE } from '../ComponentFramework-Mock-Generator/Metadata.db/Wire';

const GUID = /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i;

/**
 * Selects the connection of a multi-connection tool: `'primary'` (slot 0), `'secondary'` (slot 1)
 * or a zero-based slot index.
 */
export type PptbConnectionTarget = 'primary' | 'secondary' | number;

type Headers = Record<string, string>;
type Row = Record<string, unknown>;

export interface PptbFetchXmlResult {
    value: Row[];
}

/** A table definition. `MetadataId` and `LogicalName` are typed as always present, like in the ToolBox typings */
export interface PptbEntityMetadata extends WebApiMetadata {
    MetadataId: string;
    LogicalName: string;
}

/** A Web API complex type, with its `@odata.type` annotation */
export interface PptbODataTyped<TODataType extends string> {
    '@odata.type': TODataType;
}

export interface PptbLocalizedLabel extends PptbODataTyped<'Microsoft.Dynamics.CRM.LocalizedLabel'> {
    Label: string;
    LanguageCode: number;
    IsManaged: boolean;
}

export interface PptbLabel extends PptbODataTyped<'Microsoft.Dynamics.CRM.Label'> {
    LocalizedLabels: PptbLocalizedLabel[];
    UserLocalizedLabel: PptbLocalizedLabel;
}

/** The operations that need a Dataverse environment the mock doesn't have, e.g. `execute` or `deploySolution` */
export const PPTB_UNSUPPORTED_METHODS = [
    'execute',
    'executeBatch',
    'executeTransaction',
    'associate',
    'disassociate',
    'deploySolution',
    'getImportJobStatus',
    'getCSDLDocument',
    'createEntityDefinition',
    'updateEntityDefinition',
    'deleteEntityDefinition',
    'createAttribute',
    'updateAttribute',
    'deleteAttribute',
    'createPolymorphicLookupAttribute',
    'createRelationship',
    'updateRelationship',
    'deleteRelationship',
    'createGlobalOptionSet',
    'updateGlobalOptionSet',
    'deleteGlobalOptionSet',
    'insertOptionValue',
    'updateOptionValue',
    'deleteOptionValue',
    'orderOption',
] as const;

export type PptbUnsupportedMethod = (typeof PPTB_UNSUPPORTED_METHODS)[number];

/**
 * Converts an error raised by the store to the error rejected by the Power Platform ToolBox `dataverseAPI`:
 * an `Error` whose message is `<code>: <message>`, e.g. `0x80040217: Could not find record ...`.
 * Errors that are already an `Error` (the validations done before sending a request) are returned as they are.
 */
export const toPptbError = (error: unknown): Error => {
    if (error instanceof Error) {
        return error;
    }
    const code = `0x${(getDataverseErrorCode(error) >>> 0).toString(16).padStart(8, '0')}`;
    const message =
        error && typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : String(error);
    return new Error(`${code}: ${message}`);
};

/** Removes the annotations, which the Web API returns only when they are requested */
const withoutAnnotations = (entity: WebApiEntity) => {
    const result: Row = {};
    Object.keys(entity).forEach((key) => {
        if (key.indexOf('@') === -1) {
            result[key] = entity[key];
        }
    });
    return result;
};

/**
 * Mock of the Power Platform ToolBox `window.dataverseAPI`, backed by in-memory {@link MetadataStore}s.
 * Use it to test Power Platform ToolBox tools.
 *
 * - Pass one store, or one store per connection slot for multi-connection tools (`'secondary'` is slot 1).
 * - Every operation runs after `_Delay` milliseconds. Failures reject with an `Error` whose message
 *   is `<code>: <message>`, like the ToolBox does.
 * - The operations that need a real environment ({@link PPTB_UNSUPPORTED_METHODS}) reject until they are stubbed.
 * - All methods are sinon stubs, so they can be inspected or overridden.
 *
 * @example
 * const dataverseAPI = new PptbDataverseApiMock(store);
 * Object.assign(window, { dataverseAPI });
 */
export class PptbDataverseApiMock {
    _Delay = 200;

    create: SinonStub<
        [entityLogicalName: string, record: Row, connectionTarget?: PptbConnectionTarget, additionalHeaders?: Headers],
        Promise<{ id: string }>
    >;
    retrieve: SinonStub<
        [
            entityLogicalName: string,
            id: string,
            columns?: string[],
            connectionTarget?: PptbConnectionTarget,
            additionalHeaders?: Headers,
        ],
        Promise<Row>
    >;
    update: SinonStub<
        [
            entityLogicalName: string,
            id: string,
            record: Row,
            connectionTarget?: PptbConnectionTarget,
            additionalHeaders?: Headers,
        ],
        Promise<void>
    >;
    delete: SinonStub<
        [entityLogicalName: string, id: string, connectionTarget?: PptbConnectionTarget, additionalHeaders?: Headers],
        Promise<void>
    >;
    fetchXmlQuery: SinonStub<
        [fetchXml: string, connectionTarget?: PptbConnectionTarget, additionalHeaders?: Headers],
        Promise<PptbFetchXmlResult>
    >;
    /** Alias of {@link fetchXmlQuery}: it calls the `fetchXmlQuery` stub */
    retrieveMultiple: SinonStub<
        [fetchXml: string, connectionTarget?: PptbConnectionTarget, additionalHeaders?: Headers],
        Promise<PptbFetchXmlResult>
    >;
    /** Supports `<entityset>`, `<entityset>(<id>)` and `EntityDefinitions` paths */
    queryData: SinonStub<
        [odataQuery: string, connectionTarget?: PptbConnectionTarget, additionalHeaders?: Headers],
        Promise<{ value: Row[] }>
    >;
    createMultiple: SinonStub<
        [
            entityLogicalName: string,
            records: Row[],
            connectionTarget?: PptbConnectionTarget,
            additionalHeaders?: Headers,
        ],
        Promise<string[]>
    >;
    updateMultiple: SinonStub<
        [
            entityLogicalName: string,
            records: Row[],
            connectionTarget?: PptbConnectionTarget,
            additionalHeaders?: Headers,
        ],
        Promise<void>
    >;
    getEntityMetadata: SinonStub<
        [
            entityLogicalName: string,
            searchByLogicalName: boolean,
            entityProperties?: string[],
            connectionTarget?: PptbConnectionTarget,
            additionalHeaders?: Headers,
        ],
        Promise<PptbEntityMetadata>
    >;
    getAllEntitiesMetadata: SinonStub<
        [entityProperties?: string[], connectionTarget?: PptbConnectionTarget, additionalHeaders?: Headers],
        Promise<{ value: PptbEntityMetadata[] }>
    >;
    /** Supports the `Attributes` paths */
    getEntityRelatedMetadata: SinonStub<
        [
            entityLogicalName: string,
            relatedPath: string,
            relatedProperties?: string[],
            connectionTarget?: PptbConnectionTarget,
            additionalHeaders?: Headers,
        ],
        Promise<any>
    >;
    /** Queries the `solution` table, which must be in the store */
    getSolutions: SinonStub<
        [selectColumns: string[], connectionTarget?: PptbConnectionTarget, additionalHeaders?: Headers],
        Promise<{ value: Row[] }>
    >;
    /** Does nothing: the store has no unpublished customizations */
    publishCustomizations: SinonStub<
        [tableLogicalName?: string, connectionTarget?: PptbConnectionTarget, additionalHeaders?: Headers],
        Promise<void>
    >;
    /** Uses the entity set name of the primary store, `<logical name>s` for tables missing from it */
    getEntitySetName: SinonStub<[entityLogicalName: string], Promise<string>>;
    buildLabel: SinonStub<[text: string, languageCode?: number], PptbLabel>;
    getAttributeODataType: SinonStub<[attributeType: string], string>;

    execute: SinonStub<any[], Promise<any>>;
    executeBatch: SinonStub<any[], Promise<any>>;
    executeTransaction: SinonStub<any[], Promise<any>>;
    associate: SinonStub<any[], Promise<any>>;
    disassociate: SinonStub<any[], Promise<any>>;
    deploySolution: SinonStub<any[], Promise<any>>;
    getImportJobStatus: SinonStub<any[], Promise<any>>;
    getCSDLDocument: SinonStub<any[], Promise<any>>;
    createEntityDefinition: SinonStub<any[], Promise<any>>;
    updateEntityDefinition: SinonStub<any[], Promise<any>>;
    deleteEntityDefinition: SinonStub<any[], Promise<any>>;
    createAttribute: SinonStub<any[], Promise<any>>;
    updateAttribute: SinonStub<any[], Promise<any>>;
    deleteAttribute: SinonStub<any[], Promise<any>>;
    createPolymorphicLookupAttribute: SinonStub<any[], Promise<any>>;
    createRelationship: SinonStub<any[], Promise<any>>;
    updateRelationship: SinonStub<any[], Promise<any>>;
    deleteRelationship: SinonStub<any[], Promise<any>>;
    createGlobalOptionSet: SinonStub<any[], Promise<any>>;
    updateGlobalOptionSet: SinonStub<any[], Promise<any>>;
    deleteGlobalOptionSet: SinonStub<any[], Promise<any>>;
    insertOptionValue: SinonStub<any[], Promise<any>>;
    updateOptionValue: SinonStub<any[], Promise<any>>;
    deleteOptionValue: SinonStub<any[], Promise<any>>;
    orderOption: SinonStub<any[], Promise<any>>;

    /**
     * @param stores The store of each connection slot: `stores[0]` is the primary connection, `stores[1]` the secondary one
     */
    constructor(stores: MetadataStore | MetadataStore[], options?: DataverseWebApiOptions) {
        const apis = (Array.isArray(stores) ? stores : [stores]).map((store) => new DataverseWebApi(store, options));

        const getApi = (target: PptbConnectionTarget = 'primary') => {
            const slot = target === 'primary' ? 0 : target === 'secondary' ? 1 : target;
            const api = apis[slot];
            if (!api) {
                throw new Error(`No connection is available for the connection target '${target}'.`);
            }
            return api;
        };

        const run = <T>(target: PptbConnectionTarget | undefined, operation: (api: DataverseWebApi) => T) =>
            new Promise<T>((resolve, reject) => {
                setTimeout(() => {
                    try {
                        resolve(operation(getApi(target)));
                    } catch (e) {
                        reject(toPptbError(e));
                    }
                }, this._Delay);
            });

        const requireRecords = (records: Row[]) => {
            if (!records || records.length === 0) {
                throw new Error('records must contain at least one record');
            }
            const missingType = records.filter((record) => !record['@odata.type']).length;
            if (missingType > 0) {
                throw new Error(`${missingType} of ${records.length} record(s) are missing the "@odata.type" property`);
            }
        };

        this.create = stub();
        this.create.callsFake((entityLogicalName, record, connectionTarget) =>
            run(connectionTarget, (api) => ({ id: api.createRecord(entityLogicalName, record).id })),
        );

        this.retrieve = stub();
        this.retrieve.callsFake((entityLogicalName, id, columns, connectionTarget) =>
            run(connectionTarget, (api) =>
                withoutAnnotations(
                    api.retrieveRecord(
                        entityLogicalName,
                        // The id is put in the URL, so alternate keys such as accountnumber='A1' work too
                        GUID.test(id) ? id : api.findRecordIdByAlternateKey(entityLogicalName, id),
                        columns && columns.length > 0 ? `?$select=${columns.join(',')}` : undefined,
                    ),
                ),
            ),
        );

        this.update = stub();
        this.update.callsFake((entityLogicalName, id, record, connectionTarget) =>
            run(connectionTarget, (api) => {
                api.updateRecord(entityLogicalName, id, record);
            }),
        );

        this.delete = stub();
        this.delete.callsFake((entityLogicalName, id, connectionTarget) =>
            run(connectionTarget, (api) => {
                api.deleteRecord(entityLogicalName, id);
            }),
        );

        this.fetchXmlQuery = stub();
        this.fetchXmlQuery.callsFake((fetchXml, connectionTarget) =>
            run(connectionTarget, (api) => ({ value: api.retrieveMultipleRecordsUsingFetchXml(fetchXml).entities })),
        );

        this.retrieveMultiple = stub();
        this.retrieveMultiple.callsFake((fetchXml, connectionTarget, additionalHeaders) =>
            this.fetchXmlQuery(fetchXml, connectionTarget, additionalHeaders),
        );

        this.queryData = stub();
        this.queryData.callsFake((odataQuery, connectionTarget) =>
            run(connectionTarget, (api) => {
                if (!odataQuery || !odataQuery.trim()) {
                    throw new Error('odataQuery cannot be empty');
                }
                return api.get(odataQuery.trim().replace(/^\?/, '')) as { value: Row[] };
            }),
        );

        this.createMultiple = stub();
        this.createMultiple.callsFake((entityLogicalName, records, connectionTarget) =>
            run(connectionTarget, (api) => {
                requireRecords(records);
                // CreateMultiple is atomic: remove the rows already created when one fails
                const ids: string[] = [];
                try {
                    records.forEach((record) => ids.push(api.createRecord(entityLogicalName, record).id));
                } catch (e) {
                    ids.forEach((id) => api.deleteRecord(entityLogicalName, id));
                    throw e;
                }
                return ids;
            }),
        );

        this.updateMultiple = stub();
        this.updateMultiple.callsFake((entityLogicalName, records, connectionTarget) =>
            run(connectionTarget, (api) => {
                requireRecords(records);
                const primaryKey = api.getEntityDefinition(entityLogicalName, true, ['PrimaryIdAttribute'])[
                    'PrimaryIdAttribute'
                ] as string;
                const missingKey = records.filter((record) => !record[primaryKey]).length;
                if (missingKey > 0) {
                    throw new Error(
                        `${missingKey} of ${records.length} record(s) are missing the '${primaryKey}' property`,
                    );
                }
                // UpdateMultiple is atomic: check that every row exists before updating any
                records.forEach((record) =>
                    api.retrieveRecord(entityLogicalName, record[primaryKey] as string, `?$select=${primaryKey}`),
                );
                records.forEach((record) => {
                    const { [primaryKey]: id, ...data } = record;
                    api.updateRecord(entityLogicalName, id as string, data);
                });
            }),
        );

        this.getEntityMetadata = stub();
        this.getEntityMetadata.callsFake((entityLogicalName, searchByLogicalName, entityProperties, connectionTarget) =>
            run(
                connectionTarget,
                (api) =>
                    api.getEntityDefinition(
                        entityLogicalName,
                        searchByLogicalName,
                        entityProperties,
                    ) as PptbEntityMetadata,
            ),
        );

        this.getAllEntitiesMetadata = stub();
        this.getAllEntitiesMetadata.callsFake((entityProperties, connectionTarget) =>
            run(connectionTarget, (api) => ({
                value: api.getEntityDefinitions(
                    entityProperties && entityProperties.length > 0
                        ? entityProperties
                        : ['LogicalName', 'DisplayName', 'MetadataId'],
                ) as PptbEntityMetadata[],
            })),
        );

        this.getEntityRelatedMetadata = stub();
        this.getEntityRelatedMetadata.callsFake((entityLogicalName, relatedPath, relatedProperties, connectionTarget) =>
            run(connectionTarget, (api) => api.getRelatedMetadata(entityLogicalName, relatedPath, relatedProperties)),
        );

        this.getSolutions = stub();
        this.getSolutions.callsFake((selectColumns, connectionTarget) =>
            run(connectionTarget, (api) => {
                if (!selectColumns || selectColumns.length === 0) {
                    throw new Error('selectColumns must contain at least one column');
                }
                return api.get(`solutions?$select=${selectColumns.join(',')}`) as WebApiCollection<Row>;
            }),
        );

        this.publishCustomizations = stub();
        this.publishCustomizations.callsFake((_tableLogicalName, connectionTarget) =>
            run(connectionTarget, () => undefined),
        );

        this.getEntitySetName = stub();
        this.getEntitySetName.callsFake((entityLogicalName) =>
            run('primary', (api) => {
                try {
                    return api.getEntitySetName(entityLogicalName);
                } catch {
                    return `${entityLogicalName.toLowerCase()}s`;
                }
            }),
        );

        this.buildLabel = stub();
        this.buildLabel.callsFake((text, languageCode = DEFAULT_LANGUAGE_CODE) => {
            const localizedLabel = (): PptbLocalizedLabel => ({
                '@odata.type': 'Microsoft.Dynamics.CRM.LocalizedLabel',
                Label: text,
                LanguageCode: languageCode,
                IsManaged: false,
            });
            return {
                '@odata.type': 'Microsoft.Dynamics.CRM.Label',
                LocalizedLabels: [localizedLabel()],
                UserLocalizedLabel: localizedLabel(),
            };
        });

        this.getAttributeODataType = stub();
        this.getAttributeODataType.callsFake(
            (attributeType) => `Microsoft.Dynamics.CRM.${attributeType}AttributeMetadata`,
        );

        const notSupported = (method: PptbUnsupportedMethod) => {
            const unsupported: SinonStub<any[], Promise<any>> = stub();
            unsupported.callsFake(() =>
                Promise.reject(
                    new Error(
                        `dataverseAPI.${method} is not supported by the mock. Stub it with ${method}.callsFake(...)`,
                    ),
                ),
            );
            return unsupported;
        };
        this.execute = notSupported('execute');
        this.executeBatch = notSupported('executeBatch');
        this.executeTransaction = notSupported('executeTransaction');
        this.associate = notSupported('associate');
        this.disassociate = notSupported('disassociate');
        this.deploySolution = notSupported('deploySolution');
        this.getImportJobStatus = notSupported('getImportJobStatus');
        this.getCSDLDocument = notSupported('getCSDLDocument');
        this.createEntityDefinition = notSupported('createEntityDefinition');
        this.updateEntityDefinition = notSupported('updateEntityDefinition');
        this.deleteEntityDefinition = notSupported('deleteEntityDefinition');
        this.createAttribute = notSupported('createAttribute');
        this.updateAttribute = notSupported('updateAttribute');
        this.deleteAttribute = notSupported('deleteAttribute');
        this.createPolymorphicLookupAttribute = notSupported('createPolymorphicLookupAttribute');
        this.createRelationship = notSupported('createRelationship');
        this.updateRelationship = notSupported('updateRelationship');
        this.deleteRelationship = notSupported('deleteRelationship');
        this.createGlobalOptionSet = notSupported('createGlobalOptionSet');
        this.updateGlobalOptionSet = notSupported('updateGlobalOptionSet');
        this.deleteGlobalOptionSet = notSupported('deleteGlobalOptionSet');
        this.insertOptionValue = notSupported('insertOptionValue');
        this.updateOptionValue = notSupported('updateOptionValue');
        this.deleteOptionValue = notSupported('deleteOptionValue');
        this.orderOption = notSupported('orderOption');
    }
}
