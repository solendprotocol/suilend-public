import {
  PhantomReified,
  Reified,
  StructClass,
  ToField,
  ToTypeStr,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  phantom,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { PKG_V1, PKG_V2 } from "../index";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== V__DUMMY =============================== */

export function isV__DUMMY(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::version_control::V__DUMMY`;
}

export interface V__DUMMYFields {
  dummyField: ToField<"bool">;
}

export type V__DUMMYReified = Reified<V__DUMMY, V__DUMMYFields>;

export class V__DUMMY implements StructClass {
  static readonly $typeName = `${PKG_V1}::version_control::V__DUMMY`;
  static readonly $numTypeParams = 0;

  readonly $typeName = V__DUMMY.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::version_control::V__DUMMY`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: V__DUMMYFields) {
    this.$fullTypeName = composeSuiType(
      V__DUMMY.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::version_control::V__DUMMY`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): V__DUMMYReified {
    return {
      typeName: V__DUMMY.$typeName,
      fullTypeName: composeSuiType(
        V__DUMMY.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::version_control::V__DUMMY`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => V__DUMMY.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        V__DUMMY.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => V__DUMMY.fromBcs(data),
      bcs: V__DUMMY.bcs,
      fromJSONField: (field: any) => V__DUMMY.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => V__DUMMY.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        V__DUMMY.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        V__DUMMY.fetch(client, id),
      new: (fields: V__DUMMYFields) => {
        return new V__DUMMY([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return V__DUMMY.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<V__DUMMY>> {
    return phantom(V__DUMMY.reified());
  }
  static get p() {
    return V__DUMMY.phantom();
  }

  static get bcs() {
    return bcs.struct("V__DUMMY", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): V__DUMMY {
    return V__DUMMY.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): V__DUMMY {
    if (!isV__DUMMY(item.type)) {
      throw new Error("not a V__DUMMY type");
    }

    return V__DUMMY.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): V__DUMMY {
    return V__DUMMY.fromFields(V__DUMMY.bcs.parse(data));
  }

  toJSONField() {
    return {
      dummyField: this.dummyField,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): V__DUMMY {
    return V__DUMMY.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): V__DUMMY {
    if (json.$typeName !== V__DUMMY.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return V__DUMMY.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): V__DUMMY {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isV__DUMMY(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a V__DUMMY object`,
      );
    }
    return V__DUMMY.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<V__DUMMY> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching V__DUMMY object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isV__DUMMY(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a V__DUMMY object`);
    }
    return V__DUMMY.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== V__0_1_1 =============================== */

export function isV__0_1_1(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::version_control::V__0_1_1`;
}

export interface V__0_1_1Fields {
  dummyField: ToField<"bool">;
}

export type V__0_1_1Reified = Reified<V__0_1_1, V__0_1_1Fields>;

export class V__0_1_1 implements StructClass {
  static readonly $typeName = `${PKG_V1}::version_control::V__0_1_1`;
  static readonly $numTypeParams = 0;

  readonly $typeName = V__0_1_1.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::version_control::V__0_1_1`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: V__0_1_1Fields) {
    this.$fullTypeName = composeSuiType(
      V__0_1_1.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::version_control::V__0_1_1`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): V__0_1_1Reified {
    return {
      typeName: V__0_1_1.$typeName,
      fullTypeName: composeSuiType(
        V__0_1_1.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::version_control::V__0_1_1`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => V__0_1_1.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        V__0_1_1.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => V__0_1_1.fromBcs(data),
      bcs: V__0_1_1.bcs,
      fromJSONField: (field: any) => V__0_1_1.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => V__0_1_1.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        V__0_1_1.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        V__0_1_1.fetch(client, id),
      new: (fields: V__0_1_1Fields) => {
        return new V__0_1_1([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return V__0_1_1.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<V__0_1_1>> {
    return phantom(V__0_1_1.reified());
  }
  static get p() {
    return V__0_1_1.phantom();
  }

  static get bcs() {
    return bcs.struct("V__0_1_1", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): V__0_1_1 {
    return V__0_1_1.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): V__0_1_1 {
    if (!isV__0_1_1(item.type)) {
      throw new Error("not a V__0_1_1 type");
    }

    return V__0_1_1.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): V__0_1_1 {
    return V__0_1_1.fromFields(V__0_1_1.bcs.parse(data));
  }

  toJSONField() {
    return {
      dummyField: this.dummyField,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): V__0_1_1 {
    return V__0_1_1.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): V__0_1_1 {
    if (json.$typeName !== V__0_1_1.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return V__0_1_1.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): V__0_1_1 {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isV__0_1_1(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a V__0_1_1 object`,
      );
    }
    return V__0_1_1.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<V__0_1_1> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching V__0_1_1 object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isV__0_1_1(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a V__0_1_1 object`);
    }
    return V__0_1_1.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== V__0_1_2 =============================== */

export function isV__0_1_2(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V2}::version_control::V__0_1_2`;
}

export interface V__0_1_2Fields {
  dummyField: ToField<"bool">;
}

export type V__0_1_2Reified = Reified<V__0_1_2, V__0_1_2Fields>;

export class V__0_1_2 implements StructClass {
  static readonly $typeName = `${PKG_V2}::version_control::V__0_1_2`;
  static readonly $numTypeParams = 0;

  readonly $typeName = V__0_1_2.$typeName;

  readonly $fullTypeName: `${typeof PKG_V2}::version_control::V__0_1_2`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: V__0_1_2Fields) {
    this.$fullTypeName = composeSuiType(
      V__0_1_2.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V2}::version_control::V__0_1_2`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): V__0_1_2Reified {
    return {
      typeName: V__0_1_2.$typeName,
      fullTypeName: composeSuiType(
        V__0_1_2.$typeName,
        ...[],
      ) as `${typeof PKG_V2}::version_control::V__0_1_2`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => V__0_1_2.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        V__0_1_2.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => V__0_1_2.fromBcs(data),
      bcs: V__0_1_2.bcs,
      fromJSONField: (field: any) => V__0_1_2.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => V__0_1_2.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        V__0_1_2.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        V__0_1_2.fetch(client, id),
      new: (fields: V__0_1_2Fields) => {
        return new V__0_1_2([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return V__0_1_2.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<V__0_1_2>> {
    return phantom(V__0_1_2.reified());
  }
  static get p() {
    return V__0_1_2.phantom();
  }

  static get bcs() {
    return bcs.struct("V__0_1_2", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): V__0_1_2 {
    return V__0_1_2.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): V__0_1_2 {
    if (!isV__0_1_2(item.type)) {
      throw new Error("not a V__0_1_2 type");
    }

    return V__0_1_2.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): V__0_1_2 {
    return V__0_1_2.fromFields(V__0_1_2.bcs.parse(data));
  }

  toJSONField() {
    return {
      dummyField: this.dummyField,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): V__0_1_2 {
    return V__0_1_2.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): V__0_1_2 {
    if (json.$typeName !== V__0_1_2.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return V__0_1_2.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): V__0_1_2 {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isV__0_1_2(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a V__0_1_2 object`,
      );
    }
    return V__0_1_2.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<V__0_1_2> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching V__0_1_2 object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isV__0_1_2(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a V__0_1_2 object`);
    }
    return V__0_1_2.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
