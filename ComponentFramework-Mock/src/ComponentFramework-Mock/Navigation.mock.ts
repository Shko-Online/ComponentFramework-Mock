/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import { stub } from 'sinon';
import type { SinonStub }from 'sinon';

type AlertDialogStrings = ComponentFramework.NavigationApi.AlertDialogStrings;
type AlertDialogOptions = ComponentFramework.NavigationApi.AlertDialogOptions;
type ConfirmDialogStrings = ComponentFramework.NavigationApi.ConfirmDialogStrings;
type ConfirmDialogOptions = ComponentFramework.NavigationApi.ConfirmDialogOptions;
type ConfirmDialogResponse = ComponentFramework.NavigationApi.ConfirmDialogResponse;

export class NavigationMock implements ComponentFramework.Navigation {
    openAlertDialog: SinonStub<[alertStrings: AlertDialogStrings, options?: AlertDialogOptions], Promise<void>>;
    openConfirmDialog: SinonStub<
        [confirmStrings: ConfirmDialogStrings, options?: ConfirmDialogOptions],
        Promise<ConfirmDialogResponse>
    >;
    openErrorDialog: SinonStub<[options: ComponentFramework.NavigationApi.ErrorDialogOptions], Promise<void>>;
    openFile: SinonStub<
        [file: ComponentFramework.FileObject, options?: ComponentFramework.NavigationApi.OpenFileOptions],
        Promise<void>
    >;
    openForm: SinonStub<
        [options: ComponentFramework.NavigationApi.EntityFormOptions, parameters?: { [key: string]: string }],
        Promise<ComponentFramework.NavigationApi.OpenFormSuccessResponse>
    >;
    openUrl: SinonStub<[url: string, options?: ComponentFramework.NavigationApi.OpenUrlOptions], void>;
    openWebResource: SinonStub<
        [name: string, options?: ComponentFramework.NavigationApi.OpenWebResourceOptions, data?: string],
        void
    >;
    constructor() {
        this.openAlertDialog = stub();
        const openAlertDialogStringsPromise = new Promise<ComponentFramework.NavigationApi.AlertDialogStrings>(
            (resolve) => {
                resolve({
                    text: 'string',
                    confirmButtonLabel: 'string',
                });
            },
        );
        const openAlertDialogOptionsPromise = new Promise<ComponentFramework.NavigationApi.AlertDialogOptions>(
            (resolve) => {
                resolve({
                    height: 200,
                    width: 200,
                });
            },
        );
        this.openAlertDialog.callsFake(
            (
                alertStrings: ComponentFramework.NavigationApi.AlertDialogStrings,
                options?: ComponentFramework.NavigationApi.AlertDialogOptions,
            ) => {
                return new Promise<void>((resolve) => {
                    resolve();
                });
            },
        );

        this.openConfirmDialog = stub();
        this.openConfirmDialog.callsFake(
            (
                confirmStrings: ComponentFramework.NavigationApi.ConfirmDialogStrings,
                options?: ComponentFramework.NavigationApi.ConfirmDialogOptions,
            ) => {
                return new Promise<ComponentFramework.NavigationApi.ConfirmDialogResponse>((resolve) => {
                    resolve({
                        confirmed: true,
                    });
                });
            },
        );

        this.openErrorDialog = stub();

        this.openFile = stub();

        this.openForm = stub();

        this.openUrl = stub();

        this.openWebResource = stub();
    }
}
