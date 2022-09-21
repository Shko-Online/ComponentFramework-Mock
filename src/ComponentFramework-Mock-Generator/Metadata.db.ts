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
import * as loki from "lokijs";
import * as userMetadata from "./systemUser.json";

export class MetadataDB {
  attributes: {
    [key: string]: Collection<any>;
  };
  metadata: Collection<any>;
  db: loki;
  constructor() {
    this.db = new loki("metadata.db");
this.attributes = {};
    this.initMetadata([JSON.parse(JSON.stringify(userMetadata))]);
  }

  initMetadata(metadatas: any[]) {
    metadatas.forEach((metadata1) => {
      if (!this.metadata) {
        this.metadata = this.db.addCollection("metadata");
      }

      this.metadata.insert(metadata1);

      const userAttributes = this.db.addCollection(
        `${metadata1.logicalName}#attributes`
      );
      this.attributes[metadata1.logicalName] = userAttributes;
      const attributes = metadata1.Attributes;

      attributes.forEach((attribute) => {
        userAttributes.insert({
          LogicalName: attribute.LogicalName,
          SchemaName: attribute.SchemaName,
          AttributeType: attribute.AttributeType,
          MetadataId: attribute.MetadataId,
        });
      });
    });
  }
}
