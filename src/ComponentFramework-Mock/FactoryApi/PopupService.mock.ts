export class PopupServiceMock implements ComponentFramework.FactoryApi.Popup.PopupService {
    createPopup(props: ComponentFramework.FactoryApi.Popup.Popup): void {
        throw new Error("Method not implemented.");
    }
    openPopup(name: string): void {
        throw new Error("Method not implemented.");
    }
    closePopup(name: string): void {
        throw new Error("Method not implemented.");
    }
    updatePopup(name: string, newProps: ComponentFramework.FactoryApi.Popup.Popup): void {
        throw new Error("Method not implemented.");
    }
    deletePopup(name: string): void {
        throw new Error("Method not implemented.");
    }
    setPopupsId(id: string): void {
        throw new Error("Method not implemented.");
    }
    getPopupsId(): string {
        throw new Error("Method not implemented.");
    }

}