export class ResourcesMock implements ComponentFramework.Resources {
    getResource(id: string, success: (data: string) => void, failure: () => void): void {
        throw new Error("Method not implemented.");
    }
    getString(id: string): string {
        throw new Error("Method not implemented.");
    }
}
