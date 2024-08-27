import * as reified from "../../../../_framework/reified";
import {
  PhantomReified,
  Reified,
  StructClass,
  ToField,
  ToTypeStr,
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
import { Vector } from "../../../../_framework/vector";
import { Bytes32 } from "../bytes32/structs";
import { ExternalAddress } from "../external-address/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== VAA =============================== */

export function isVAA(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::vaa::VAA`;
}

export interface VAAFields {
  guardianSetIndex: ToField<"u32">;
  timestamp: ToField<"u32">;
  nonce: ToField<"u32">;
  emitterChain: ToField<"u16">;
  emitterAddress: ToField<ExternalAddress>;
  sequence: ToField<"u64">;
  consistencyLevel: ToField<"u8">;
  payload: ToField<Vector<"u8">>;
  digest: ToField<Bytes32>;
}

export type VAAReified = Reified<VAA, VAAFields>;

export class VAA implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::vaa::VAA`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = VAA.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::vaa::VAA`;
  readonly $typeArgs: [];
  readonly $isPhantom = VAA.$isPhantom;

  readonly guardianSetIndex: ToField<"u32">;
  readonly timestamp: ToField<"u32">;
  readonly nonce: ToField<"u32">;
  readonly emitterChain: ToField<"u16">;
  readonly emitterAddress: ToField<ExternalAddress>;
  readonly sequence: ToField<"u64">;
  readonly consistencyLevel: ToField<"u8">;
  readonly payload: ToField<Vector<"u8">>;
  readonly digest: ToField<Bytes32>;

  private constructor(typeArgs: [], fields: VAAFields) {
    this.$fullTypeName = composeSuiType(
      VAA.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::vaa::VAA`;
    this.$typeArgs = typeArgs;

    this.guardianSetIndex = fields.guardianSetIndex;
    this.timestamp = fields.timestamp;
    this.nonce = fields.nonce;
    this.emitterChain = fields.emitterChain;
    this.emitterAddress = fields.emitterAddress;
    this.sequence = fields.sequence;
    this.consistencyLevel = fields.consistencyLevel;
    this.payload = fields.payload;
    this.digest = fields.digest;
  }

  static reified(): VAAReified {
    return {
      typeName: VAA.$typeName,
      fullTypeName: composeSuiType(
        VAA.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::vaa::VAA`,
      typeArgs: [] as [],
      isPhantom: VAA.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => VAA.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        VAA.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => VAA.fromBcs(data),
      bcs: VAA.bcs,
      fromJSONField: (field: any) => VAA.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => VAA.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        VAA.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        VAA.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) => VAA.fetch(client, id),
      new: (fields: VAAFields) => {
        return new VAA([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return VAA.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<VAA>> {
    return phantom(VAA.reified());
  }
  static get p() {
    return VAA.phantom();
  }

  static get bcs() {
    return bcs.struct("VAA", {
      guardian_set_index: bcs.u32(),
      timestamp: bcs.u32(),
      nonce: bcs.u32(),
      emitter_chain: bcs.u16(),
      emitter_address: ExternalAddress.bcs,
      sequence: bcs.u64(),
      consistency_level: bcs.u8(),
      payload: bcs.vector(bcs.u8()),
      digest: Bytes32.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): VAA {
    return VAA.reified().new({
      guardianSetIndex: decodeFromFields("u32", fields.guardian_set_index),
      timestamp: decodeFromFields("u32", fields.timestamp),
      nonce: decodeFromFields("u32", fields.nonce),
      emitterChain: decodeFromFields("u16", fields.emitter_chain),
      emitterAddress: decodeFromFields(
        ExternalAddress.reified(),
        fields.emitter_address,
      ),
      sequence: decodeFromFields("u64", fields.sequence),
      consistencyLevel: decodeFromFields("u8", fields.consistency_level),
      payload: decodeFromFields(reified.vector("u8"), fields.payload),
      digest: decodeFromFields(Bytes32.reified(), fields.digest),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): VAA {
    if (!isVAA(item.type)) {
      throw new Error("not a VAA type");
    }

    return VAA.reified().new({
      guardianSetIndex: decodeFromFieldsWithTypes(
        "u32",
        item.fields.guardian_set_index,
      ),
      timestamp: decodeFromFieldsWithTypes("u32", item.fields.timestamp),
      nonce: decodeFromFieldsWithTypes("u32", item.fields.nonce),
      emitterChain: decodeFromFieldsWithTypes("u16", item.fields.emitter_chain),
      emitterAddress: decodeFromFieldsWithTypes(
        ExternalAddress.reified(),
        item.fields.emitter_address,
      ),
      sequence: decodeFromFieldsWithTypes("u64", item.fields.sequence),
      consistencyLevel: decodeFromFieldsWithTypes(
        "u8",
        item.fields.consistency_level,
      ),
      payload: decodeFromFieldsWithTypes(
        reified.vector("u8"),
        item.fields.payload,
      ),
      digest: decodeFromFieldsWithTypes(Bytes32.reified(), item.fields.digest),
    });
  }

  static fromBcs(data: Uint8Array): VAA {
    return VAA.fromFields(VAA.bcs.parse(data));
  }

  toJSONField() {
    return {
      guardianSetIndex: this.guardianSetIndex,
      timestamp: this.timestamp,
      nonce: this.nonce,
      emitterChain: this.emitterChain,
      emitterAddress: this.emitterAddress.toJSONField(),
      sequence: this.sequence.toString(),
      consistencyLevel: this.consistencyLevel,
      payload: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.payload),
      digest: this.digest.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): VAA {
    return VAA.reified().new({
      guardianSetIndex: decodeFromJSONField("u32", field.guardianSetIndex),
      timestamp: decodeFromJSONField("u32", field.timestamp),
      nonce: decodeFromJSONField("u32", field.nonce),
      emitterChain: decodeFromJSONField("u16", field.emitterChain),
      emitterAddress: decodeFromJSONField(
        ExternalAddress.reified(),
        field.emitterAddress,
      ),
      sequence: decodeFromJSONField("u64", field.sequence),
      consistencyLevel: decodeFromJSONField("u8", field.consistencyLevel),
      payload: decodeFromJSONField(reified.vector("u8"), field.payload),
      digest: decodeFromJSONField(Bytes32.reified(), field.digest),
    });
  }

  static fromJSON(json: Record<string, any>): VAA {
    if (json.$typeName !== VAA.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return VAA.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): VAA {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isVAA(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a VAA object`,
      );
    }
    return VAA.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): VAA {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isVAA(data.bcs.type)) {
        throw new Error(`object at is not a VAA object`);
      }

      return VAA.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return VAA.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<VAA> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching VAA object at id ${id}: ${res.error.code}`,
      );
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isVAA(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a VAA object`);
    }

    return VAA.fromSuiObjectData(res.data);
  }
}
