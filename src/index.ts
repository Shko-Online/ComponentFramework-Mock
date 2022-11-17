/*
	Unless explicitly acquired and licensed from Licensor under another
	license, the contents of this file are subject to the Reciprocal Public
	License ("RPL") Version 1.5, or subsequent versions as allowed by the RPL,
	and You may not copy or use this file in either source code or executable
	form, except in compliance with the terms and conditions of the RPL.

	All software distributed under the RPL is provided strictly on an "AS
	IS" basis, WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, AND
	LICENSOR HEREBY DISCLAIMS ALL SUCH WARRANTIES, INCLUDING WITHOUT
	LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
	PURPOSE, QUIET ENJOYMENT, OR NON-INFRINGEMENT. See the RPL for specific
	language governing rights and limitations under the RPL. 
*/

/// <reference types="powerapps-component-framework" />
/// <reference path="./ShkoOnline.d.ts" />

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
    MockToRaw,
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
    PropertyMap,
    PropertyMock,
    PropertyToMock,
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
    MockGenerator,
    ReactResizeObserver,
    mockGetEntityMetadata,
    mockSetControlState
} from './ComponentFramework-Mock-Generator';

export { AttributeMetadataGenerator, arrayEqual } from './utils';
