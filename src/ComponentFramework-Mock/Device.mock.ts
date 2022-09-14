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

import { stub, SinonStub } from "sinon";

export class DeviceMock implements ComponentFramework.Device {
  captureAudio: SinonStub<[], Promise<ComponentFramework.FileObject>>;
  captureImage: SinonStub<
    [options?: ComponentFramework.DeviceApi.CaptureImageOptions],
    Promise<ComponentFramework.FileObject>
  >;
  captureVideo: SinonStub<[], Promise<ComponentFramework.FileObject>>;
  getBarcodeValue: SinonStub<[], Promise<string>>;
  getCurrentPosition: SinonStub<
    [],
    Promise<ComponentFramework.DeviceApi.Position>
  >;
  pickFile: SinonStub<
    [options?: ComponentFramework.DeviceApi.PickFileOptions],
    Promise<ComponentFramework.FileObject[]>
  >;
  constructor() {
    this.captureAudio = stub();
    this.captureAudio.callsFake(()=>{
      return new Promise<ComponentFramework.FileObject>((resolve) => {
        resolve({
          fileContent: "demo",
              fileName: "fakeFile.wav",
              fileSize: 200,
              mimeType: "audio/wav",
        })
      })
    })

    this.captureImage = stub();
    this.captureImage.callsFake((options?: ComponentFramework.DeviceApi.CaptureImageOptions) =>{
      return new Promise<ComponentFramework.FileObject>((resolve) =>{
        resolve({
          fileContent: "demo",
          fileName: "fakeFile.png",
          fileSize: 200,
          mimeType: "image/png",
        })
      })
    })

    this.captureVideo = stub();
    this.captureVideo.callsFake(()=>{
      return new Promise<ComponentFramework.FileObject>((resolve) =>{
        resolve({
          fileContent: "demo",
          fileName: "fakeFile.mp4",
          fileSize: 2000,
          mimeType: "video/mp4",
        })
      })
    })

    this.getBarcodeValue = stub();
    this.getBarcodeValue.callsFake(() => {
      return new Promise<string>((resolve) =>{
        resolve ("SHKO-ONLINE");
      })
    })

    this.getCurrentPosition = stub();
    const currentPositionPromise =
      new Promise<ComponentFramework.DeviceApi.Position>((resolve) => {
        resolve({
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
        });
      });
    this.getCurrentPosition.returns(currentPositionPromise);
    this.pickFile = stub();
    const pickFilePromise =
      new Promise<ComponentFramework.DeviceApi.PickFileOptions>((resolve) => {
        resolve({
          accept: " ",
          allowMultipleFiles: false,
          maximumAllowedFileSize: 1,
        });
      });
    this.pickFile.callsFake(
      (options?: ComponentFramework.DeviceApi.PickFileOptions) => {
        return new Promise<ComponentFramework.FileObject[]>((resolve) => {
          const configuredOptions = options || { accept: "image" };
          resolve([
            {
              fileContent: "demo",
              fileName: "fakeFile.png",
              fileSize: 200,
              mimeType: "image/png",
            },
          ]);
        });
      }
    );
  }
}
