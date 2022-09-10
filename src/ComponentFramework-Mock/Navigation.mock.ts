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
        //to-do
    }
}
