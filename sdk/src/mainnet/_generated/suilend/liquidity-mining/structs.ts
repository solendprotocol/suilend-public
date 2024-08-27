import * as reified from "../../_framework/reified";
import { Option } from "../../_dependencies/source/0x1/option/structs";
import { TypeName } from "../../_dependencies/source/0x1/type-name/structs";
import { Bag } from "../../_dependencies/source/0x2/bag/structs";
import { ID, UID } from "../../_dependencies/source/0x2/object/structs";
import {
  PhantomReified,
  PhantomToTypeStr,
  PhantomTypeArgument,
  Reified,
  StructClass,
  ToField,
  ToPhantomTypeArgument,
  ToTypeStr,
  assertFieldsWithTypesArgsMatch,
  assertReifiedTypeArgsMatch,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  extractType,
  fieldToJSON,
  phantom,
} from "../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
  parseTypeName,
} from "../../_framework/util";
import { Vector } from "../../_framework/vector";
import { Decimal } from "../decimal/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== PoolReward =============================== */

export function isPoolReward(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::liquidity_mining::PoolReward`;
}

export interface PoolRewardFields {
  id: ToField<UID>;
  poolRewardManagerId: ToField<ID>;
  coinType: ToField<TypeName>;
  startTimeMs: ToField<"u64">;
  endTimeMs: ToField<"u64">;
  totalRewards: ToField<"u64">;
  allocatedRewards: ToField<Decimal>;
  cumulativeRewardsPerShare: ToField<Decimal>;
  numUserRewardManagers: ToField<"u64">;
  additionalFields: ToField<Bag>;
}

export type PoolRewardReified = Reified<PoolReward, PoolRewardFields>;

export class PoolReward implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::liquidity_mining::PoolReward`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = PoolReward.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::liquidity_mining::PoolReward`;
  readonly $typeArgs: [];
  readonly $isPhantom = PoolReward.$isPhantom;

  readonly id: ToField<UID>;
  readonly poolRewardManagerId: ToField<ID>;
  readonly coinType: ToField<TypeName>;
  readonly startTimeMs: ToField<"u64">;
  readonly endTimeMs: ToField<"u64">;
  readonly totalRewards: ToField<"u64">;
  readonly allocatedRewards: ToField<Decimal>;
  readonly cumulativeRewardsPerShare: ToField<Decimal>;
  readonly numUserRewardManagers: ToField<"u64">;
  readonly additionalFields: ToField<Bag>;

  private constructor(typeArgs: [], fields: PoolRewardFields) {
    this.$fullTypeName = composeSuiType(
      PoolReward.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::liquidity_mining::PoolReward`;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.poolRewardManagerId = fields.poolRewardManagerId;
    this.coinType = fields.coinType;
    this.startTimeMs = fields.startTimeMs;
    this.endTimeMs = fields.endTimeMs;
    this.totalRewards = fields.totalRewards;
    this.allocatedRewards = fields.allocatedRewards;
    this.cumulativeRewardsPerShare = fields.cumulativeRewardsPerShare;
    this.numUserRewardManagers = fields.numUserRewardManagers;
    this.additionalFields = fields.additionalFields;
  }

  static reified(): PoolRewardReified {
    return {
      typeName: PoolReward.$typeName,
      fullTypeName: composeSuiType(
        PoolReward.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::liquidity_mining::PoolReward`,
      typeArgs: [] as [],
      isPhantom: PoolReward.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        PoolReward.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        PoolReward.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => PoolReward.fromBcs(data),
      bcs: PoolReward.bcs,
      fromJSONField: (field: any) => PoolReward.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => PoolReward.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        PoolReward.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        PoolReward.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        PoolReward.fetch(client, id),
      new: (fields: PoolRewardFields) => {
        return new PoolReward([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PoolReward.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<PoolReward>> {
    return phantom(PoolReward.reified());
  }
  static get p() {
    return PoolReward.phantom();
  }

  static get bcs() {
    return bcs.struct("PoolReward", {
      id: UID.bcs,
      pool_reward_manager_id: ID.bcs,
      coin_type: TypeName.bcs,
      start_time_ms: bcs.u64(),
      end_time_ms: bcs.u64(),
      total_rewards: bcs.u64(),
      allocated_rewards: Decimal.bcs,
      cumulative_rewards_per_share: Decimal.bcs,
      num_user_reward_managers: bcs.u64(),
      additional_fields: Bag.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): PoolReward {
    return PoolReward.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      poolRewardManagerId: decodeFromFields(
        ID.reified(),
        fields.pool_reward_manager_id,
      ),
      coinType: decodeFromFields(TypeName.reified(), fields.coin_type),
      startTimeMs: decodeFromFields("u64", fields.start_time_ms),
      endTimeMs: decodeFromFields("u64", fields.end_time_ms),
      totalRewards: decodeFromFields("u64", fields.total_rewards),
      allocatedRewards: decodeFromFields(
        Decimal.reified(),
        fields.allocated_rewards,
      ),
      cumulativeRewardsPerShare: decodeFromFields(
        Decimal.reified(),
        fields.cumulative_rewards_per_share,
      ),
      numUserRewardManagers: decodeFromFields(
        "u64",
        fields.num_user_reward_managers,
      ),
      additionalFields: decodeFromFields(
        Bag.reified(),
        fields.additional_fields,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PoolReward {
    if (!isPoolReward(item.type)) {
      throw new Error("not a PoolReward type");
    }

    return PoolReward.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      poolRewardManagerId: decodeFromFieldsWithTypes(
        ID.reified(),
        item.fields.pool_reward_manager_id,
      ),
      coinType: decodeFromFieldsWithTypes(
        TypeName.reified(),
        item.fields.coin_type,
      ),
      startTimeMs: decodeFromFieldsWithTypes("u64", item.fields.start_time_ms),
      endTimeMs: decodeFromFieldsWithTypes("u64", item.fields.end_time_ms),
      totalRewards: decodeFromFieldsWithTypes("u64", item.fields.total_rewards),
      allocatedRewards: decodeFromFieldsWithTypes(
        Decimal.reified(),
        item.fields.allocated_rewards,
      ),
      cumulativeRewardsPerShare: decodeFromFieldsWithTypes(
        Decimal.reified(),
        item.fields.cumulative_rewards_per_share,
      ),
      numUserRewardManagers: decodeFromFieldsWithTypes(
        "u64",
        item.fields.num_user_reward_managers,
      ),
      additionalFields: decodeFromFieldsWithTypes(
        Bag.reified(),
        item.fields.additional_fields,
      ),
    });
  }

  static fromBcs(data: Uint8Array): PoolReward {
    return PoolReward.fromFields(PoolReward.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      poolRewardManagerId: this.poolRewardManagerId,
      coinType: this.coinType.toJSONField(),
      startTimeMs: this.startTimeMs.toString(),
      endTimeMs: this.endTimeMs.toString(),
      totalRewards: this.totalRewards.toString(),
      allocatedRewards: this.allocatedRewards.toJSONField(),
      cumulativeRewardsPerShare: this.cumulativeRewardsPerShare.toJSONField(),
      numUserRewardManagers: this.numUserRewardManagers.toString(),
      additionalFields: this.additionalFields.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): PoolReward {
    return PoolReward.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      poolRewardManagerId: decodeFromJSONField(
        ID.reified(),
        field.poolRewardManagerId,
      ),
      coinType: decodeFromJSONField(TypeName.reified(), field.coinType),
      startTimeMs: decodeFromJSONField("u64", field.startTimeMs),
      endTimeMs: decodeFromJSONField("u64", field.endTimeMs),
      totalRewards: decodeFromJSONField("u64", field.totalRewards),
      allocatedRewards: decodeFromJSONField(
        Decimal.reified(),
        field.allocatedRewards,
      ),
      cumulativeRewardsPerShare: decodeFromJSONField(
        Decimal.reified(),
        field.cumulativeRewardsPerShare,
      ),
      numUserRewardManagers: decodeFromJSONField(
        "u64",
        field.numUserRewardManagers,
      ),
      additionalFields: decodeFromJSONField(
        Bag.reified(),
        field.additionalFields,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): PoolReward {
    if (json.$typeName !== PoolReward.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return PoolReward.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): PoolReward {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPoolReward(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a PoolReward object`,
      );
    }
    return PoolReward.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): PoolReward {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isPoolReward(data.bcs.type)) {
        throw new Error(`object at is not a PoolReward object`);
      }

      return PoolReward.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return PoolReward.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<PoolReward> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching PoolReward object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isPoolReward(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a PoolReward object`);
    }

    return PoolReward.fromSuiObjectData(res.data);
  }
}

/* ============================== PoolRewardManager =============================== */

export function isPoolRewardManager(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::liquidity_mining::PoolRewardManager`;
}

export interface PoolRewardManagerFields {
  id: ToField<UID>;
  totalShares: ToField<"u64">;
  poolRewards: ToField<Vector<Option<PoolReward>>>;
  lastUpdateTimeMs: ToField<"u64">;
}

export type PoolRewardManagerReified = Reified<
  PoolRewardManager,
  PoolRewardManagerFields
>;

export class PoolRewardManager implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::liquidity_mining::PoolRewardManager`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = PoolRewardManager.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::liquidity_mining::PoolRewardManager`;
  readonly $typeArgs: [];
  readonly $isPhantom = PoolRewardManager.$isPhantom;

  readonly id: ToField<UID>;
  readonly totalShares: ToField<"u64">;
  readonly poolRewards: ToField<Vector<Option<PoolReward>>>;
  readonly lastUpdateTimeMs: ToField<"u64">;

  private constructor(typeArgs: [], fields: PoolRewardManagerFields) {
    this.$fullTypeName = composeSuiType(
      PoolRewardManager.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::liquidity_mining::PoolRewardManager`;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.totalShares = fields.totalShares;
    this.poolRewards = fields.poolRewards;
    this.lastUpdateTimeMs = fields.lastUpdateTimeMs;
  }

  static reified(): PoolRewardManagerReified {
    return {
      typeName: PoolRewardManager.$typeName,
      fullTypeName: composeSuiType(
        PoolRewardManager.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::liquidity_mining::PoolRewardManager`,
      typeArgs: [] as [],
      isPhantom: PoolRewardManager.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        PoolRewardManager.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        PoolRewardManager.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => PoolRewardManager.fromBcs(data),
      bcs: PoolRewardManager.bcs,
      fromJSONField: (field: any) => PoolRewardManager.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => PoolRewardManager.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        PoolRewardManager.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        PoolRewardManager.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        PoolRewardManager.fetch(client, id),
      new: (fields: PoolRewardManagerFields) => {
        return new PoolRewardManager([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PoolRewardManager.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<PoolRewardManager>> {
    return phantom(PoolRewardManager.reified());
  }
  static get p() {
    return PoolRewardManager.phantom();
  }

  static get bcs() {
    return bcs.struct("PoolRewardManager", {
      id: UID.bcs,
      total_shares: bcs.u64(),
      pool_rewards: bcs.vector(Option.bcs(PoolReward.bcs)),
      last_update_time_ms: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): PoolRewardManager {
    return PoolRewardManager.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      totalShares: decodeFromFields("u64", fields.total_shares),
      poolRewards: decodeFromFields(
        reified.vector(Option.reified(PoolReward.reified())),
        fields.pool_rewards,
      ),
      lastUpdateTimeMs: decodeFromFields("u64", fields.last_update_time_ms),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PoolRewardManager {
    if (!isPoolRewardManager(item.type)) {
      throw new Error("not a PoolRewardManager type");
    }

    return PoolRewardManager.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      totalShares: decodeFromFieldsWithTypes("u64", item.fields.total_shares),
      poolRewards: decodeFromFieldsWithTypes(
        reified.vector(Option.reified(PoolReward.reified())),
        item.fields.pool_rewards,
      ),
      lastUpdateTimeMs: decodeFromFieldsWithTypes(
        "u64",
        item.fields.last_update_time_ms,
      ),
    });
  }

  static fromBcs(data: Uint8Array): PoolRewardManager {
    return PoolRewardManager.fromFields(PoolRewardManager.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      totalShares: this.totalShares.toString(),
      poolRewards: fieldToJSON<Vector<Option<PoolReward>>>(
        `vector<${Option.$typeName}<${PoolReward.$typeName}>>`,
        this.poolRewards,
      ),
      lastUpdateTimeMs: this.lastUpdateTimeMs.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): PoolRewardManager {
    return PoolRewardManager.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      totalShares: decodeFromJSONField("u64", field.totalShares),
      poolRewards: decodeFromJSONField(
        reified.vector(Option.reified(PoolReward.reified())),
        field.poolRewards,
      ),
      lastUpdateTimeMs: decodeFromJSONField("u64", field.lastUpdateTimeMs),
    });
  }

  static fromJSON(json: Record<string, any>): PoolRewardManager {
    if (json.$typeName !== PoolRewardManager.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return PoolRewardManager.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): PoolRewardManager {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPoolRewardManager(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a PoolRewardManager object`,
      );
    }
    return PoolRewardManager.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): PoolRewardManager {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isPoolRewardManager(data.bcs.type)
      ) {
        throw new Error(`object at is not a PoolRewardManager object`);
      }

      return PoolRewardManager.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return PoolRewardManager.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<PoolRewardManager> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching PoolRewardManager object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isPoolRewardManager(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a PoolRewardManager object`);
    }

    return PoolRewardManager.fromSuiObjectData(res.data);
  }
}

/* ============================== RewardBalance =============================== */

export function isRewardBalance(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::liquidity_mining::RewardBalance` + "<");
}

export interface RewardBalanceFields<T extends PhantomTypeArgument> {
  dummyField: ToField<"bool">;
}

export type RewardBalanceReified<T extends PhantomTypeArgument> = Reified<
  RewardBalance<T>,
  RewardBalanceFields<T>
>;

export class RewardBalance<T extends PhantomTypeArgument>
  implements StructClass
{
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::liquidity_mining::RewardBalance`;
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = RewardBalance.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::liquidity_mining::RewardBalance<${PhantomToTypeStr<T>}>`;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = RewardBalance.$isPhantom;

  readonly dummyField: ToField<"bool">;

  private constructor(
    typeArgs: [PhantomToTypeStr<T>],
    fields: RewardBalanceFields<T>,
  ) {
    this.$fullTypeName = composeSuiType(
      RewardBalance.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::liquidity_mining::RewardBalance<${PhantomToTypeStr<T>}>`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(
    T: T,
  ): RewardBalanceReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: RewardBalance.$typeName,
      fullTypeName: composeSuiType(
        RewardBalance.$typeName,
        ...[extractType(T)],
      ) as `${typeof PKG_V1}::liquidity_mining::RewardBalance<${PhantomToTypeStr<ToPhantomTypeArgument<T>>}>`,
      typeArgs: [extractType(T)] as [
        PhantomToTypeStr<ToPhantomTypeArgument<T>>,
      ],
      isPhantom: RewardBalance.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) =>
        RewardBalance.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        RewardBalance.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => RewardBalance.fromBcs(T, data),
      bcs: RewardBalance.bcs,
      fromJSONField: (field: any) => RewardBalance.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => RewardBalance.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) =>
        RewardBalance.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) =>
        RewardBalance.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) =>
        RewardBalance.fetch(client, T, id),
      new: (fields: RewardBalanceFields<ToPhantomTypeArgument<T>>) => {
        return new RewardBalance([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return RewardBalance.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T,
  ): PhantomReified<ToTypeStr<RewardBalance<ToPhantomTypeArgument<T>>>> {
    return phantom(RewardBalance.reified(T));
  }
  static get p() {
    return RewardBalance.phantom;
  }

  static get bcs() {
    return bcs.struct("RewardBalance", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>,
  ): RewardBalance<ToPhantomTypeArgument<T>> {
    return RewardBalance.reified(typeArg).new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes,
  ): RewardBalance<ToPhantomTypeArgument<T>> {
    if (!isRewardBalance(item.type)) {
      throw new Error("not a RewardBalance type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return RewardBalance.reified(typeArg).new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array,
  ): RewardBalance<ToPhantomTypeArgument<T>> {
    return RewardBalance.fromFields(typeArg, RewardBalance.bcs.parse(data));
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

  static fromJSONField<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    field: any,
  ): RewardBalance<ToPhantomTypeArgument<T>> {
    return RewardBalance.reified(typeArg).new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>,
  ): RewardBalance<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== RewardBalance.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(
      composeSuiType(RewardBalance.$typeName, extractType(typeArg)),
      json.$typeArgs,
      [typeArg],
    );

    return RewardBalance.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData,
  ): RewardBalance<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isRewardBalance(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a RewardBalance object`,
      );
    }
    return RewardBalance.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData,
  ): RewardBalance<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isRewardBalance(data.bcs.type)
      ) {
        throw new Error(`object at is not a RewardBalance object`);
      }

      const gotTypeArgs = parseTypeName(data.bcs.type).typeArgs;
      if (gotTypeArgs.length !== 1) {
        throw new Error(
          `type argument mismatch: expected 1 type argument but got '${gotTypeArgs.length}'`,
        );
      }
      const gotTypeArg = compressSuiType(gotTypeArgs[0]);
      const expectedTypeArg = compressSuiType(extractType(typeArg));
      if (gotTypeArg !== compressSuiType(extractType(typeArg))) {
        throw new Error(
          `type argument mismatch: expected '${expectedTypeArg}' but got '${gotTypeArg}'`,
        );
      }

      return RewardBalance.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return RewardBalance.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string,
  ): Promise<RewardBalance<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching RewardBalance object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isRewardBalance(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a RewardBalance object`);
    }

    return RewardBalance.fromSuiObjectData(typeArg, res.data);
  }
}

/* ============================== UserReward =============================== */

export function isUserReward(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::liquidity_mining::UserReward`;
}

export interface UserRewardFields {
  poolRewardId: ToField<ID>;
  earnedRewards: ToField<Decimal>;
  cumulativeRewardsPerShare: ToField<Decimal>;
}

export type UserRewardReified = Reified<UserReward, UserRewardFields>;

export class UserReward implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::liquidity_mining::UserReward`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = UserReward.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::liquidity_mining::UserReward`;
  readonly $typeArgs: [];
  readonly $isPhantom = UserReward.$isPhantom;

  readonly poolRewardId: ToField<ID>;
  readonly earnedRewards: ToField<Decimal>;
  readonly cumulativeRewardsPerShare: ToField<Decimal>;

  private constructor(typeArgs: [], fields: UserRewardFields) {
    this.$fullTypeName = composeSuiType(
      UserReward.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::liquidity_mining::UserReward`;
    this.$typeArgs = typeArgs;

    this.poolRewardId = fields.poolRewardId;
    this.earnedRewards = fields.earnedRewards;
    this.cumulativeRewardsPerShare = fields.cumulativeRewardsPerShare;
  }

  static reified(): UserRewardReified {
    return {
      typeName: UserReward.$typeName,
      fullTypeName: composeSuiType(
        UserReward.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::liquidity_mining::UserReward`,
      typeArgs: [] as [],
      isPhantom: UserReward.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        UserReward.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        UserReward.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => UserReward.fromBcs(data),
      bcs: UserReward.bcs,
      fromJSONField: (field: any) => UserReward.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => UserReward.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        UserReward.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        UserReward.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        UserReward.fetch(client, id),
      new: (fields: UserRewardFields) => {
        return new UserReward([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return UserReward.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<UserReward>> {
    return phantom(UserReward.reified());
  }
  static get p() {
    return UserReward.phantom();
  }

  static get bcs() {
    return bcs.struct("UserReward", {
      pool_reward_id: ID.bcs,
      earned_rewards: Decimal.bcs,
      cumulative_rewards_per_share: Decimal.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): UserReward {
    return UserReward.reified().new({
      poolRewardId: decodeFromFields(ID.reified(), fields.pool_reward_id),
      earnedRewards: decodeFromFields(Decimal.reified(), fields.earned_rewards),
      cumulativeRewardsPerShare: decodeFromFields(
        Decimal.reified(),
        fields.cumulative_rewards_per_share,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): UserReward {
    if (!isUserReward(item.type)) {
      throw new Error("not a UserReward type");
    }

    return UserReward.reified().new({
      poolRewardId: decodeFromFieldsWithTypes(
        ID.reified(),
        item.fields.pool_reward_id,
      ),
      earnedRewards: decodeFromFieldsWithTypes(
        Decimal.reified(),
        item.fields.earned_rewards,
      ),
      cumulativeRewardsPerShare: decodeFromFieldsWithTypes(
        Decimal.reified(),
        item.fields.cumulative_rewards_per_share,
      ),
    });
  }

  static fromBcs(data: Uint8Array): UserReward {
    return UserReward.fromFields(UserReward.bcs.parse(data));
  }

  toJSONField() {
    return {
      poolRewardId: this.poolRewardId,
      earnedRewards: this.earnedRewards.toJSONField(),
      cumulativeRewardsPerShare: this.cumulativeRewardsPerShare.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): UserReward {
    return UserReward.reified().new({
      poolRewardId: decodeFromJSONField(ID.reified(), field.poolRewardId),
      earnedRewards: decodeFromJSONField(
        Decimal.reified(),
        field.earnedRewards,
      ),
      cumulativeRewardsPerShare: decodeFromJSONField(
        Decimal.reified(),
        field.cumulativeRewardsPerShare,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): UserReward {
    if (json.$typeName !== UserReward.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return UserReward.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): UserReward {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isUserReward(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a UserReward object`,
      );
    }
    return UserReward.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): UserReward {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isUserReward(data.bcs.type)) {
        throw new Error(`object at is not a UserReward object`);
      }

      return UserReward.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return UserReward.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<UserReward> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching UserReward object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isUserReward(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a UserReward object`);
    }

    return UserReward.fromSuiObjectData(res.data);
  }
}

/* ============================== UserRewardManager =============================== */

export function isUserRewardManager(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::liquidity_mining::UserRewardManager`;
}

export interface UserRewardManagerFields {
  poolRewardManagerId: ToField<ID>;
  share: ToField<"u64">;
  rewards: ToField<Vector<Option<UserReward>>>;
  lastUpdateTimeMs: ToField<"u64">;
}

export type UserRewardManagerReified = Reified<
  UserRewardManager,
  UserRewardManagerFields
>;

export class UserRewardManager implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::liquidity_mining::UserRewardManager`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = UserRewardManager.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::liquidity_mining::UserRewardManager`;
  readonly $typeArgs: [];
  readonly $isPhantom = UserRewardManager.$isPhantom;

  readonly poolRewardManagerId: ToField<ID>;
  readonly share: ToField<"u64">;
  readonly rewards: ToField<Vector<Option<UserReward>>>;
  readonly lastUpdateTimeMs: ToField<"u64">;

  private constructor(typeArgs: [], fields: UserRewardManagerFields) {
    this.$fullTypeName = composeSuiType(
      UserRewardManager.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::liquidity_mining::UserRewardManager`;
    this.$typeArgs = typeArgs;

    this.poolRewardManagerId = fields.poolRewardManagerId;
    this.share = fields.share;
    this.rewards = fields.rewards;
    this.lastUpdateTimeMs = fields.lastUpdateTimeMs;
  }

  static reified(): UserRewardManagerReified {
    return {
      typeName: UserRewardManager.$typeName,
      fullTypeName: composeSuiType(
        UserRewardManager.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::liquidity_mining::UserRewardManager`,
      typeArgs: [] as [],
      isPhantom: UserRewardManager.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        UserRewardManager.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        UserRewardManager.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => UserRewardManager.fromBcs(data),
      bcs: UserRewardManager.bcs,
      fromJSONField: (field: any) => UserRewardManager.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => UserRewardManager.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        UserRewardManager.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        UserRewardManager.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        UserRewardManager.fetch(client, id),
      new: (fields: UserRewardManagerFields) => {
        return new UserRewardManager([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return UserRewardManager.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<UserRewardManager>> {
    return phantom(UserRewardManager.reified());
  }
  static get p() {
    return UserRewardManager.phantom();
  }

  static get bcs() {
    return bcs.struct("UserRewardManager", {
      pool_reward_manager_id: ID.bcs,
      share: bcs.u64(),
      rewards: bcs.vector(Option.bcs(UserReward.bcs)),
      last_update_time_ms: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): UserRewardManager {
    return UserRewardManager.reified().new({
      poolRewardManagerId: decodeFromFields(
        ID.reified(),
        fields.pool_reward_manager_id,
      ),
      share: decodeFromFields("u64", fields.share),
      rewards: decodeFromFields(
        reified.vector(Option.reified(UserReward.reified())),
        fields.rewards,
      ),
      lastUpdateTimeMs: decodeFromFields("u64", fields.last_update_time_ms),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): UserRewardManager {
    if (!isUserRewardManager(item.type)) {
      throw new Error("not a UserRewardManager type");
    }

    return UserRewardManager.reified().new({
      poolRewardManagerId: decodeFromFieldsWithTypes(
        ID.reified(),
        item.fields.pool_reward_manager_id,
      ),
      share: decodeFromFieldsWithTypes("u64", item.fields.share),
      rewards: decodeFromFieldsWithTypes(
        reified.vector(Option.reified(UserReward.reified())),
        item.fields.rewards,
      ),
      lastUpdateTimeMs: decodeFromFieldsWithTypes(
        "u64",
        item.fields.last_update_time_ms,
      ),
    });
  }

  static fromBcs(data: Uint8Array): UserRewardManager {
    return UserRewardManager.fromFields(UserRewardManager.bcs.parse(data));
  }

  toJSONField() {
    return {
      poolRewardManagerId: this.poolRewardManagerId,
      share: this.share.toString(),
      rewards: fieldToJSON<Vector<Option<UserReward>>>(
        `vector<${Option.$typeName}<${UserReward.$typeName}>>`,
        this.rewards,
      ),
      lastUpdateTimeMs: this.lastUpdateTimeMs.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): UserRewardManager {
    return UserRewardManager.reified().new({
      poolRewardManagerId: decodeFromJSONField(
        ID.reified(),
        field.poolRewardManagerId,
      ),
      share: decodeFromJSONField("u64", field.share),
      rewards: decodeFromJSONField(
        reified.vector(Option.reified(UserReward.reified())),
        field.rewards,
      ),
      lastUpdateTimeMs: decodeFromJSONField("u64", field.lastUpdateTimeMs),
    });
  }

  static fromJSON(json: Record<string, any>): UserRewardManager {
    if (json.$typeName !== UserRewardManager.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return UserRewardManager.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): UserRewardManager {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isUserRewardManager(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a UserRewardManager object`,
      );
    }
    return UserRewardManager.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): UserRewardManager {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isUserRewardManager(data.bcs.type)
      ) {
        throw new Error(`object at is not a UserRewardManager object`);
      }

      return UserRewardManager.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return UserRewardManager.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<UserRewardManager> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching UserRewardManager object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isUserRewardManager(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a UserRewardManager object`);
    }

    return UserRewardManager.fromSuiObjectData(res.data);
  }
}
