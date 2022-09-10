import { stub, SinonStub } from "sinon";

export class DeviceMock implements ComponentFramework.Device {
    captureAudio: SinonStub<[], Promise<ComponentFramework.FileObject>>;
    captureImage: SinonStub<[options?: ComponentFramework.DeviceApi.CaptureImageOptions], Promise<ComponentFramework.FileObject>>;
    captureVideo: SinonStub<[], Promise<ComponentFramework.FileObject>>;
    getBarcodeValue: SinonStub<[], Promise<string>>;
    getCurrentPosition: SinonStub<[], Promise<ComponentFramework.DeviceApi.Position>>;
    pickFile: SinonStub<[options?: ComponentFramework.DeviceApi.PickFileOptions], Promise<ComponentFramework.FileObject[]>>;
    constructor() {
        this.captureAudio = stub<[], Promise<ComponentFramework.FileObject>>();

        this.captureImage = stub<[options?: ComponentFramework.DeviceApi.CaptureImageOptions], Promise<ComponentFramework.FileObject>>();

        this.captureVideo = stub<[], Promise<ComponentFramework.FileObject>>();

        this.getBarcodeValue = stub<[], Promise<string>>();

        this.getCurrentPosition = stub<[], Promise<ComponentFramework.DeviceApi.Position>>();
        const currentPositionPromise = new Promise<ComponentFramework.DeviceApi.Position>((resolve) => {
            resolve({
                coords: {
                    accuracy: 141,
                    latitude: 41.3415145,
                    longitude: 19.7769355,
                    altitude: 0,
                    altitudeAccuracy: 0,
                    heading: 0,
                    speed: 0
                },
                timestamp: new Date()
            })
        });
        this.getCurrentPosition.returns(currentPositionPromise);
        this.pickFile = stub<[options?: ComponentFramework.DeviceApi.PickFileOptions], Promise<ComponentFramework.FileObject[]>>();

    }
}
