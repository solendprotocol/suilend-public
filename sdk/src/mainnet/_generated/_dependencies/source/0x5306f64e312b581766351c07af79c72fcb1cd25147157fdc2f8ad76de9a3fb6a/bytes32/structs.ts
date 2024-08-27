import * as reified from "../../../../_framework/reified";
import {
  PhantomReified,
  Reified,
  StructClass,
  ToField,
  ToTypeStr,
  Vector,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  fieldToJSON,
  phantom,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== Bytes32 =============================== */

export function isBytes32(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::bytes32::Bytes32"
  );
}

export interface Bytes32Fields {
  data: ToField<Vector<"u8">>;
}

export type Bytes32Reified = Reified<Bytes32, Bytes32Fields>;

export class Bytes32 implements StructClass {
  static readonly $typeName =
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::bytes32::Bytes32";
  static readonly $numTypeParams = 0;

  readonly $typeName = Bytes32.$typeName;

  readonly $fullTypeName: "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::bytes32::Bytes32";

  readonly $typeArgs: [];

  readonly data: ToField<Vector<"u8">>;

  private constructor(typeArgs: [], fields: Bytes32Fields) {
    this.$fullTypeName = composeSuiType(
      Bytes32.$typeName,
      ...typeArgs,
    ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::bytes32::Bytes32";
    this.$typeArgs = typeArgs;

    this.data = fields.data;
  }

  static reified(): Bytes32Reified {
    return {
      typeName: Bytes32.$typeName,
      fullTypeName: composeSuiType(
        Bytes32.$typeName,
        ...[],
      ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::bytes32::Bytes32",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Bytes32.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Bytes32.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Bytes32.fromBcs(data),
      bcs: Bytes32.bcs,
      fromJSONField: (field: any) => Bytes32.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Bytes32.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Bytes32.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) => Bytes32.fetch(client, id),
      new: (fields: Bytes32Fields) => {
        return new Bytes32([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Bytes32.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Bytes32>> {
    return phantom(Bytes32.reified());
  }
  static get p() {
    return Bytes32.phantom();
  }

  static get bcs() {
    return bcs.struct("Bytes32", {
      data: bcs.vector(bcs.u8()),
    });
  }

  static fromFields(fields: Record<string, any>): Bytes32 {
    return Bytes32.reified().new({
      data: decodeFromFields(reified.vector("u8"), fields.data),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Bytes32 {
    if (!isBytes32(item.type)) {
      throw new Error("not a Bytes32 type");
    }

    return Bytes32.reified().new({
      data: decodeFromFieldsWithTypes(reified.vector("u8"), item.fields.data),
    });
  }

  static fromBcs(data: Uint8Array): Bytes32 {
    return Bytes32.fromFields(Bytes32.bcs.parse(data));
  }

  toJSONField() {
    return {
      data: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.data),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): Bytes32 {
    return Bytes32.reified().new({
      data: decodeFromJSONField(reified.vector("u8"), field.data),
    });
  }

  static fromJSON(json: Record<string, any>): Bytes32 {
    if (json.$typeName !== Bytes32.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Bytes32.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Bytes32 {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isBytes32(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a Bytes32 object`,
      );
    }
    return Bytes32.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<Bytes32> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching Bytes32 object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isBytes32(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a Bytes32 object`);
    }
    return Bytes32.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
