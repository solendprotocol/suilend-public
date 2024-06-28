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
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== GovernanceWitness =============================== */

export function isGovernanceWitness(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::set_fee::GovernanceWitness`;
}

export interface GovernanceWitnessFields {
  dummyField: ToField<"bool">;
}

export type GovernanceWitnessReified = Reified<
  GovernanceWitness,
  GovernanceWitnessFields
>;

export class GovernanceWitness implements StructClass {
  static readonly $typeName = `${PKG_V1}::set_fee::GovernanceWitness`;
  static readonly $numTypeParams = 0;

  readonly $typeName = GovernanceWitness.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::set_fee::GovernanceWitness`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: GovernanceWitnessFields) {
    this.$fullTypeName = composeSuiType(
      GovernanceWitness.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::set_fee::GovernanceWitness`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): GovernanceWitnessReified {
    return {
      typeName: GovernanceWitness.$typeName,
      fullTypeName: composeSuiType(
        GovernanceWitness.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::set_fee::GovernanceWitness`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        GovernanceWitness.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        GovernanceWitness.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => GovernanceWitness.fromBcs(data),
      bcs: GovernanceWitness.bcs,
      fromJSONField: (field: any) => GovernanceWitness.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => GovernanceWitness.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        GovernanceWitness.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        GovernanceWitness.fetch(client, id),
      new: (fields: GovernanceWitnessFields) => {
        return new GovernanceWitness([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return GovernanceWitness.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<GovernanceWitness>> {
    return phantom(GovernanceWitness.reified());
  }
  static get p() {
    return GovernanceWitness.phantom();
  }

  static get bcs() {
    return bcs.struct("GovernanceWitness", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): GovernanceWitness {
    return GovernanceWitness.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): GovernanceWitness {
    if (!isGovernanceWitness(item.type)) {
      throw new Error("not a GovernanceWitness type");
    }

    return GovernanceWitness.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): GovernanceWitness {
    return GovernanceWitness.fromFields(GovernanceWitness.bcs.parse(data));
  }

  toJSONField() {
    return {
      dummyField: this.dummyField,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): GovernanceWitness {
    return GovernanceWitness.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): GovernanceWitness {
    if (json.$typeName !== GovernanceWitness.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return GovernanceWitness.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): GovernanceWitness {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isGovernanceWitness(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a GovernanceWitness object`,
      );
    }
    return GovernanceWitness.fromFieldsWithTypes(content);
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<GovernanceWitness> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching GovernanceWitness object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isGovernanceWitness(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a GovernanceWitness object`);
    }
    return GovernanceWitness.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== SetFee =============================== */

export function isSetFee(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::set_fee::SetFee`;
}

export interface SetFeeFields {
  amount: ToField<"u64">;
}

export type SetFeeReified = Reified<SetFee, SetFeeFields>;

export class SetFee implements StructClass {
  static readonly $typeName = `${PKG_V1}::set_fee::SetFee`;
  static readonly $numTypeParams = 0;

  readonly $typeName = SetFee.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::set_fee::SetFee`;

  readonly $typeArgs: [];

  readonly amount: ToField<"u64">;

  private constructor(typeArgs: [], fields: SetFeeFields) {
    this.$fullTypeName = composeSuiType(
      SetFee.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::set_fee::SetFee`;
    this.$typeArgs = typeArgs;

    this.amount = fields.amount;
  }

  static reified(): SetFeeReified {
    return {
      typeName: SetFee.$typeName,
      fullTypeName: composeSuiType(
        SetFee.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::set_fee::SetFee`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => SetFee.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        SetFee.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => SetFee.fromBcs(data),
      bcs: SetFee.bcs,
      fromJSONField: (field: any) => SetFee.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => SetFee.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        SetFee.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) => SetFee.fetch(client, id),
      new: (fields: SetFeeFields) => {
        return new SetFee([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return SetFee.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<SetFee>> {
    return phantom(SetFee.reified());
  }
  static get p() {
    return SetFee.phantom();
  }

  static get bcs() {
    return bcs.struct("SetFee", {
      amount: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): SetFee {
    return SetFee.reified().new({
      amount: decodeFromFields("u64", fields.amount),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): SetFee {
    if (!isSetFee(item.type)) {
      throw new Error("not a SetFee type");
    }

    return SetFee.reified().new({
      amount: decodeFromFieldsWithTypes("u64", item.fields.amount),
    });
  }

  static fromBcs(data: Uint8Array): SetFee {
    return SetFee.fromFields(SetFee.bcs.parse(data));
  }

  toJSONField() {
    return {
      amount: this.amount.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): SetFee {
    return SetFee.reified().new({
      amount: decodeFromJSONField("u64", field.amount),
    });
  }

  static fromJSON(json: Record<string, any>): SetFee {
    if (json.$typeName !== SetFee.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return SetFee.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): SetFee {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isSetFee(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a SetFee object`,
      );
    }
    return SetFee.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<SetFee> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching SetFee object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isSetFee(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a SetFee object`);
    }
    return SetFee.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
