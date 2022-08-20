export class OptionMetadataMock implements ComponentFramework.PropertyHelper.OptionMetadata {
    Label: string;
    Value: number;
    Color: string;
    constructor(value:number, label: string, color?: string){
        this.Value = value;
        this.Label = label;
        this.Color = color;
    }
}