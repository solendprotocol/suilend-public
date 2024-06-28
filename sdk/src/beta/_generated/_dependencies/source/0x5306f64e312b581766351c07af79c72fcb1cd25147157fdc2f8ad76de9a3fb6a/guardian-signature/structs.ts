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
import { Bytes32 } from "../bytes32/structs";
import { PKG_V1 } from "../index";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== GuardianSignature =============================== */

export function isGuardianSignature(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::guardian_signature::GuardianSignature`;
}

export interface GuardianSignatureFields {
  r: ToField<Bytes32>;
  s: ToField<Bytes32>;
  recoveryId: ToField<"u8">;
  index: ToField<"u8">;
}

export type GuardianSignatureReified = Reified<
  GuardianSignature,
  GuardianSignatureFields
>;

export class GuardianSignature implements StructClass {
  static readonly $typeName = `${PKG_V1}::guardian_signature::GuardianSignature`;
  static readonly $numTypeParams = 0;

  readonly $typeName = GuardianSignature.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::guardian_signature::GuardianSignature`;

  readonly $typeArgs: [];

  readonly r: ToField<Bytes32>;
  readonly s: ToField<Bytes32>;
  readonly recoveryId: ToField<"u8">;
  readonly index: ToField<"u8">;

  private constructor(typeArgs: [], fields: GuardianSignatureFields) {
    this.$fullTypeName = composeSuiType(
      GuardianSignature.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::guardian_signature::GuardianSignature`;
    this.$typeArgs = typeArgs;

    this.r = fields.r;
    this.s = fields.s;
    this.recoveryId = fields.recoveryId;
    this.index = fields.index;
  }

  static reified(): GuardianSignatureReified {
    return {
      typeName: GuardianSignature.$typeName,
      fullTypeName: composeSuiType(
        GuardianSignature.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::guardian_signature::GuardianSignature`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        GuardianSignature.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        GuardianSignature.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => GuardianSignature.fromBcs(data),
      bcs: GuardianSignature.bcs,
      fromJSONField: (field: any) => GuardianSignature.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => GuardianSignature.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        GuardianSignature.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        GuardianSignature.fetch(client, id),
      new: (fields: GuardianSignatureFields) => {
        return new GuardianSignature([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return GuardianSignature.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<GuardianSignature>> {
    return phantom(GuardianSignature.reified());
  }
  static get p() {
    return GuardianSignature.phantom();
  }

  static get bcs() {
    return bcs.struct("GuardianSignature", {
      r: Bytes32.bcs,
      s: Bytes32.bcs,
      recovery_id: bcs.u8(),
      index: bcs.u8(),
    });
  }

  static fromFields(fields: Record<string, any>): GuardianSignature {
    return GuardianSignature.reified().new({
      r: decodeFromFields(Bytes32.reified(), fields.r),
      s: decodeFromFields(Bytes32.reified(), fields.s),
      recoveryId: decodeFromFields("u8", fields.recovery_id),
      index: decodeFromFields("u8", fields.index),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): GuardianSignature {
    if (!isGuardianSignature(item.type)) {
      throw new Error("not a GuardianSignature type");
    }

    return GuardianSignature.reified().new({
      r: decodeFromFieldsWithTypes(Bytes32.reified(), item.fields.r),
      s: decodeFromFieldsWithTypes(Bytes32.reified(), item.fields.s),
      recoveryId: decodeFromFieldsWithTypes("u8", item.fields.recovery_id),
      index: decodeFromFieldsWithTypes("u8", item.fields.index),
    });
  }

  static fromBcs(data: Uint8Array): GuardianSignature {
    return GuardianSignature.fromFields(GuardianSignature.bcs.parse(data));
  }

  toJSONField() {
    return {
      r: this.r.toJSONField(),
      s: this.s.toJSONField(),
      recoveryId: this.recoveryId,
      index: this.index,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): GuardianSignature {
    return GuardianSignature.reified().new({
      r: decodeFromJSONField(Bytes32.reified(), field.r),
      s: decodeFromJSONField(Bytes32.reified(), field.s),
      recoveryId: decodeFromJSONField("u8", field.recoveryId),
      index: decodeFromJSONField("u8", field.index),
    });
  }

  static fromJSON(json: Record<string, any>): GuardianSignature {
    if (json.$typeName !== GuardianSignature.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return GuardianSignature.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): GuardianSignature {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isGuardianSignature(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a GuardianSignature object`,
      );
    }
    return GuardianSignature.fromFieldsWithTypes(content);
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<GuardianSignature> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching GuardianSignature object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isGuardianSignature(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a GuardianSignature object`);
    }
    return GuardianSignature.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
