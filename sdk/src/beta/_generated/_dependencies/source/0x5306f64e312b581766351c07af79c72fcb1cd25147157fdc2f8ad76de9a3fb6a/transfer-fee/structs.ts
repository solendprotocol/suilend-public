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
import { fromB64, fromHEX, toHEX } from "@mysten/sui/utils";

/* ============================== GovernanceWitness =============================== */

export function isGovernanceWitness(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::transfer_fee::GovernanceWitness`;
}

export interface GovernanceWitnessFields {
  dummyField: ToField<"bool">;
}

export type GovernanceWitnessReified = Reified<
  GovernanceWitness,
  GovernanceWitnessFields
>;

export class GovernanceWitness implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::transfer_fee::GovernanceWitness`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = GovernanceWitness.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::transfer_fee::GovernanceWitness`;
  readonly $typeArgs: [];
  readonly $isPhantom = GovernanceWitness.$isPhantom;

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: GovernanceWitnessFields) {
    this.$fullTypeName = composeSuiType(
      GovernanceWitness.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::transfer_fee::GovernanceWitness`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): GovernanceWitnessReified {
    return {
      typeName: GovernanceWitness.$typeName,
      fullTypeName: composeSuiType(
        GovernanceWitness.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::transfer_fee::GovernanceWitness`,
      typeArgs: [] as [],
      isPhantom: GovernanceWitness.$isPhantom,
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
      fromSuiObjectData: (content: SuiObjectData) =>
        GovernanceWitness.fromSuiObjectData(content),
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

  static fromSuiObjectData(data: SuiObjectData): GovernanceWitness {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isGovernanceWitness(data.bcs.type)
      ) {
        throw new Error(`object at is not a GovernanceWitness object`);
      }

      return GovernanceWitness.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return GovernanceWitness.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
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

    return GovernanceWitness.fromSuiObjectData(res.data);
  }
}

/* ============================== TransferFee =============================== */

export function isTransferFee(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::transfer_fee::TransferFee`;
}

export interface TransferFeeFields {
  amount: ToField<"u64">;
  recipient: ToField<"address">;
}

export type TransferFeeReified = Reified<TransferFee, TransferFeeFields>;

export class TransferFee implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::transfer_fee::TransferFee`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = TransferFee.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::transfer_fee::TransferFee`;
  readonly $typeArgs: [];
  readonly $isPhantom = TransferFee.$isPhantom;

  readonly amount: ToField<"u64">;
  readonly recipient: ToField<"address">;

  private constructor(typeArgs: [], fields: TransferFeeFields) {
    this.$fullTypeName = composeSuiType(
      TransferFee.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::transfer_fee::TransferFee`;
    this.$typeArgs = typeArgs;

    this.amount = fields.amount;
    this.recipient = fields.recipient;
  }

  static reified(): TransferFeeReified {
    return {
      typeName: TransferFee.$typeName,
      fullTypeName: composeSuiType(
        TransferFee.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::transfer_fee::TransferFee`,
      typeArgs: [] as [],
      isPhantom: TransferFee.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        TransferFee.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        TransferFee.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => TransferFee.fromBcs(data),
      bcs: TransferFee.bcs,
      fromJSONField: (field: any) => TransferFee.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => TransferFee.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        TransferFee.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        TransferFee.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        TransferFee.fetch(client, id),
      new: (fields: TransferFeeFields) => {
        return new TransferFee([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return TransferFee.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<TransferFee>> {
    return phantom(TransferFee.reified());
  }
  static get p() {
    return TransferFee.phantom();
  }

  static get bcs() {
    return bcs.struct("TransferFee", {
      amount: bcs.u64(),
      recipient: bcs
        .bytes(32)
        .transform({
          input: (val: string) => fromHEX(val),
          output: (val: Uint8Array) => toHEX(val),
        }),
    });
  }

  static fromFields(fields: Record<string, any>): TransferFee {
    return TransferFee.reified().new({
      amount: decodeFromFields("u64", fields.amount),
      recipient: decodeFromFields("address", fields.recipient),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): TransferFee {
    if (!isTransferFee(item.type)) {
      throw new Error("not a TransferFee type");
    }

    return TransferFee.reified().new({
      amount: decodeFromFieldsWithTypes("u64", item.fields.amount),
      recipient: decodeFromFieldsWithTypes("address", item.fields.recipient),
    });
  }

  static fromBcs(data: Uint8Array): TransferFee {
    return TransferFee.fromFields(TransferFee.bcs.parse(data));
  }

  toJSONField() {
    return {
      amount: this.amount.toString(),
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

  static fromJSONField(field: any): TransferFee {
    return TransferFee.reified().new({
      amount: decodeFromJSONField("u64", field.amount),
      recipient: decodeFromJSONField("address", field.recipient),
    });
  }

  static fromJSON(json: Record<string, any>): TransferFee {
    if (json.$typeName !== TransferFee.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return TransferFee.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): TransferFee {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isTransferFee(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a TransferFee object`,
      );
    }
    return TransferFee.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): TransferFee {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isTransferFee(data.bcs.type)) {
        throw new Error(`object at is not a TransferFee object`);
      }

      return TransferFee.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return TransferFee.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<TransferFee> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching TransferFee object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isTransferFee(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a TransferFee object`);
    }

    return TransferFee.fromSuiObjectData(res.data);
  }
}
