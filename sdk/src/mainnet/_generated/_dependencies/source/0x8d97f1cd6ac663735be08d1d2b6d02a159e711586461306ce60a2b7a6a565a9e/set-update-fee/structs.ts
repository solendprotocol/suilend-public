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

/* ============================== UpdateFee =============================== */

export function isUpdateFee(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::set_update_fee::UpdateFee"
  );
}

export interface UpdateFeeFields {
  mantissa: ToField<"u64">;
  exponent: ToField<"u64">;
}

export type UpdateFeeReified = Reified<UpdateFee, UpdateFeeFields>;

export class UpdateFee implements StructClass {
  static readonly $typeName =
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::set_update_fee::UpdateFee";
  static readonly $numTypeParams = 0;

  readonly $typeName = UpdateFee.$typeName;

  readonly $fullTypeName: "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::set_update_fee::UpdateFee";

  readonly $typeArgs: [];

  readonly mantissa: ToField<"u64">;
  readonly exponent: ToField<"u64">;

  private constructor(typeArgs: [], fields: UpdateFeeFields) {
    this.$fullTypeName = composeSuiType(
      UpdateFee.$typeName,
      ...typeArgs,
    ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::set_update_fee::UpdateFee";
    this.$typeArgs = typeArgs;

    this.mantissa = fields.mantissa;
    this.exponent = fields.exponent;
  }

  static reified(): UpdateFeeReified {
    return {
      typeName: UpdateFee.$typeName,
      fullTypeName: composeSuiType(
        UpdateFee.$typeName,
        ...[],
      ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::set_update_fee::UpdateFee",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => UpdateFee.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        UpdateFee.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => UpdateFee.fromBcs(data),
      bcs: UpdateFee.bcs,
      fromJSONField: (field: any) => UpdateFee.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => UpdateFee.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        UpdateFee.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        UpdateFee.fetch(client, id),
      new: (fields: UpdateFeeFields) => {
        return new UpdateFee([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return UpdateFee.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<UpdateFee>> {
    return phantom(UpdateFee.reified());
  }
  static get p() {
    return UpdateFee.phantom();
  }

  static get bcs() {
    return bcs.struct("UpdateFee", {
      mantissa: bcs.u64(),
      exponent: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): UpdateFee {
    return UpdateFee.reified().new({
      mantissa: decodeFromFields("u64", fields.mantissa),
      exponent: decodeFromFields("u64", fields.exponent),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): UpdateFee {
    if (!isUpdateFee(item.type)) {
      throw new Error("not a UpdateFee type");
    }

    return UpdateFee.reified().new({
      mantissa: decodeFromFieldsWithTypes("u64", item.fields.mantissa),
      exponent: decodeFromFieldsWithTypes("u64", item.fields.exponent),
    });
  }

  static fromBcs(data: Uint8Array): UpdateFee {
    return UpdateFee.fromFields(UpdateFee.bcs.parse(data));
  }

  toJSONField() {
    return {
      mantissa: this.mantissa.toString(),
      exponent: this.exponent.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): UpdateFee {
    return UpdateFee.reified().new({
      mantissa: decodeFromJSONField("u64", field.mantissa),
      exponent: decodeFromJSONField("u64", field.exponent),
    });
  }

  static fromJSON(json: Record<string, any>): UpdateFee {
    if (json.$typeName !== UpdateFee.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return UpdateFee.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): UpdateFee {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isUpdateFee(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a UpdateFee object`,
      );
    }
    return UpdateFee.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<UpdateFee> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching UpdateFee object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isUpdateFee(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a UpdateFee object`);
    }
    return UpdateFee.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
