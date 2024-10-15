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
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== I64 =============================== */

export function isI64(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::i64::I64`;
}

export interface I64Fields {
  negative: ToField<"bool">;
  magnitude: ToField<"u64">;
}

export type I64Reified = Reified<I64, I64Fields>;

export class I64 implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::i64::I64`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = I64.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::i64::I64`;
  readonly $typeArgs: [];
  readonly $isPhantom = I64.$isPhantom;

  readonly negative: ToField<"bool">;
  readonly magnitude: ToField<"u64">;

  private constructor(typeArgs: [], fields: I64Fields) {
    this.$fullTypeName = composeSuiType(
      I64.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::i64::I64`;
    this.$typeArgs = typeArgs;

    this.negative = fields.negative;
    this.magnitude = fields.magnitude;
  }

  static reified(): I64Reified {
    return {
      typeName: I64.$typeName,
      fullTypeName: composeSuiType(
        I64.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::i64::I64`,
      typeArgs: [] as [],
      isPhantom: I64.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => I64.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        I64.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => I64.fromBcs(data),
      bcs: I64.bcs,
      fromJSONField: (field: any) => I64.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => I64.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        I64.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        I64.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => I64.fetch(client, id),
      new: (fields: I64Fields) => {
        return new I64([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return I64.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<I64>> {
    return phantom(I64.reified());
  }
  static get p() {
    return I64.phantom();
  }

  static get bcs() {
    return bcs.struct("I64", {
      negative: bcs.bool(),
      magnitude: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): I64 {
    return I64.reified().new({
      negative: decodeFromFields("bool", fields.negative),
      magnitude: decodeFromFields("u64", fields.magnitude),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): I64 {
    if (!isI64(item.type)) {
      throw new Error("not a I64 type");
    }

    return I64.reified().new({
      negative: decodeFromFieldsWithTypes("bool", item.fields.negative),
      magnitude: decodeFromFieldsWithTypes("u64", item.fields.magnitude),
    });
  }

  static fromBcs(data: Uint8Array): I64 {
    return I64.fromFields(I64.bcs.parse(data));
  }

  toJSONField() {
    return {
      negative: this.negative,
      magnitude: this.magnitude.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): I64 {
    return I64.reified().new({
      negative: decodeFromJSONField("bool", field.negative),
      magnitude: decodeFromJSONField("u64", field.magnitude),
    });
  }

  static fromJSON(json: Record<string, any>): I64 {
    if (json.$typeName !== I64.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return I64.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): I64 {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isI64(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a I64 object`,
      );
    }
    return I64.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): I64 {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isI64(data.bcs.type)) {
        throw new Error(`object at is not a I64 object`);
      }

      return I64.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return I64.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<I64> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching I64 object at id ${id}: ${res.error.code}`,
      );
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isI64(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a I64 object`);
    }

    return I64.fromSuiObjectData(res.data);
  }
}
