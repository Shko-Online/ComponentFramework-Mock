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
 
import { SinonStub, stub } from "sinon";

export class AttributeMetadataCollection {
    _attributes: ShkoOnline.AttributeMetadata[];
    add: SinonStub<[]>;
    get: SinonStub<[string], ShkoOnline.AttributeMetadata>;
    getAll : SinonStub<[], ShkoOnline.AttributeMetadata[]>;
    getByFilter: SinonStub<[], ShkoOnline.AttributeMetadata[]>;
    getByName: SinonStub<[string], ShkoOnline.AttributeMetadata>;
    //???
    getFirst: SinonStub<[], ShkoOnline.AttributeMetadata>; 
    getLength: SinonStub<[], number>;
    remove : SinonStub<[]>;

    constructor(){
        this.add = stub();
        this.get = stub();
        this.get.callsFake((logicalName: string)=>{
            return this._attributes.find((attribute)=> attribute.LogicalName === logicalName);
        })
        this.getAll =stub();
        this.getAll.callsFake(() =>{
           return this._attributes;
        });
        this.getByFilter = stub();
        this.getByName = stub();
        this.getByName.callsFake((logicalName: string)=>{
            return this._attributes.find((attribute)=> attribute.LogicalName === logicalName);
        })
        this.getFirst = stub();
        this.getLength.callsFake(()=>{
            return this._attributes.length;
        })
        this.remove = stub();
    }
}