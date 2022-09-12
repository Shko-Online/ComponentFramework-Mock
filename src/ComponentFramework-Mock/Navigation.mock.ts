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

import { SinonStub, stub } from "sinon";

export class NavigationMock implements ComponentFramework.Navigation {
    openAlertDialog: SinonStub<[alertStrings: ComponentFramework.NavigationApi.AlertDialogStrings, options?: ComponentFramework.NavigationApi.AlertDialogOptions], Promise<void>>;
    openConfirmDialog: SinonStub<[confirmStrings: ComponentFramework.NavigationApi.ConfirmDialogStrings, options?: ComponentFramework.NavigationApi.ConfirmDialogOptions], Promise<ComponentFramework.NavigationApi.ConfirmDialogResponse>>;
    openErrorDialog: SinonStub<[options: ComponentFramework.NavigationApi.ErrorDialogOptions], Promise<void>>;
    openFile: SinonStub<[file: ComponentFramework.FileObject, options?: ComponentFramework.NavigationApi.OpenFileOptions], Promise<void>>;
    openForm: SinonStub<[options: ComponentFramework.NavigationApi.EntityFormOptions, parameters?: { [key: string]: string; }], Promise<ComponentFramework.NavigationApi.OpenFormSuccessResponse>>;
    openUrl: SinonStub<[url: string, options?: ComponentFramework.NavigationApi.OpenUrlOptions], void>;
    openWebResource: SinonStub<[name: string, options?: ComponentFramework.NavigationApi.OpenWebResourceOptions, data?: string], void>;
    constructor(){
        this.openAlertDialog = stub();

        this.openConfirmDialog = stub();

        this.openErrorDialog = stub();

        this.openFile = stub();

        this.openForm = stub();

        this.openUrl = stub();

        this.openWebResource = stub();
    }
}
