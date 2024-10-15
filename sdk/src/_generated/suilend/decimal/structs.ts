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
} from "../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../_framework/util";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== Decimal =============================== */

export function isDecimal(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::decimal::Decimal`;
}

export interface DecimalFields {
  value: ToField<"u256">;
}

export type DecimalReified = Reified<Decimal, DecimalFields>;

export class Decimal implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::decimal::Decimal`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = Decimal.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::decimal::Decimal`;
  readonly $typeArgs: [];
  readonly $isPhantom = Decimal.$isPhantom;

  readonly value: ToField<"u256">;

  private constructor(typeArgs: [], fields: DecimalFields) {
    this.$fullTypeName = composeSuiType(
      Decimal.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::decimal::Decimal`;
    this.$typeArgs = typeArgs;

    this.value = fields.value;
  }

  static reified(): DecimalReified {
    return {
      typeName: Decimal.$typeName,
      fullTypeName: composeSuiType(
        Decimal.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::decimal::Decimal`,
      typeArgs: [] as [],
      isPhantom: Decimal.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Decimal.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Decimal.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Decimal.fromBcs(data),
      bcs: Decimal.bcs,
      fromJSONField: (field: any) => Decimal.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Decimal.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Decimal.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        Decimal.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => Decimal.fetch(client, id),
      new: (fields: DecimalFields) => {
        return new Decimal([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Decimal.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Decimal>> {
    return phantom(Decimal.reified());
  }
  static get p() {
    return Decimal.phantom();
  }

  static get bcs() {
    return bcs.struct("Decimal", {
      value: bcs.u256(),
    });
  }

  static fromFields(fields: Record<string, any>): Decimal {
    return Decimal.reified().new({
      value: decodeFromFields("u256", fields.value),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Decimal {
    if (!isDecimal(item.type)) {
      throw new Error("not a Decimal type");
    }

    return Decimal.reified().new({
      value: decodeFromFieldsWithTypes("u256", item.fields.value),
    });
  }

  static fromBcs(data: Uint8Array): Decimal {
    return Decimal.fromFields(Decimal.bcs.parse(data));
  }

  toJSONField() {
    return {
      value: this.value.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): Decimal {
    return Decimal.reified().new({
      value: decodeFromJSONField("u256", field.value),
    });
  }

  static fromJSON(json: Record<string, any>): Decimal {
    if (json.$typeName !== Decimal.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Decimal.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Decimal {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isDecimal(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a Decimal object`,
      );
    }
    return Decimal.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): Decimal {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isDecimal(data.bcs.type)) {
        throw new Error(`object at is not a Decimal object`);
      }

      return Decimal.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Decimal.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<Decimal> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching Decimal object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isDecimal(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a Decimal object`);
    }

    return Decimal.fromSuiObjectData(res.data);
  }
}
