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
import { bcs, fromB64, fromHEX, toHEX } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== PythFeeRecipient =============================== */

export function isPythFeeRecipient(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::set_fee_recipient::PythFeeRecipient`;
}

export interface PythFeeRecipientFields {
  recipient: ToField<"address">;
}

export type PythFeeRecipientReified = Reified<
  PythFeeRecipient,
  PythFeeRecipientFields
>;

export class PythFeeRecipient implements StructClass {
  static readonly $typeName = `${PKG_V1}::set_fee_recipient::PythFeeRecipient`;
  static readonly $numTypeParams = 0;

  readonly $typeName = PythFeeRecipient.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::set_fee_recipient::PythFeeRecipient`;

  readonly $typeArgs: [];

  readonly recipient: ToField<"address">;

  private constructor(typeArgs: [], fields: PythFeeRecipientFields) {
    this.$fullTypeName = composeSuiType(
      PythFeeRecipient.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::set_fee_recipient::PythFeeRecipient`;
    this.$typeArgs = typeArgs;

    this.recipient = fields.recipient;
  }

  static reified(): PythFeeRecipientReified {
    return {
      typeName: PythFeeRecipient.$typeName,
      fullTypeName: composeSuiType(
        PythFeeRecipient.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::set_fee_recipient::PythFeeRecipient`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        PythFeeRecipient.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        PythFeeRecipient.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => PythFeeRecipient.fromBcs(data),
      bcs: PythFeeRecipient.bcs,
      fromJSONField: (field: any) => PythFeeRecipient.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => PythFeeRecipient.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        PythFeeRecipient.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        PythFeeRecipient.fetch(client, id),
      new: (fields: PythFeeRecipientFields) => {
        return new PythFeeRecipient([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PythFeeRecipient.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<PythFeeRecipient>> {
    return phantom(PythFeeRecipient.reified());
  }
  static get p() {
    return PythFeeRecipient.phantom();
  }

  static get bcs() {
    return bcs.struct("PythFeeRecipient", {
      recipient: bcs
        .bytes(32)
        .transform({
          input: (val: string) => fromHEX(val),
          output: (val: Uint8Array) => toHEX(val),
        }),
    });
  }

  static fromFields(fields: Record<string, any>): PythFeeRecipient {
    return PythFeeRecipient.reified().new({
      recipient: decodeFromFields("address", fields.recipient),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PythFeeRecipient {
    if (!isPythFeeRecipient(item.type)) {
      throw new Error("not a PythFeeRecipient type");
    }

    return PythFeeRecipient.reified().new({
      recipient: decodeFromFieldsWithTypes("address", item.fields.recipient),
    });
  }

  static fromBcs(data: Uint8Array): PythFeeRecipient {
    return PythFeeRecipient.fromFields(PythFeeRecipient.bcs.parse(data));
  }

  toJSONField() {
    return {
      recipient: this.recipient,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): PythFeeRecipient {
    return PythFeeRecipient.reified().new({
      recipient: decodeFromJSONField("address", field.recipient),
    });
  }

  static fromJSON(json: Record<string, any>): PythFeeRecipient {
    if (json.$typeName !== PythFeeRecipient.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return PythFeeRecipient.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): PythFeeRecipient {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPythFeeRecipient(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a PythFeeRecipient object`,
      );
    }
    return PythFeeRecipient.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<PythFeeRecipient> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching PythFeeRecipient object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isPythFeeRecipient(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a PythFeeRecipient object`);
    }
    return PythFeeRecipient.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
