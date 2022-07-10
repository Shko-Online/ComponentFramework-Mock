export class NavigationMock implements ComponentFramework.Navigation {
    openAlertDialog(alertStrings: ComponentFramework.NavigationApi.AlertDialogStrings, options?: ComponentFramework.NavigationApi.AlertDialogOptions): Promise<void> {
        throw new Error("Method not implemented.");
    }
    openConfirmDialog(confirmStrings: ComponentFramework.NavigationApi.ConfirmDialogStrings, options?: ComponentFramework.NavigationApi.ConfirmDialogOptions): Promise<ComponentFramework.NavigationApi.ConfirmDialogResponse> {
        throw new Error("Method not implemented.");
    }
    openErrorDialog(options: ComponentFramework.NavigationApi.ErrorDialogOptions): Promise<void> {
        throw new Error("Method not implemented.");
    }
    openFile(file: ComponentFramework.FileObject, options?: ComponentFramework.NavigationApi.OpenFileOptions): Promise<void> {
        throw new Error("Method not implemented.");
    }
    openForm(options: ComponentFramework.NavigationApi.EntityFormOptions, parameters?: { [key: string]: string; }): Promise<ComponentFramework.NavigationApi.OpenFormSuccessResponse> {
        throw new Error("Method not implemented.");
    }
    openUrl(url: string, options?: ComponentFramework.NavigationApi.OpenUrlOptions): void {
        throw new Error("Method not implemented.");
    }
    openWebResource(name: string, options?: ComponentFramework.NavigationApi.OpenWebResourceOptions, data?: string): void {
        throw new Error("Method not implemented.");
    }
}
