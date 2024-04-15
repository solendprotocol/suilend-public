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
import { Bytes32 } from "../../0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a/bytes32/structs";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== WormholeVAAVerificationReceipt =============================== */

export function isWormholeVAAVerificationReceipt(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::governance::WormholeVAAVerificationReceipt"
  );
}

export interface WormholeVAAVerificationReceiptFields {
  payload: ToField<Vector<"u8">>;
  digest: ToField<Bytes32>;
  sequence: ToField<"u64">;
}

export type WormholeVAAVerificationReceiptReified = Reified<
  WormholeVAAVerificationReceipt,
  WormholeVAAVerificationReceiptFields
>;

export class WormholeVAAVerificationReceipt implements StructClass {
  static readonly $typeName =
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::governance::WormholeVAAVerificationReceipt";
  static readonly $numTypeParams = 0;

  readonly $typeName = WormholeVAAVerificationReceipt.$typeName;

  readonly $fullTypeName: "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::governance::WormholeVAAVerificationReceipt";

  readonly $typeArgs: [];

  readonly payload: ToField<Vector<"u8">>;
  readonly digest: ToField<Bytes32>;
  readonly sequence: ToField<"u64">;

  private constructor(
    typeArgs: [],
    fields: WormholeVAAVerificationReceiptFields,
  ) {
    this.$fullTypeName = composeSuiType(
      WormholeVAAVerificationReceipt.$typeName,
      ...typeArgs,
    ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::governance::WormholeVAAVerificationReceipt";
    this.$typeArgs = typeArgs;

    this.payload = fields.payload;
    this.digest = fields.digest;
    this.sequence = fields.sequence;
  }

  static reified(): WormholeVAAVerificationReceiptReified {
    return {
      typeName: WormholeVAAVerificationReceipt.$typeName,
      fullTypeName: composeSuiType(
        WormholeVAAVerificationReceipt.$typeName,
        ...[],
      ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::governance::WormholeVAAVerificationReceipt",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        WormholeVAAVerificationReceipt.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        WormholeVAAVerificationReceipt.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) =>
        WormholeVAAVerificationReceipt.fromBcs(data),
      bcs: WormholeVAAVerificationReceipt.bcs,
      fromJSONField: (field: any) =>
        WormholeVAAVerificationReceipt.fromJSONField(field),
      fromJSON: (json: Record<string, any>) =>
        WormholeVAAVerificationReceipt.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        WormholeVAAVerificationReceipt.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        WormholeVAAVerificationReceipt.fetch(client, id),
      new: (fields: WormholeVAAVerificationReceiptFields) => {
        return new WormholeVAAVerificationReceipt([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return WormholeVAAVerificationReceipt.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<WormholeVAAVerificationReceipt>> {
    return phantom(WormholeVAAVerificationReceipt.reified());
  }
  static get p() {
    return WormholeVAAVerificationReceipt.phantom();
  }

  static get bcs() {
    return bcs.struct("WormholeVAAVerificationReceipt", {
      payload: bcs.vector(bcs.u8()),
      digest: Bytes32.bcs,
      sequence: bcs.u64(),
    });
  }

  static fromFields(
    fields: Record<string, any>,
  ): WormholeVAAVerificationReceipt {
    return WormholeVAAVerificationReceipt.reified().new({
      payload: decodeFromFields(reified.vector("u8"), fields.payload),
      digest: decodeFromFields(Bytes32.reified(), fields.digest),
      sequence: decodeFromFields("u64", fields.sequence),
    });
  }

  static fromFieldsWithTypes(
    item: FieldsWithTypes,
  ): WormholeVAAVerificationReceipt {
    if (!isWormholeVAAVerificationReceipt(item.type)) {
      throw new Error("not a WormholeVAAVerificationReceipt type");
    }

    return WormholeVAAVerificationReceipt.reified().new({
      payload: decodeFromFieldsWithTypes(
        reified.vector("u8"),
        item.fields.payload,
      ),
      digest: decodeFromFieldsWithTypes(Bytes32.reified(), item.fields.digest),
      sequence: decodeFromFieldsWithTypes("u64", item.fields.sequence),
    });
  }

  static fromBcs(data: Uint8Array): WormholeVAAVerificationReceipt {
    return WormholeVAAVerificationReceipt.fromFields(
      WormholeVAAVerificationReceipt.bcs.parse(data),
    );
  }

  toJSONField() {
    return {
      payload: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.payload),
      digest: this.digest.toJSONField(),
      sequence: this.sequence.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): WormholeVAAVerificationReceipt {
    return WormholeVAAVerificationReceipt.reified().new({
      payload: decodeFromJSONField(reified.vector("u8"), field.payload),
      digest: decodeFromJSONField(Bytes32.reified(), field.digest),
      sequence: decodeFromJSONField("u64", field.sequence),
    });
  }

  static fromJSON(json: Record<string, any>): WormholeVAAVerificationReceipt {
    if (json.$typeName !== WormholeVAAVerificationReceipt.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return WormholeVAAVerificationReceipt.fromJSONField(json);
  }

  static fromSuiParsedData(
    content: SuiParsedData,
  ): WormholeVAAVerificationReceipt {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isWormholeVAAVerificationReceipt(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a WormholeVAAVerificationReceipt object`,
      );
    }
    return WormholeVAAVerificationReceipt.fromFieldsWithTypes(content);
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<WormholeVAAVerificationReceipt> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching WormholeVAAVerificationReceipt object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isWormholeVAAVerificationReceipt(res.data.bcs.type)
    ) {
      throw new Error(
        `object at id ${id} is not a WormholeVAAVerificationReceipt object`,
      );
    }
    return WormholeVAAVerificationReceipt.fromBcs(
      fromB64(res.data.bcs.bcsBytes),
    );
  }
}
