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

/* ============================== UpdateFee =============================== */

export function isUpdateFee(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::set_update_fee::UpdateFee`;
}

export interface UpdateFeeFields {
  mantissa: ToField<"u64">;
  exponent: ToField<"u64">;
}

export type UpdateFeeReified = Reified<UpdateFee, UpdateFeeFields>;

export class UpdateFee implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::set_update_fee::UpdateFee`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = UpdateFee.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::set_update_fee::UpdateFee`;
  readonly $typeArgs: [];
  readonly $isPhantom = UpdateFee.$isPhantom;

  readonly mantissa: ToField<"u64">;
  readonly exponent: ToField<"u64">;

  private constructor(typeArgs: [], fields: UpdateFeeFields) {
    this.$fullTypeName = composeSuiType(
      UpdateFee.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::set_update_fee::UpdateFee`;
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
      ) as `${typeof PKG_V1}::set_update_fee::UpdateFee`,
      typeArgs: [] as [],
      isPhantom: UpdateFee.$isPhantom,
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
      fromSuiObjectData: (content: SuiObjectData) =>
        UpdateFee.fromSuiObjectData(content),
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

  static fromSuiObjectData(data: SuiObjectData): UpdateFee {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isUpdateFee(data.bcs.type)) {
        throw new Error(`object at is not a UpdateFee object`);
      }

      return UpdateFee.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return UpdateFee.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
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

    return UpdateFee.fromSuiObjectData(res.data);
  }
}
