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
import { UID } from "../../0x2/object/structs";
import { UpgradeCap } from "../../0x2/package/structs";
import { ConsumedVAAs } from "../../0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a/consumed-vaas/structs";
import { DataSource } from "../data-source/structs";
import { PKG_V1 } from "../index";
import { bcs, fromB64, fromHEX, toHEX } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== LatestOnly =============================== */

export function isLatestOnly(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::state::LatestOnly`;
}

export interface LatestOnlyFields {
  dummyField: ToField<"bool">;
}

export type LatestOnlyReified = Reified<LatestOnly, LatestOnlyFields>;

export class LatestOnly implements StructClass {
  static readonly $typeName = `${PKG_V1}::state::LatestOnly`;
  static readonly $numTypeParams = 0;

  readonly $typeName = LatestOnly.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::state::LatestOnly`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: LatestOnlyFields) {
    this.$fullTypeName = composeSuiType(
      LatestOnly.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::state::LatestOnly`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): LatestOnlyReified {
    return {
      typeName: LatestOnly.$typeName,
      fullTypeName: composeSuiType(
        LatestOnly.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::state::LatestOnly`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        LatestOnly.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        LatestOnly.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => LatestOnly.fromBcs(data),
      bcs: LatestOnly.bcs,
      fromJSONField: (field: any) => LatestOnly.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => LatestOnly.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        LatestOnly.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        LatestOnly.fetch(client, id),
      new: (fields: LatestOnlyFields) => {
        return new LatestOnly([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return LatestOnly.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<LatestOnly>> {
    return phantom(LatestOnly.reified());
  }
  static get p() {
    return LatestOnly.phantom();
  }

  static get bcs() {
    return bcs.struct("LatestOnly", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): LatestOnly {
    return LatestOnly.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): LatestOnly {
    if (!isLatestOnly(item.type)) {
      throw new Error("not a LatestOnly type");
    }

    return LatestOnly.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): LatestOnly {
    return LatestOnly.fromFields(LatestOnly.bcs.parse(data));
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

  static fromJSONField(field: any): LatestOnly {
    return LatestOnly.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): LatestOnly {
    if (json.$typeName !== LatestOnly.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return LatestOnly.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): LatestOnly {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isLatestOnly(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a LatestOnly object`,
      );
    }
    return LatestOnly.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<LatestOnly> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching LatestOnly object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isLatestOnly(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a LatestOnly object`);
    }
    return LatestOnly.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== State =============================== */

export function isState(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::state::State`;
}

export interface StateFields {
  id: ToField<UID>;
  governanceDataSource: ToField<DataSource>;
  stalePriceThreshold: ToField<"u64">;
  baseUpdateFee: ToField<"u64">;
  feeRecipientAddress: ToField<"address">;
  lastExecutedGovernanceSequence: ToField<"u64">;
  consumedVaas: ToField<ConsumedVAAs>;
  upgradeCap: ToField<UpgradeCap>;
}

export type StateReified = Reified<State, StateFields>;

export class State implements StructClass {
  static readonly $typeName = `${PKG_V1}::state::State`;
  static readonly $numTypeParams = 0;

  readonly $typeName = State.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::state::State`;

  readonly $typeArgs: [];

  readonly id: ToField<UID>;
  readonly governanceDataSource: ToField<DataSource>;
  readonly stalePriceThreshold: ToField<"u64">;
  readonly baseUpdateFee: ToField<"u64">;
  readonly feeRecipientAddress: ToField<"address">;
  readonly lastExecutedGovernanceSequence: ToField<"u64">;
  readonly consumedVaas: ToField<ConsumedVAAs>;
  readonly upgradeCap: ToField<UpgradeCap>;

  private constructor(typeArgs: [], fields: StateFields) {
    this.$fullTypeName = composeSuiType(
      State.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::state::State`;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.governanceDataSource = fields.governanceDataSource;
    this.stalePriceThreshold = fields.stalePriceThreshold;
    this.baseUpdateFee = fields.baseUpdateFee;
    this.feeRecipientAddress = fields.feeRecipientAddress;
    this.lastExecutedGovernanceSequence = fields.lastExecutedGovernanceSequence;
    this.consumedVaas = fields.consumedVaas;
    this.upgradeCap = fields.upgradeCap;
  }

  static reified(): StateReified {
    return {
      typeName: State.$typeName,
      fullTypeName: composeSuiType(
        State.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::state::State`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => State.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        State.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => State.fromBcs(data),
      bcs: State.bcs,
      fromJSONField: (field: any) => State.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => State.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        State.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) => State.fetch(client, id),
      new: (fields: StateFields) => {
        return new State([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return State.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<State>> {
    return phantom(State.reified());
  }
  static get p() {
    return State.phantom();
  }

  static get bcs() {
    return bcs.struct("State", {
      id: UID.bcs,
      governance_data_source: DataSource.bcs,
      stale_price_threshold: bcs.u64(),
      base_update_fee: bcs.u64(),
      fee_recipient_address: bcs
        .bytes(32)
        .transform({
          input: (val: string) => fromHEX(val),
          output: (val: Uint8Array) => toHEX(val),
        }),
      last_executed_governance_sequence: bcs.u64(),
      consumed_vaas: ConsumedVAAs.bcs,
      upgrade_cap: UpgradeCap.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): State {
    return State.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      governanceDataSource: decodeFromFields(
        DataSource.reified(),
        fields.governance_data_source,
      ),
      stalePriceThreshold: decodeFromFields(
        "u64",
        fields.stale_price_threshold,
      ),
      baseUpdateFee: decodeFromFields("u64", fields.base_update_fee),
      feeRecipientAddress: decodeFromFields(
        "address",
        fields.fee_recipient_address,
      ),
      lastExecutedGovernanceSequence: decodeFromFields(
        "u64",
        fields.last_executed_governance_sequence,
      ),
      consumedVaas: decodeFromFields(
        ConsumedVAAs.reified(),
        fields.consumed_vaas,
      ),
      upgradeCap: decodeFromFields(UpgradeCap.reified(), fields.upgrade_cap),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): State {
    if (!isState(item.type)) {
      throw new Error("not a State type");
    }

    return State.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      governanceDataSource: decodeFromFieldsWithTypes(
        DataSource.reified(),
        item.fields.governance_data_source,
      ),
      stalePriceThreshold: decodeFromFieldsWithTypes(
        "u64",
        item.fields.stale_price_threshold,
      ),
      baseUpdateFee: decodeFromFieldsWithTypes(
        "u64",
        item.fields.base_update_fee,
      ),
      feeRecipientAddress: decodeFromFieldsWithTypes(
        "address",
        item.fields.fee_recipient_address,
      ),
      lastExecutedGovernanceSequence: decodeFromFieldsWithTypes(
        "u64",
        item.fields.last_executed_governance_sequence,
      ),
      consumedVaas: decodeFromFieldsWithTypes(
        ConsumedVAAs.reified(),
        item.fields.consumed_vaas,
      ),
      upgradeCap: decodeFromFieldsWithTypes(
        UpgradeCap.reified(),
        item.fields.upgrade_cap,
      ),
    });
  }

  static fromBcs(data: Uint8Array): State {
    return State.fromFields(State.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      governanceDataSource: this.governanceDataSource.toJSONField(),
      stalePriceThreshold: this.stalePriceThreshold.toString(),
      baseUpdateFee: this.baseUpdateFee.toString(),
      feeRecipientAddress: this.feeRecipientAddress,
      lastExecutedGovernanceSequence:
        this.lastExecutedGovernanceSequence.toString(),
      consumedVaas: this.consumedVaas.toJSONField(),
      upgradeCap: this.upgradeCap.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): State {
    return State.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      governanceDataSource: decodeFromJSONField(
        DataSource.reified(),
        field.governanceDataSource,
      ),
      stalePriceThreshold: decodeFromJSONField(
        "u64",
        field.stalePriceThreshold,
      ),
      baseUpdateFee: decodeFromJSONField("u64", field.baseUpdateFee),
      feeRecipientAddress: decodeFromJSONField(
        "address",
        field.feeRecipientAddress,
      ),
      lastExecutedGovernanceSequence: decodeFromJSONField(
        "u64",
        field.lastExecutedGovernanceSequence,
      ),
      consumedVaas: decodeFromJSONField(
        ConsumedVAAs.reified(),
        field.consumedVaas,
      ),
      upgradeCap: decodeFromJSONField(UpgradeCap.reified(), field.upgradeCap),
    });
  }

  static fromJSON(json: Record<string, any>): State {
    if (json.$typeName !== State.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return State.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): State {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isState(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a State object`,
      );
    }
    return State.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<State> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching State object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isState(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a State object`);
    }
    return State.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== CurrentDigest =============================== */

export function isCurrentDigest(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::state::CurrentDigest`;
}

export interface CurrentDigestFields {
  dummyField: ToField<"bool">;
}

export type CurrentDigestReified = Reified<CurrentDigest, CurrentDigestFields>;

export class CurrentDigest implements StructClass {
  static readonly $typeName = `${PKG_V1}::state::CurrentDigest`;
  static readonly $numTypeParams = 0;

  readonly $typeName = CurrentDigest.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::state::CurrentDigest`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: CurrentDigestFields) {
    this.$fullTypeName = composeSuiType(
      CurrentDigest.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::state::CurrentDigest`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): CurrentDigestReified {
    return {
      typeName: CurrentDigest.$typeName,
      fullTypeName: composeSuiType(
        CurrentDigest.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::state::CurrentDigest`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        CurrentDigest.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        CurrentDigest.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => CurrentDigest.fromBcs(data),
      bcs: CurrentDigest.bcs,
      fromJSONField: (field: any) => CurrentDigest.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => CurrentDigest.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        CurrentDigest.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        CurrentDigest.fetch(client, id),
      new: (fields: CurrentDigestFields) => {
        return new CurrentDigest([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return CurrentDigest.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<CurrentDigest>> {
    return phantom(CurrentDigest.reified());
  }
  static get p() {
    return CurrentDigest.phantom();
  }

  static get bcs() {
    return bcs.struct("CurrentDigest", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): CurrentDigest {
    return CurrentDigest.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): CurrentDigest {
    if (!isCurrentDigest(item.type)) {
      throw new Error("not a CurrentDigest type");
    }

    return CurrentDigest.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): CurrentDigest {
    return CurrentDigest.fromFields(CurrentDigest.bcs.parse(data));
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

  static fromJSONField(field: any): CurrentDigest {
    return CurrentDigest.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): CurrentDigest {
    if (json.$typeName !== CurrentDigest.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return CurrentDigest.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): CurrentDigest {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isCurrentDigest(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a CurrentDigest object`,
      );
    }
    return CurrentDigest.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<CurrentDigest> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching CurrentDigest object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isCurrentDigest(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a CurrentDigest object`);
    }
    return CurrentDigest.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
