/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { it, expect, describe, beforeEach, jest, afterEach } from '@jest/globals';
import { AttributeType, DataverseMetadata, DataverseWebApi, getDataverseErrorCode, MetadataStore } from '../src';

const CONTACT_ID = '00000000-0000-0000-0000-000000000001';
const ACCOUNT_ID = '00000000-0000-0000-0000-000000000002';
const KEY_ID = '00000000-0000-0000-0000-00000000c001';
const RELATIONSHIP_ID = '00000000-0000-0000-0000-00000000d001';

const createStore = () => {
    let i = 0;
    const store = new MetadataStore({ newId: () => `00000000-0000-0000-0001-${String(++i).padStart(12, '0')}` });
    store.initMetadata([
        {
            LogicalName: 'account',
            EntitySetName: 'accounts',
            PrimaryIdAttribute: 'accountid',
            PrimaryNameAttribute: 'name',
            Attributes: [
                { LogicalName: 'accountid', AttributeType: AttributeType.Uniqueidentifier },
                { LogicalName: 'name', AttributeType: AttributeType.String },
                { LogicalName: 'accountnumber', AttributeType: AttributeType.String },
                { LogicalName: 'primarycontactid', AttributeType: AttributeType.Lookup },
            ],
            Keys: [
                {
                    MetadataId: KEY_ID,
                    LogicalName: 'accountnumber_key',
                    SchemaName: 'AccountNumber_Key',
                    DisplayName: 'Account Number',
                    KeyAttributes: ['accountnumber'],
                },
                { LogicalName: 'name_contact_key', KeyAttributes: ['name', 'primarycontactid'] },
            ],
            Privileges: [
                {
                    Name: 'prvReadAccount',
                    PrivilegeId: '00000000-0000-0000-0000-00000000e002',
                    PrivilegeType: 2,
                    CanBeBasic: true,
                    CanBeDeep: true,
                    CanBeGlobal: true,
                    CanBeLocal: true,
                    CanBeEntityReference: false,
                    CanBeParentEntityReference: false,
                },
                {
                    Name: 'prvCreateAccount',
                    PrivilegeId: '00000000-0000-0000-0000-00000000e001',
                    PrivilegeType: 1,
                    CanBeBasic: true,
                    CanBeDeep: true,
                    CanBeGlobal: true,
                    CanBeLocal: true,
                    CanBeEntityReference: false,
                    CanBeParentEntityReference: false,
                },
            ],
            ManyToOneRelationships: [
                {
                    MetadataId: RELATIONSHIP_ID,
                    SchemaName: 'account_primary_contact',
                    ReferencedEntity: 'contact',
                    ReferencingAttribute: 'primarycontactid',
                    ReferencedEntityNavigationPropertyName: 'account_primary_contact',
                    ReferencingEntityNavigationPropertyName: 'primarycontactid',
                    CascadeConfiguration: { Delete: 4, Assign: 'NoCascade' },
                    SecurityTypes: 1,
                },
            ],
            ManyToManyRelationships: [
                {
                    SchemaName: 'accountleads_association',
                    Entity2LogicalName: 'lead',
                    IntersectEntityName: 'accountleads',
                    Entity1IntersectAttribute: 'accountid',
                    Entity2IntersectAttribute: 'leadid',
                },
            ],
        },
        {
            LogicalName: 'contact',
            EntitySetName: 'contacts',
            PrimaryIdAttribute: 'contactid',
            PrimaryNameAttribute: 'fullname',
            Attributes: [
                { LogicalName: 'contactid', AttributeType: AttributeType.Uniqueidentifier },
                { LogicalName: 'fullname', AttributeType: AttributeType.String },
            ],
        },
    ] as unknown as DataverseMetadata.EntityMetadata[]);
    store.AddRow('contact', { contactid: CONTACT_ID, fullname: 'Jane Doe' });
    store.AddRow('account', {
        accountid: ACCOUNT_ID,
        name: "O'Neil Ltd",
        accountnumber: 'A1',
        'primarycontactid@odata.bind': `/contacts(${CONTACT_ID})`,
    });
    return store;
};

describe('Keys, relationships and privileges', () => {
    let store: MetadataStore;
    let api: DataverseWebApi;

    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        store = createStore();
        api = new DataverseWebApi(store);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('MetadataStore', () => {
        it('Should store keys and privileges with the table', () => {
            const account = store.getTableMetadata('account') as DataverseMetadata.EntityMetadata;
            expect(account.Keys).toEqual([
                {
                    MetadataId: KEY_ID,
                    LogicalName: 'accountnumber_key',
                    SchemaName: 'AccountNumber_Key',
                    DisplayName: 'Account Number',
                    EntityLogicalName: 'account',
                    KeyAttributes: ['accountnumber'],
                },
                expect.objectContaining({ LogicalName: 'name_contact_key', MetadataId: expect.any(String) }),
            ]);
            expect(account.Privileges?.map((privilege) => privilege.Name)).toEqual([
                'prvCreateAccount',
                'prvReadAccount',
            ]);
        });

        it('Should return the relationships from both tables', () => {
            const account = store.getTableMetadata('account') as DataverseMetadata.EntityMetadata;
            const contact = store.getTableMetadata('contact') as DataverseMetadata.EntityMetadata;
            expect(account.ManyToOneRelationships).toEqual([
                expect.objectContaining({
                    SchemaName: 'account_primary_contact',
                    RelationshipType: 'OneToManyRelationship',
                    ReferencedEntity: 'contact',
                    // defaults to the primary key of the referenced table
                    ReferencedAttribute: 'contactid',
                    ReferencingEntity: 'account',
                }),
            ]);
            expect(contact.OneToManyRelationships).toEqual(account.ManyToOneRelationships);
            expect(contact).not.toHaveProperty('ManyToOneRelationships');
            expect(account.ManyToManyRelationships).toEqual([
                expect.objectContaining({
                    SchemaName: 'accountleads_association',
                    RelationshipType: 'ManyToManyRelationship',
                    Entity1LogicalName: 'account',
                    Entity2LogicalName: 'lead',
                }),
            ]);
            expect(store.getAllRelationshipMetadata().map((relationship) => relationship.SchemaName)).toEqual([
                'account_primary_contact',
                'accountleads_association',
            ]);
        });

        it('Should replace the items with the same name', () => {
            store.upsertKeyMetadata('account', { LogicalName: 'accountnumber_key', KeyAttributes: ['name'] });
            store.upsertRelationshipMetadata({
                SchemaName: 'account_primary_contact',
                ReferencedEntity: 'contact',
                ReferencingEntity: 'account',
                ReferencingAttribute: 'primarycontactid',
                IsCustomRelationship: true,
            });
            const account = store.getTableMetadata('account') as DataverseMetadata.EntityMetadata;
            expect(account.Keys?.find((key) => key.LogicalName === 'accountnumber_key')?.KeyAttributes).toEqual([
                'name',
            ]);
            expect(account.ManyToOneRelationships).toHaveLength(1);
            expect(account.ManyToOneRelationships?.[0].IsCustomRelationship).toBe(true);
        });

        it('Should keep the tables without them unchanged', () => {
            const contact = store.getTableMetadata('contact') as DataverseMetadata.EntityMetadata;
            expect(contact).not.toHaveProperty('Keys');
            expect(contact).not.toHaveProperty('Privileges');
            expect(contact).not.toHaveProperty('ManyToManyRelationships');
        });

        it('Should reject incomplete definitions', () => {
            expect(() => store.upsertKeyMetadata('account', { LogicalName: 'empty', KeyAttributes: [] })).toThrow(
                'The key of account must have a LogicalName and KeyAttributes.',
            );
            expect(() => store.upsertKeyMetadata('missing', { LogicalName: 'k', KeyAttributes: ['a'] })).toThrow(
                'Entity missing does not exist.',
            );
            expect(() =>
                store.upsertRelationshipMetadata({ SchemaName: 'r', ReferencingAttribute: 'parentid' }),
            ).toThrow('The relationship r must have ReferencedEntity and ReferencingEntity.');
        });
    });

    describe('DataverseWebApi', () => {
        it('Should return the keys', () => {
            const keys = api.get("EntityDefinitions(LogicalName='account')/Keys") as { value: any[] };
            expect(keys.value[0]).toEqual({
                MetadataId: KEY_ID,
                LogicalName: 'accountnumber_key',
                SchemaName: 'AccountNumber_Key',
                DisplayName: {
                    LocalizedLabels: [{ Label: 'Account Number', LanguageCode: 1033 }],
                    UserLocalizedLabel: { Label: 'Account Number', LanguageCode: 1033 },
                },
                EntityLogicalName: 'account',
                KeyAttributes: ['accountnumber'],
                EntityKeyIndexStatus: 'Active',
            });
            expect(api.get(`EntityDefinitions(LogicalName='account')/Keys(${KEY_ID})?$select=KeyAttributes`)).toEqual({
                MetadataId: KEY_ID,
                KeyAttributes: ['accountnumber'],
            });
            expect(
                api.get("EntityDefinitions(LogicalName='account')/Keys(LogicalName='name_contact_key')"),
            ).toMatchObject({ KeyAttributes: ['name', 'primarycontactid'] });
            expect(() => api.get("EntityDefinitions(LogicalName='account')/Keys(LogicalName='missing')")).toThrow(
                expect.objectContaining({
                    message: "Could not find key with LogicalName = 'missing' on entity 'account'.",
                }),
            );
        });

        it('Should return the relationships with the enumerations by name', () => {
            const manyToOne = api.getRelatedMetadata('account', 'ManyToOneRelationships') as { value: any[] };
            expect(manyToOne.value).toEqual([
                expect.objectContaining({
                    MetadataId: RELATIONSHIP_ID,
                    SchemaName: 'account_primary_contact',
                    RelationshipType: 'OneToManyRelationship',
                    SecurityTypes: 'Append',
                    CascadeConfiguration: { Delete: 'RemoveLink', Assign: 'NoCascade' },
                }),
            ]);
            expect(manyToOne.value[0]).not.toHaveProperty('@odata.type');
            expect(
                api.getRelatedMetadata('contact', "OneToManyRelationships(SchemaName='account_primary_contact')", [
                    'ReferencingEntity',
                ]),
            ).toEqual({ MetadataId: RELATIONSHIP_ID, ReferencingEntity: 'account' });
            expect(
                (api.getRelatedMetadata('contact', 'ManyToManyRelationships') as { value: unknown[] }).value,
            ).toEqual([]);
        });

        it('Should return the privileges with the type by name', () => {
            const privileges = api.getRelatedMetadata('account', 'Privileges', ['Name', 'PrivilegeType']);
            expect(privileges).toEqual({
                value: [
                    { Name: 'prvCreateAccount', PrivilegeType: 'Create' },
                    { Name: 'prvReadAccount', PrivilegeType: 'Read' },
                ],
            });
            const definition = api.getEntityDefinition('account', true, ['Privileges']);
            expect(definition['Privileges'][1]).toMatchObject({ Name: 'prvReadAccount', PrivilegeType: 'Read' });
        });

        it('Should expand the navigation properties of the table definitions', () => {
            const definition = api.get(
                "EntityDefinitions(LogicalName='account')?$select=LogicalName&$expand=Keys($select=LogicalName),ManyToManyRelationships",
            ) as any;
            expect(Object.keys(definition).sort()).toEqual([
                'Keys',
                'LogicalName',
                'ManyToManyRelationships',
                'MetadataId',
            ]);
            expect(definition.Keys).toHaveLength(2);
            expect(definition.ManyToManyRelationships[0].SchemaName).toBe('accountleads_association');

            const all = api.get('EntityDefinitions?$select=LogicalName&$expand=OneToManyRelationships') as any;
            expect(all.value.map((table: any) => [table.LogicalName, table.OneToManyRelationships.length])).toEqual([
                ['account', 0],
                ['contact', 1],
            ]);

            // the navigation properties are only returned when expanded
            expect(api.get("EntityDefinitions(LogicalName='account')")).not.toHaveProperty('Keys');
            expect(() => api.get("EntityDefinitions(LogicalName='account')?$expand=Unknown")).toThrow(
                expect.objectContaining({ message: "Resource not found for the segment 'Unknown'." }),
            );
        });

        it('Should query the RelationshipDefinitions', () => {
            const all = api.get('RelationshipDefinitions?$select=SchemaName') as { value: any[] };
            expect(all.value).toEqual([
                {
                    '@odata.type': '#Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata',
                    MetadataId: RELATIONSHIP_ID,
                    SchemaName: 'account_primary_contact',
                },
                {
                    '@odata.type': '#Microsoft.Dynamics.CRM.ManyToManyRelationshipMetadata',
                    MetadataId: expect.any(String),
                    SchemaName: 'accountleads_association',
                },
            ]);
            const manyToMany = api.get(
                'RelationshipDefinitions/Microsoft.Dynamics.CRM.ManyToManyRelationshipMetadata?$select=SchemaName',
            ) as { value: any[] };
            expect(manyToMany.value.map((relationship) => relationship.SchemaName)).toEqual([
                'accountleads_association',
            ]);
            expect(api.get(`RelationshipDefinitions(${RELATIONSHIP_ID})?$select=SchemaName`)).toMatchObject({
                SchemaName: 'account_primary_contact',
            });
            expect(
                api.get(
                    "RelationshipDefinitions(SchemaName='account_primary_contact')/Microsoft.Dynamics.CRM.OneToManyRelationshipMetadata",
                ),
            ).toMatchObject({ ReferencedEntity: 'contact' });
            expect(() =>
                api.get(
                    "RelationshipDefinitions(SchemaName='account_primary_contact')/Microsoft.Dynamics.CRM.ManyToManyRelationshipMetadata",
                ),
            ).toThrow();
            expect(() => api.get("RelationshipDefinitions(SchemaName='missing')")).toThrow(
                expect.objectContaining({ message: "Could not find relationship with SchemaName = 'missing'." }),
            );
            expect(() => api.get("RelationshipDefinitions?$filter=ReferencedEntity eq 'account'")).toThrow(
                expect.objectContaining({
                    message: '$filter on RelationshipDefinitions is not supported by the mock.',
                }),
            );
        });

        it('Should retrieve rows by alternate key', () => {
            expect(api.get("accounts(accountnumber='A1')?$select=name")).toMatchObject({
                accountid: ACCOUNT_ID,
                name: "O'Neil Ltd",
            });
            expect(
                api.get(`accounts(name='O''Neil Ltd',_primarycontactid_value=${CONTACT_ID})?$select=accountnumber`),
            ).toMatchObject({ accountnumber: 'A1' });
            expect(api.findRecordIdByAlternateKey('account', { accountnumber: 'A1' })).toBe(ACCOUNT_ID);

            let error: unknown;
            try {
                api.get("accounts(accountnumber='A2')");
            } catch (e) {
                error = e;
            }
            expect(error).toEqual({
                code: '0x80060891',
                message: 'A record with the specified key values does not exist in account entity',
            });
            expect(getDataverseErrorCode(error)).toBe(0x80060891);

            try {
                api.get("accounts(name='Contoso')");
            } catch (e) {
                error = e;
            }
            expect(error).toEqual({
                code: '0x80060890',
                message: 'The specified key attributes are not a defined key for the account entity',
            });
            expect(getDataverseErrorCode(error)).toBe(0x80060890);

            expect(() => api.get("accounts(accountnumber='A1)")).toThrow(
                expect.objectContaining({ message: "Invalid path 'accounts(accountnumber='A1)'." }),
            );
            expect(() => api.get('accounts(accountnumber=A1)')).toThrow(
                expect.objectContaining({ message: "Invalid key 'accountnumber=A1'." }),
            );
            api.createRecord('account', { name: 'Contoso (sample) / EU', accountnumber: 'A2' });
            expect(api.get("accounts(name='Contoso (sample) / EU',_primarycontactid_value=null)")).toMatchObject({
                accountnumber: 'A2',
            });
        });
    });
});
