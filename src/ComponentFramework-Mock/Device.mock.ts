/*
    Copyright (c) 2022 Betim Beja and Shko Online LLC
    Licensed under the MIT license.
*/

import type { SinonStub } from 'sinon';
import { stub } from 'sinon';

export class DeviceMock implements ComponentFramework.Device {
    captureAudio: SinonStub<[], Promise<ComponentFramework.FileObject>>;
    captureImage: SinonStub<
        [options?: ComponentFramework.DeviceApi.CaptureImageOptions],
        Promise<ComponentFramework.FileObject>
    >;
    captureVideo: SinonStub<[], Promise<ComponentFramework.FileObject>>;
    getBarcodeValue: SinonStub<[], Promise<string>>;
    getCurrentPosition: SinonStub<[], Promise<ComponentFramework.DeviceApi.Position>>;
    pickFile: SinonStub<
        [options?: ComponentFramework.DeviceApi.PickFileOptions],
        Promise<ComponentFramework.FileObject[]>
    >;
    constructor() {
        this.captureAudio = stub();
        this.captureAudio.callsFake(() =>
            Promise.resolve<ComponentFramework.FileObject>({
                fileContent: 'demo',
                fileName: 'fakeFile.wav',
                fileSize: 200,
                mimeType: 'audio/wav',
            }),
        );

        this.captureImage = stub();
        this.captureImage.callsFake((options?: ComponentFramework.DeviceApi.CaptureImageOptions) => {
            options = options ?? { allowEdit: false, width: 1024, height: 768, preferFrontCamera: false, quality: 100 };
            return Promise.resolve({
                fileContent: 'demo',
                fileName: 'fakeFile.png',
                fileSize: options.width * options.height * 4, // Rough estimation of file size based on dimensions (RGBA)
                mimeType: 'image/png',
            });
        });

        this.captureVideo = stub();
        this.captureVideo.callsFake(() =>
            Promise.resolve({
                fileContent: 'demo',
                fileName: 'fakeFile.mp4',
                fileSize: 2000,
                mimeType: 'video/mp4',
            }),
        );

        this.getBarcodeValue = stub();
        this.getBarcodeValue.callsFake(() => Promise.resolve('SHKO-ONLINE'));

        this.getCurrentPosition = stub();
        this.getCurrentPosition.callsFake(() =>
            Promise.resolve({
                coords: {
                    accuracy: 141,
                    latitude: 41.3415145,
                    longitude: 19.7769355,
                    altitude: 0,
                    altitudeAccuracy: 0,
                    heading: 0,
                    speed: 0,
                },
                timestamp: new Date(),
            }),
        );
        this.pickFile = stub();
        this.pickFile.callsFake((options?: ComponentFramework.DeviceApi.PickFileOptions) => {
            return new Promise<ComponentFramework.FileObject[]>((resolve, reject) => {
                const configuredOptions = options || { accept: 'image' };
                if (configuredOptions.accept === 'image') {
                    return resolve([
                        {
                            fileContent: 'demo',
                            fileName: 'fakeFile.png',
                            fileSize: 200,
                            mimeType: 'image/png',
                        },
                    ]);
                } else if (configuredOptions.accept === 'audio') {
                    return resolve([
                        {
                            fileContent: 'demo',
                            fileName: 'fakeFile.wav',
                            fileSize: 200,
                            mimeType: 'audio/wav',
                        },
                    ]);
                } else if (configuredOptions.accept === 'video') {
                    return resolve([
                        {
                            fileContent: 'demo',
                            fileName: 'fakeFile.mp4',
                            fileSize: 2000,
                            mimeType: 'video/mp4',
                        },
                    ]);
                }
                return reject(new Error('Unsupported file type'));
            });
        });
    }
}
