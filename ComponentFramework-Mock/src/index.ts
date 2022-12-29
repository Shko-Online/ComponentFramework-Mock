/*
Copyright (c) 2022 Betim Beja and Shko Online LLC
Licensed under the MIT license.
*/

/// <reference types="powerapps-component-framework" />
/// <reference path="./global.d.ts" />

export type { MockToRaw, PropertyMap, PropertyToMock } from './ComponentFramework-Mock';
export type { MockGenerator } from './ComponentFramework-Mock-Generator';
export type { ShkoOnline } from './ShkoOnline';

export {
    AttributeMetadataCollection,
    AttributeType,
    ClientMock,
    ContextMock,
    DataSetMock,
    DateTimeMetadataMock,
    DateTimePropertyMock,
    DecimalNumberMetadataMock,
    DecimalNumberPropertyMock,
    DeviceMock,
    EntityRecordMock,
    EnumPropertyMock,
    FactoryMock,
    FilteringMock,
    FormattingMock,
    LinkingMock,
    LookupMetadataMock,
    LookupPropertyMock,
    MetadataMock,
    ModeMock,
    MultiSelectOptionSetPropertyMock,
    NavigationMock,
    NumberMetadataMock,
    NumberPropertyMock,
    OptionMetadataMock,
    OptionSetMetadataMock,
    OptionSetPropertyMock,
    PagingMock,
    PopupServiceMock,
    PropertyMock,
    ResourcesMock,
    StringMetadataMock,
    StringPropertyMock,
    TwoOptionMetadataMock,
    TwoOptionsPropertyMock,
    UserSettingsMock,
    UtilityMock,
    WebApiMock,
    WholeNumberMetadataMock,
    WholeNumberPropertyMock,
} from './ComponentFramework-Mock';

export {
    ComponentFrameworkMockGeneratorReact,
    ComponentFrameworkMockGenerator,
    MetadataDB,
    ReactResizeObserver,
    mockGetEntityMetadata,
    mockRefreshParameters,
    mockSetControlResource,
    mockSetControlState,
} from './ComponentFramework-Mock-Generator';

export { AttributeMetadataGenerator, arrayEqual } from './utils';
