import * as reified from "../../_framework/reified";
import { Bag } from "../../_dependencies/source/0x2/bag/structs";
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
} from "../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../_framework/util";
import { PKG_V1 } from "../index";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== ReserveConfig =============================== */

export function isReserveConfig(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::reserve_config::ReserveConfig`;
}

export interface ReserveConfigFields {
  openLtvPct: ToField<"u8">;
  closeLtvPct: ToField<"u8">;
  maxCloseLtvPct: ToField<"u8">;
  borrowWeightBps: ToField<"u64">;
  depositLimit: ToField<"u64">;
  borrowLimit: ToField<"u64">;
  liquidationBonusBps: ToField<"u64">;
  maxLiquidationBonusBps: ToField<"u64">;
  depositLimitUsd: ToField<"u64">;
  borrowLimitUsd: ToField<"u64">;
  interestRateUtils: ToField<Vector<"u8">>;
  interestRateAprs: ToField<Vector<"u64">>;
  borrowFeeBps: ToField<"u64">;
  spreadFeeBps: ToField<"u64">;
  protocolLiquidationFeeBps: ToField<"u64">;
  isolated: ToField<"bool">;
  openAttributedBorrowLimitUsd: ToField<"u64">;
  closeAttributedBorrowLimitUsd: ToField<"u64">;
  additionalFields: ToField<Bag>;
}

export type ReserveConfigReified = Reified<ReserveConfig, ReserveConfigFields>;

export class ReserveConfig implements StructClass {
  static readonly $typeName = `${PKG_V1}::reserve_config::ReserveConfig`;
  static readonly $numTypeParams = 0;

  readonly $typeName = ReserveConfig.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::reserve_config::ReserveConfig`;

  readonly $typeArgs: [];

  readonly openLtvPct: ToField<"u8">;
  readonly closeLtvPct: ToField<"u8">;
  readonly maxCloseLtvPct: ToField<"u8">;
  readonly borrowWeightBps: ToField<"u64">;
  readonly depositLimit: ToField<"u64">;
  readonly borrowLimit: ToField<"u64">;
  readonly liquidationBonusBps: ToField<"u64">;
  readonly maxLiquidationBonusBps: ToField<"u64">;
  readonly depositLimitUsd: ToField<"u64">;
  readonly borrowLimitUsd: ToField<"u64">;
  readonly interestRateUtils: ToField<Vector<"u8">>;
  readonly interestRateAprs: ToField<Vector<"u64">>;
  readonly borrowFeeBps: ToField<"u64">;
  readonly spreadFeeBps: ToField<"u64">;
  readonly protocolLiquidationFeeBps: ToField<"u64">;
  readonly isolated: ToField<"bool">;
  readonly openAttributedBorrowLimitUsd: ToField<"u64">;
  readonly closeAttributedBorrowLimitUsd: ToField<"u64">;
  readonly additionalFields: ToField<Bag>;

  private constructor(typeArgs: [], fields: ReserveConfigFields) {
    this.$fullTypeName = composeSuiType(
      ReserveConfig.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::reserve_config::ReserveConfig`;
    this.$typeArgs = typeArgs;

    this.openLtvPct = fields.openLtvPct;
    this.closeLtvPct = fields.closeLtvPct;
    this.maxCloseLtvPct = fields.maxCloseLtvPct;
    this.borrowWeightBps = fields.borrowWeightBps;
    this.depositLimit = fields.depositLimit;
    this.borrowLimit = fields.borrowLimit;
    this.liquidationBonusBps = fields.liquidationBonusBps;
    this.maxLiquidationBonusBps = fields.maxLiquidationBonusBps;
    this.depositLimitUsd = fields.depositLimitUsd;
    this.borrowLimitUsd = fields.borrowLimitUsd;
    this.interestRateUtils = fields.interestRateUtils;
    this.interestRateAprs = fields.interestRateAprs;
    this.borrowFeeBps = fields.borrowFeeBps;
    this.spreadFeeBps = fields.spreadFeeBps;
    this.protocolLiquidationFeeBps = fields.protocolLiquidationFeeBps;
    this.isolated = fields.isolated;
    this.openAttributedBorrowLimitUsd = fields.openAttributedBorrowLimitUsd;
    this.closeAttributedBorrowLimitUsd = fields.closeAttributedBorrowLimitUsd;
    this.additionalFields = fields.additionalFields;
  }

  static reified(): ReserveConfigReified {
    return {
      typeName: ReserveConfig.$typeName,
      fullTypeName: composeSuiType(
        ReserveConfig.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::reserve_config::ReserveConfig`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        ReserveConfig.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        ReserveConfig.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => ReserveConfig.fromBcs(data),
      bcs: ReserveConfig.bcs,
      fromJSONField: (field: any) => ReserveConfig.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => ReserveConfig.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        ReserveConfig.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        ReserveConfig.fetch(client, id),
      new: (fields: ReserveConfigFields) => {
        return new ReserveConfig([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return ReserveConfig.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<ReserveConfig>> {
    return phantom(ReserveConfig.reified());
  }
  static get p() {
    return ReserveConfig.phantom();
  }

  static get bcs() {
    return bcs.struct("ReserveConfig", {
      open_ltv_pct: bcs.u8(),
      close_ltv_pct: bcs.u8(),
      max_close_ltv_pct: bcs.u8(),
      borrow_weight_bps: bcs.u64(),
      deposit_limit: bcs.u64(),
      borrow_limit: bcs.u64(),
      liquidation_bonus_bps: bcs.u64(),
      max_liquidation_bonus_bps: bcs.u64(),
      deposit_limit_usd: bcs.u64(),
      borrow_limit_usd: bcs.u64(),
      interest_rate_utils: bcs.vector(bcs.u8()),
      interest_rate_aprs: bcs.vector(bcs.u64()),
      borrow_fee_bps: bcs.u64(),
      spread_fee_bps: bcs.u64(),
      protocol_liquidation_fee_bps: bcs.u64(),
      isolated: bcs.bool(),
      open_attributed_borrow_limit_usd: bcs.u64(),
      close_attributed_borrow_limit_usd: bcs.u64(),
      additional_fields: Bag.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): ReserveConfig {
    return ReserveConfig.reified().new({
      openLtvPct: decodeFromFields("u8", fields.open_ltv_pct),
      closeLtvPct: decodeFromFields("u8", fields.close_ltv_pct),
      maxCloseLtvPct: decodeFromFields("u8", fields.max_close_ltv_pct),
      borrowWeightBps: decodeFromFields("u64", fields.borrow_weight_bps),
      depositLimit: decodeFromFields("u64", fields.deposit_limit),
      borrowLimit: decodeFromFields("u64", fields.borrow_limit),
      liquidationBonusBps: decodeFromFields(
        "u64",
        fields.liquidation_bonus_bps,
      ),
      maxLiquidationBonusBps: decodeFromFields(
        "u64",
        fields.max_liquidation_bonus_bps,
      ),
      depositLimitUsd: decodeFromFields("u64", fields.deposit_limit_usd),
      borrowLimitUsd: decodeFromFields("u64", fields.borrow_limit_usd),
      interestRateUtils: decodeFromFields(
        reified.vector("u8"),
        fields.interest_rate_utils,
      ),
      interestRateAprs: decodeFromFields(
        reified.vector("u64"),
        fields.interest_rate_aprs,
      ),
      borrowFeeBps: decodeFromFields("u64", fields.borrow_fee_bps),
      spreadFeeBps: decodeFromFields("u64", fields.spread_fee_bps),
      protocolLiquidationFeeBps: decodeFromFields(
        "u64",
        fields.protocol_liquidation_fee_bps,
      ),
      isolated: decodeFromFields("bool", fields.isolated),
      openAttributedBorrowLimitUsd: decodeFromFields(
        "u64",
        fields.open_attributed_borrow_limit_usd,
      ),
      closeAttributedBorrowLimitUsd: decodeFromFields(
        "u64",
        fields.close_attributed_borrow_limit_usd,
      ),
      additionalFields: decodeFromFields(
        Bag.reified(),
        fields.additional_fields,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): ReserveConfig {
    if (!isReserveConfig(item.type)) {
      throw new Error("not a ReserveConfig type");
    }

    return ReserveConfig.reified().new({
      openLtvPct: decodeFromFieldsWithTypes("u8", item.fields.open_ltv_pct),
      closeLtvPct: decodeFromFieldsWithTypes("u8", item.fields.close_ltv_pct),
      maxCloseLtvPct: decodeFromFieldsWithTypes(
        "u8",
        item.fields.max_close_ltv_pct,
      ),
      borrowWeightBps: decodeFromFieldsWithTypes(
        "u64",
        item.fields.borrow_weight_bps,
      ),
      depositLimit: decodeFromFieldsWithTypes("u64", item.fields.deposit_limit),
      borrowLimit: decodeFromFieldsWithTypes("u64", item.fields.borrow_limit),
      liquidationBonusBps: decodeFromFieldsWithTypes(
        "u64",
        item.fields.liquidation_bonus_bps,
      ),
      maxLiquidationBonusBps: decodeFromFieldsWithTypes(
        "u64",
        item.fields.max_liquidation_bonus_bps,
      ),
      depositLimitUsd: decodeFromFieldsWithTypes(
        "u64",
        item.fields.deposit_limit_usd,
      ),
      borrowLimitUsd: decodeFromFieldsWithTypes(
        "u64",
        item.fields.borrow_limit_usd,
      ),
      interestRateUtils: decodeFromFieldsWithTypes(
        reified.vector("u8"),
        item.fields.interest_rate_utils,
      ),
      interestRateAprs: decodeFromFieldsWithTypes(
        reified.vector("u64"),
        item.fields.interest_rate_aprs,
      ),
      borrowFeeBps: decodeFromFieldsWithTypes(
        "u64",
        item.fields.borrow_fee_bps,
      ),
      spreadFeeBps: decodeFromFieldsWithTypes(
        "u64",
        item.fields.spread_fee_bps,
      ),
      protocolLiquidationFeeBps: decodeFromFieldsWithTypes(
        "u64",
        item.fields.protocol_liquidation_fee_bps,
      ),
      isolated: decodeFromFieldsWithTypes("bool", item.fields.isolated),
      openAttributedBorrowLimitUsd: decodeFromFieldsWithTypes(
        "u64",
        item.fields.open_attributed_borrow_limit_usd,
      ),
      closeAttributedBorrowLimitUsd: decodeFromFieldsWithTypes(
        "u64",
        item.fields.close_attributed_borrow_limit_usd,
      ),
      additionalFields: decodeFromFieldsWithTypes(
        Bag.reified(),
        item.fields.additional_fields,
      ),
    });
  }

  static fromBcs(data: Uint8Array): ReserveConfig {
    return ReserveConfig.fromFields(ReserveConfig.bcs.parse(data));
  }

  toJSONField() {
    return {
      openLtvPct: this.openLtvPct,
      closeLtvPct: this.closeLtvPct,
      maxCloseLtvPct: this.maxCloseLtvPct,
      borrowWeightBps: this.borrowWeightBps.toString(),
      depositLimit: this.depositLimit.toString(),
      borrowLimit: this.borrowLimit.toString(),
      liquidationBonusBps: this.liquidationBonusBps.toString(),
      maxLiquidationBonusBps: this.maxLiquidationBonusBps.toString(),
      depositLimitUsd: this.depositLimitUsd.toString(),
      borrowLimitUsd: this.borrowLimitUsd.toString(),
      interestRateUtils: fieldToJSON<Vector<"u8">>(
        `vector<u8>`,
        this.interestRateUtils,
      ),
      interestRateAprs: fieldToJSON<Vector<"u64">>(
        `vector<u64>`,
        this.interestRateAprs,
      ),
      borrowFeeBps: this.borrowFeeBps.toString(),
      spreadFeeBps: this.spreadFeeBps.toString(),
      protocolLiquidationFeeBps: this.protocolLiquidationFeeBps.toString(),
      isolated: this.isolated,
      openAttributedBorrowLimitUsd:
        this.openAttributedBorrowLimitUsd.toString(),
      closeAttributedBorrowLimitUsd:
        this.closeAttributedBorrowLimitUsd.toString(),
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

  static fromJSONField(field: any): ReserveConfig {
    return ReserveConfig.reified().new({
      openLtvPct: decodeFromJSONField("u8", field.openLtvPct),
      closeLtvPct: decodeFromJSONField("u8", field.closeLtvPct),
      maxCloseLtvPct: decodeFromJSONField("u8", field.maxCloseLtvPct),
      borrowWeightBps: decodeFromJSONField("u64", field.borrowWeightBps),
      depositLimit: decodeFromJSONField("u64", field.depositLimit),
      borrowLimit: decodeFromJSONField("u64", field.borrowLimit),
      liquidationBonusBps: decodeFromJSONField(
        "u64",
        field.liquidationBonusBps,
      ),
      maxLiquidationBonusBps: decodeFromJSONField(
        "u64",
        field.maxLiquidationBonusBps,
      ),
      depositLimitUsd: decodeFromJSONField("u64", field.depositLimitUsd),
      borrowLimitUsd: decodeFromJSONField("u64", field.borrowLimitUsd),
      interestRateUtils: decodeFromJSONField(
        reified.vector("u8"),
        field.interestRateUtils,
      ),
      interestRateAprs: decodeFromJSONField(
        reified.vector("u64"),
        field.interestRateAprs,
      ),
      borrowFeeBps: decodeFromJSONField("u64", field.borrowFeeBps),
      spreadFeeBps: decodeFromJSONField("u64", field.spreadFeeBps),
      protocolLiquidationFeeBps: decodeFromJSONField(
        "u64",
        field.protocolLiquidationFeeBps,
      ),
      isolated: decodeFromJSONField("bool", field.isolated),
      openAttributedBorrowLimitUsd: decodeFromJSONField(
        "u64",
        field.openAttributedBorrowLimitUsd,
      ),
      closeAttributedBorrowLimitUsd: decodeFromJSONField(
        "u64",
        field.closeAttributedBorrowLimitUsd,
      ),
      additionalFields: decodeFromJSONField(
        Bag.reified(),
        field.additionalFields,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): ReserveConfig {
    if (json.$typeName !== ReserveConfig.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return ReserveConfig.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): ReserveConfig {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isReserveConfig(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a ReserveConfig object`,
      );
    }
    return ReserveConfig.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<ReserveConfig> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching ReserveConfig object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isReserveConfig(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a ReserveConfig object`);
    }
    return ReserveConfig.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== ReserveConfigBuilder =============================== */

export function isReserveConfigBuilder(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::reserve_config::ReserveConfigBuilder`;
}

export interface ReserveConfigBuilderFields {
  fields: ToField<Bag>;
}

export type ReserveConfigBuilderReified = Reified<
  ReserveConfigBuilder,
  ReserveConfigBuilderFields
>;

export class ReserveConfigBuilder implements StructClass {
  static readonly $typeName = `${PKG_V1}::reserve_config::ReserveConfigBuilder`;
  static readonly $numTypeParams = 0;

  readonly $typeName = ReserveConfigBuilder.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::reserve_config::ReserveConfigBuilder`;

  readonly $typeArgs: [];

  readonly fields: ToField<Bag>;

  private constructor(typeArgs: [], fields: ReserveConfigBuilderFields) {
    this.$fullTypeName = composeSuiType(
      ReserveConfigBuilder.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::reserve_config::ReserveConfigBuilder`;
    this.$typeArgs = typeArgs;

    this.fields = fields.fields;
  }

  static reified(): ReserveConfigBuilderReified {
    return {
      typeName: ReserveConfigBuilder.$typeName,
      fullTypeName: composeSuiType(
        ReserveConfigBuilder.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::reserve_config::ReserveConfigBuilder`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        ReserveConfigBuilder.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        ReserveConfigBuilder.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => ReserveConfigBuilder.fromBcs(data),
      bcs: ReserveConfigBuilder.bcs,
      fromJSONField: (field: any) => ReserveConfigBuilder.fromJSONField(field),
      fromJSON: (json: Record<string, any>) =>
        ReserveConfigBuilder.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        ReserveConfigBuilder.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        ReserveConfigBuilder.fetch(client, id),
      new: (fields: ReserveConfigBuilderFields) => {
        return new ReserveConfigBuilder([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return ReserveConfigBuilder.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<ReserveConfigBuilder>> {
    return phantom(ReserveConfigBuilder.reified());
  }
  static get p() {
    return ReserveConfigBuilder.phantom();
  }

  static get bcs() {
    return bcs.struct("ReserveConfigBuilder", {
      fields: Bag.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): ReserveConfigBuilder {
    return ReserveConfigBuilder.reified().new({
      fields: decodeFromFields(Bag.reified(), fields.fields),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): ReserveConfigBuilder {
    if (!isReserveConfigBuilder(item.type)) {
      throw new Error("not a ReserveConfigBuilder type");
    }

    return ReserveConfigBuilder.reified().new({
      fields: decodeFromFieldsWithTypes(Bag.reified(), item.fields.fields),
    });
  }

  static fromBcs(data: Uint8Array): ReserveConfigBuilder {
    return ReserveConfigBuilder.fromFields(
      ReserveConfigBuilder.bcs.parse(data),
    );
  }

  toJSONField() {
    return {
      fields: this.fields.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): ReserveConfigBuilder {
    return ReserveConfigBuilder.reified().new({
      fields: decodeFromJSONField(Bag.reified(), field.fields),
    });
  }

  static fromJSON(json: Record<string, any>): ReserveConfigBuilder {
    if (json.$typeName !== ReserveConfigBuilder.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return ReserveConfigBuilder.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): ReserveConfigBuilder {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isReserveConfigBuilder(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a ReserveConfigBuilder object`,
      );
    }
    return ReserveConfigBuilder.fromFieldsWithTypes(content);
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<ReserveConfigBuilder> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching ReserveConfigBuilder object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isReserveConfigBuilder(res.data.bcs.type)
    ) {
      throw new Error(
        `object at id ${id} is not a ReserveConfigBuilder object`,
      );
    }
    return ReserveConfigBuilder.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
