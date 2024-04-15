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
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== V__0_2_0 =============================== */

export function isV__0_2_0(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::version_control::V__0_2_0"
  );
}

export interface V__0_2_0Fields {
  dummyField: ToField<"bool">;
}

export type V__0_2_0Reified = Reified<V__0_2_0, V__0_2_0Fields>;

export class V__0_2_0 implements StructClass {
  static readonly $typeName =
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::version_control::V__0_2_0";
  static readonly $numTypeParams = 0;

  readonly $typeName = V__0_2_0.$typeName;

  readonly $fullTypeName: "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::version_control::V__0_2_0";

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: V__0_2_0Fields) {
    this.$fullTypeName = composeSuiType(
      V__0_2_0.$typeName,
      ...typeArgs,
    ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::version_control::V__0_2_0";
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): V__0_2_0Reified {
    return {
      typeName: V__0_2_0.$typeName,
      fullTypeName: composeSuiType(
        V__0_2_0.$typeName,
        ...[],
      ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::version_control::V__0_2_0",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => V__0_2_0.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        V__0_2_0.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => V__0_2_0.fromBcs(data),
      bcs: V__0_2_0.bcs,
      fromJSONField: (field: any) => V__0_2_0.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => V__0_2_0.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        V__0_2_0.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        V__0_2_0.fetch(client, id),
      new: (fields: V__0_2_0Fields) => {
        return new V__0_2_0([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return V__0_2_0.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<V__0_2_0>> {
    return phantom(V__0_2_0.reified());
  }
  static get p() {
    return V__0_2_0.phantom();
  }

  static get bcs() {
    return bcs.struct("V__0_2_0", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): V__0_2_0 {
    return V__0_2_0.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): V__0_2_0 {
    if (!isV__0_2_0(item.type)) {
      throw new Error("not a V__0_2_0 type");
    }

    return V__0_2_0.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): V__0_2_0 {
    return V__0_2_0.fromFields(V__0_2_0.bcs.parse(data));
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

  static fromJSONField(field: any): V__0_2_0 {
    return V__0_2_0.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): V__0_2_0 {
    if (json.$typeName !== V__0_2_0.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return V__0_2_0.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): V__0_2_0 {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isV__0_2_0(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a V__0_2_0 object`,
      );
    }
    return V__0_2_0.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<V__0_2_0> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching V__0_2_0 object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isV__0_2_0(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a V__0_2_0 object`);
    }
    return V__0_2_0.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== V__DUMMY =============================== */

export function isV__DUMMY(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::version_control::V__DUMMY"
  );
}

export interface V__DUMMYFields {
  dummyField: ToField<"bool">;
}

export type V__DUMMYReified = Reified<V__DUMMY, V__DUMMYFields>;

export class V__DUMMY implements StructClass {
  static readonly $typeName =
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::version_control::V__DUMMY";
  static readonly $numTypeParams = 0;

  readonly $typeName = V__DUMMY.$typeName;

  readonly $fullTypeName: "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::version_control::V__DUMMY";

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: V__DUMMYFields) {
    this.$fullTypeName = composeSuiType(
      V__DUMMY.$typeName,
      ...typeArgs,
    ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::version_control::V__DUMMY";
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): V__DUMMYReified {
    return {
      typeName: V__DUMMY.$typeName,
      fullTypeName: composeSuiType(
        V__DUMMY.$typeName,
        ...[],
      ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::version_control::V__DUMMY",
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
