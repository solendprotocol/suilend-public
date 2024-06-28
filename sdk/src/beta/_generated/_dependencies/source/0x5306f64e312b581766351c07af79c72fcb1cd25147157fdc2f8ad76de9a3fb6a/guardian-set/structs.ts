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
import { Guardian } from "../guardian/structs";
import { PKG_V1 } from "../index";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== GuardianSet =============================== */

export function isGuardianSet(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::guardian_set::GuardianSet`;
}

export interface GuardianSetFields {
  index: ToField<"u32">;
  guardians: ToField<Vector<Guardian>>;
  expirationTimestampMs: ToField<"u64">;
}

export type GuardianSetReified = Reified<GuardianSet, GuardianSetFields>;

export class GuardianSet implements StructClass {
  static readonly $typeName = `${PKG_V1}::guardian_set::GuardianSet`;
  static readonly $numTypeParams = 0;

  readonly $typeName = GuardianSet.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::guardian_set::GuardianSet`;

  readonly $typeArgs: [];

  readonly index: ToField<"u32">;
  readonly guardians: ToField<Vector<Guardian>>;
  readonly expirationTimestampMs: ToField<"u64">;

  private constructor(typeArgs: [], fields: GuardianSetFields) {
    this.$fullTypeName = composeSuiType(
      GuardianSet.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::guardian_set::GuardianSet`;
    this.$typeArgs = typeArgs;

    this.index = fields.index;
    this.guardians = fields.guardians;
    this.expirationTimestampMs = fields.expirationTimestampMs;
  }

  static reified(): GuardianSetReified {
    return {
      typeName: GuardianSet.$typeName,
      fullTypeName: composeSuiType(
        GuardianSet.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::guardian_set::GuardianSet`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        GuardianSet.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        GuardianSet.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => GuardianSet.fromBcs(data),
      bcs: GuardianSet.bcs,
      fromJSONField: (field: any) => GuardianSet.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => GuardianSet.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        GuardianSet.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        GuardianSet.fetch(client, id),
      new: (fields: GuardianSetFields) => {
        return new GuardianSet([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return GuardianSet.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<GuardianSet>> {
    return phantom(GuardianSet.reified());
  }
  static get p() {
    return GuardianSet.phantom();
  }

  static get bcs() {
    return bcs.struct("GuardianSet", {
      index: bcs.u32(),
      guardians: bcs.vector(Guardian.bcs),
      expiration_timestamp_ms: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): GuardianSet {
    return GuardianSet.reified().new({
      index: decodeFromFields("u32", fields.index),
      guardians: decodeFromFields(
        reified.vector(Guardian.reified()),
        fields.guardians,
      ),
      expirationTimestampMs: decodeFromFields(
        "u64",
        fields.expiration_timestamp_ms,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): GuardianSet {
    if (!isGuardianSet(item.type)) {
      throw new Error("not a GuardianSet type");
    }

    return GuardianSet.reified().new({
      index: decodeFromFieldsWithTypes("u32", item.fields.index),
      guardians: decodeFromFieldsWithTypes(
        reified.vector(Guardian.reified()),
        item.fields.guardians,
      ),
      expirationTimestampMs: decodeFromFieldsWithTypes(
        "u64",
        item.fields.expiration_timestamp_ms,
      ),
    });
  }

  static fromBcs(data: Uint8Array): GuardianSet {
    return GuardianSet.fromFields(GuardianSet.bcs.parse(data));
  }

  toJSONField() {
    return {
      index: this.index,
      guardians: fieldToJSON<Vector<Guardian>>(
        `vector<${Guardian.$typeName}>`,
        this.guardians,
      ),
      expirationTimestampMs: this.expirationTimestampMs.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): GuardianSet {
    return GuardianSet.reified().new({
      index: decodeFromJSONField("u32", field.index),
      guardians: decodeFromJSONField(
        reified.vector(Guardian.reified()),
        field.guardians,
      ),
      expirationTimestampMs: decodeFromJSONField(
        "u64",
        field.expirationTimestampMs,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): GuardianSet {
    if (json.$typeName !== GuardianSet.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return GuardianSet.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): GuardianSet {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isGuardianSet(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a GuardianSet object`,
      );
    }
    return GuardianSet.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<GuardianSet> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching GuardianSet object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isGuardianSet(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a GuardianSet object`);
    }
    return GuardianSet.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
