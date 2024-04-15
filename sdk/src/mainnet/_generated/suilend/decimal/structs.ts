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
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== Decimal =============================== */

export function isDecimal(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf::decimal::Decimal"
  );
}

export interface DecimalFields {
  value: ToField<"u256">;
}

export type DecimalReified = Reified<Decimal, DecimalFields>;

export class Decimal implements StructClass {
  static readonly $typeName =
    "0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf::decimal::Decimal";
  static readonly $numTypeParams = 0;

  readonly $typeName = Decimal.$typeName;

  readonly $fullTypeName: "0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf::decimal::Decimal";

  readonly $typeArgs: [];

  readonly value: ToField<"u256">;

  private constructor(typeArgs: [], fields: DecimalFields) {
    this.$fullTypeName = composeSuiType(
      Decimal.$typeName,
      ...typeArgs,
    ) as "0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf::decimal::Decimal";
    this.$typeArgs = typeArgs;

    this.value = fields.value;
  }

  static reified(): DecimalReified {
    return {
      typeName: Decimal.$typeName,
      fullTypeName: composeSuiType(
        Decimal.$typeName,
        ...[],
      ) as "0xf95b06141ed4a174f239417323bde3f209b972f5930d8521ea38a52aff3a6ddf::decimal::Decimal",
      typeArgs: [] as [],
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
    return Decimal.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
