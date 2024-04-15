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
  phantom,
  ToTypeStr as ToPhantom,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { UID } from "../../0x2/object/structs";
import { UpgradeCap } from "../../0x2/package/structs";
import { Table } from "../../0x2/table/structs";
import { ConsumedVAAs } from "../consumed-vaas/structs";
import { ExternalAddress } from "../external-address/structs";
import { FeeCollector } from "../fee-collector/structs";
import { GuardianSet } from "../guardian-set/structs";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== LatestOnly =============================== */

export function isLatestOnly(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::state::LatestOnly"
  );
}

export interface LatestOnlyFields {
  dummyField: ToField<"bool">;
}

export type LatestOnlyReified = Reified<LatestOnly, LatestOnlyFields>;

export class LatestOnly implements StructClass {
  static readonly $typeName =
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::state::LatestOnly";
  static readonly $numTypeParams = 0;

  readonly $typeName = LatestOnly.$typeName;

  readonly $fullTypeName: "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::state::LatestOnly";

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: LatestOnlyFields) {
    this.$fullTypeName = composeSuiType(
      LatestOnly.$typeName,
      ...typeArgs,
    ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::state::LatestOnly";
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): LatestOnlyReified {
    return {
      typeName: LatestOnly.$typeName,
      fullTypeName: composeSuiType(
        LatestOnly.$typeName,
        ...[],
      ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::state::LatestOnly",
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
  return (
    type ===
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::state::State"
  );
}

export interface StateFields {
  id: ToField<UID>;
  governanceChain: ToField<"u16">;
  governanceContract: ToField<ExternalAddress>;
  guardianSetIndex: ToField<"u32">;
  guardianSets: ToField<Table<"u32", ToPhantom<GuardianSet>>>;
  guardianSetSecondsToLive: ToField<"u32">;
  consumedVaas: ToField<ConsumedVAAs>;
  feeCollector: ToField<FeeCollector>;
  upgradeCap: ToField<UpgradeCap>;
}

export type StateReified = Reified<State, StateFields>;

export class State implements StructClass {
  static readonly $typeName =
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::state::State";
  static readonly $numTypeParams = 0;

  readonly $typeName = State.$typeName;

  readonly $fullTypeName: "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::state::State";

  readonly $typeArgs: [];

  readonly id: ToField<UID>;
  readonly governanceChain: ToField<"u16">;
  readonly governanceContract: ToField<ExternalAddress>;
  readonly guardianSetIndex: ToField<"u32">;
  readonly guardianSets: ToField<Table<"u32", ToPhantom<GuardianSet>>>;
  readonly guardianSetSecondsToLive: ToField<"u32">;
  readonly consumedVaas: ToField<ConsumedVAAs>;
  readonly feeCollector: ToField<FeeCollector>;
  readonly upgradeCap: ToField<UpgradeCap>;

  private constructor(typeArgs: [], fields: StateFields) {
    this.$fullTypeName = composeSuiType(
      State.$typeName,
      ...typeArgs,
    ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::state::State";
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.governanceChain = fields.governanceChain;
    this.governanceContract = fields.governanceContract;
    this.guardianSetIndex = fields.guardianSetIndex;
    this.guardianSets = fields.guardianSets;
    this.guardianSetSecondsToLive = fields.guardianSetSecondsToLive;
    this.consumedVaas = fields.consumedVaas;
    this.feeCollector = fields.feeCollector;
    this.upgradeCap = fields.upgradeCap;
  }

  static reified(): StateReified {
    return {
      typeName: State.$typeName,
      fullTypeName: composeSuiType(
        State.$typeName,
        ...[],
      ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::state::State",
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
      governance_chain: bcs.u16(),
      governance_contract: ExternalAddress.bcs,
      guardian_set_index: bcs.u32(),
      guardian_sets: Table.bcs,
      guardian_set_seconds_to_live: bcs.u32(),
      consumed_vaas: ConsumedVAAs.bcs,
      fee_collector: FeeCollector.bcs,
      upgrade_cap: UpgradeCap.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): State {
    return State.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      governanceChain: decodeFromFields("u16", fields.governance_chain),
      governanceContract: decodeFromFields(
        ExternalAddress.reified(),
        fields.governance_contract,
      ),
      guardianSetIndex: decodeFromFields("u32", fields.guardian_set_index),
      guardianSets: decodeFromFields(
        Table.reified(
          reified.phantom("u32"),
          reified.phantom(GuardianSet.reified()),
        ),
        fields.guardian_sets,
      ),
      guardianSetSecondsToLive: decodeFromFields(
        "u32",
        fields.guardian_set_seconds_to_live,
      ),
      consumedVaas: decodeFromFields(
        ConsumedVAAs.reified(),
        fields.consumed_vaas,
      ),
      feeCollector: decodeFromFields(
        FeeCollector.reified(),
        fields.fee_collector,
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
      governanceChain: decodeFromFieldsWithTypes(
        "u16",
        item.fields.governance_chain,
      ),
      governanceContract: decodeFromFieldsWithTypes(
        ExternalAddress.reified(),
        item.fields.governance_contract,
      ),
      guardianSetIndex: decodeFromFieldsWithTypes(
        "u32",
        item.fields.guardian_set_index,
      ),
      guardianSets: decodeFromFieldsWithTypes(
        Table.reified(
          reified.phantom("u32"),
          reified.phantom(GuardianSet.reified()),
        ),
        item.fields.guardian_sets,
      ),
      guardianSetSecondsToLive: decodeFromFieldsWithTypes(
        "u32",
        item.fields.guardian_set_seconds_to_live,
      ),
      consumedVaas: decodeFromFieldsWithTypes(
        ConsumedVAAs.reified(),
        item.fields.consumed_vaas,
      ),
      feeCollector: decodeFromFieldsWithTypes(
        FeeCollector.reified(),
        item.fields.fee_collector,
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
      governanceChain: this.governanceChain,
      governanceContract: this.governanceContract.toJSONField(),
      guardianSetIndex: this.guardianSetIndex,
      guardianSets: this.guardianSets.toJSONField(),
      guardianSetSecondsToLive: this.guardianSetSecondsToLive,
      consumedVaas: this.consumedVaas.toJSONField(),
      feeCollector: this.feeCollector.toJSONField(),
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
      governanceChain: decodeFromJSONField("u16", field.governanceChain),
      governanceContract: decodeFromJSONField(
        ExternalAddress.reified(),
        field.governanceContract,
      ),
      guardianSetIndex: decodeFromJSONField("u32", field.guardianSetIndex),
      guardianSets: decodeFromJSONField(
        Table.reified(
          reified.phantom("u32"),
          reified.phantom(GuardianSet.reified()),
        ),
        field.guardianSets,
      ),
      guardianSetSecondsToLive: decodeFromJSONField(
        "u32",
        field.guardianSetSecondsToLive,
      ),
      consumedVaas: decodeFromJSONField(
        ConsumedVAAs.reified(),
        field.consumedVaas,
      ),
      feeCollector: decodeFromJSONField(
        FeeCollector.reified(),
        field.feeCollector,
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
