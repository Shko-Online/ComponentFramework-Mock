export class DeviceMock implements ComponentFramework.Device{
    captureAudio(): Promise<ComponentFramework.FileObject> {
        throw new Error("Method not implemented.");
    }
    captureImage(options?: ComponentFramework.DeviceApi.CaptureImageOptions): Promise<ComponentFramework.FileObject> {
        throw new Error("Method not implemented.");
    }
    captureVideo(): Promise<ComponentFramework.FileObject> {
        throw new Error("Method not implemented.");
    }
    getBarcodeValue(): Promise<string> {
        throw new Error("Method not implemented.");
    }
    getCurrentPosition(): Promise<ComponentFramework.DeviceApi.Position> {
        throw new Error("Method not implemented.");
    }
    pickFile(options?: ComponentFramework.DeviceApi.PickFileOptions): Promise<ComponentFramework.FileObject[]> {
        throw new Error("Method not implemented.");
    }
}
