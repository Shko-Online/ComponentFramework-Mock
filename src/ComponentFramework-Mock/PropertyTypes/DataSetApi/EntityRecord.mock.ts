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

type ColumnReturnValue =
  | string
  | number
  | boolean
  | number[]
  | ComponentFramework.EntityReference
  | ComponentFramework.EntityReference[]
  | Date
  | ComponentFramework.LookupValue
  | ComponentFramework.LookupValue[];

export class EntityRecord
  implements
    ComponentFramework.PropertyHelper.DataSetApi.EntityRecord,
    ComponentFramework.EntityReference
{
  id: { guid: string };

  /**
   * The entity logical name. Read-only.
   */
  etn?: string | undefined;

  /**
   * The name of the entity reference. Read-only.
   */
  name: string;
  getFormattedValue: SinonStub<[columnName: string], string>;
  getRecordId: SinonStub<[], string>;
  getValue: SinonStub<[columnName: string], ColumnReturnValue>;
  getNamedReference: SinonStub<[], ComponentFramework.EntityReference>;
  columns: {
    [columnName: string]: ColumnReturnValue;
  };
  constructor(etn: string|undefined, id: string, name?: string) {
    this.etn = etn;
    this.id = {guid: id};
    this.name = name;
    this.getFormattedValue = stub();
    this.getNamedReference = stub();
    this.getNamedReference.callsFake(() => ({
      id: this.id,
      etn: this.etn,
      name: this.name,
    }));
    this.getRecordId = stub();
    this.getRecordId.callsFake(() => this.id.guid);
    this.getValue = stub();
    this.getValue.callsFake((columnName)=> this.columns[columnName]);
  }
}
