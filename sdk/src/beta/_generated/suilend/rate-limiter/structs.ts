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
} from "../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../_framework/util";
import { Decimal } from "../decimal/structs";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== RateLimiter =============================== */

export function isRateLimiter(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::rate_limiter::RateLimiter"
  );
}

export interface RateLimiterFields {
  config: ToField<RateLimiterConfig>;
  prevQty: ToField<Decimal>;
  windowStart: ToField<"u64">;
  curQty: ToField<Decimal>;
}

export type RateLimiterReified = Reified<RateLimiter, RateLimiterFields>;

export class RateLimiter implements StructClass {
  static readonly $typeName =
    "0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::rate_limiter::RateLimiter";
  static readonly $numTypeParams = 0;

  readonly $typeName = RateLimiter.$typeName;

  readonly $fullTypeName: "0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::rate_limiter::RateLimiter";

  readonly $typeArgs: [];

  readonly config: ToField<RateLimiterConfig>;
  readonly prevQty: ToField<Decimal>;
  readonly windowStart: ToField<"u64">;
  readonly curQty: ToField<Decimal>;

  private constructor(typeArgs: [], fields: RateLimiterFields) {
    this.$fullTypeName = composeSuiType(
      RateLimiter.$typeName,
      ...typeArgs,
    ) as "0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::rate_limiter::RateLimiter";
    this.$typeArgs = typeArgs;

    this.config = fields.config;
    this.prevQty = fields.prevQty;
    this.windowStart = fields.windowStart;
    this.curQty = fields.curQty;
  }

  static reified(): RateLimiterReified {
    return {
      typeName: RateLimiter.$typeName,
      fullTypeName: composeSuiType(
        RateLimiter.$typeName,
        ...[],
      ) as "0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::rate_limiter::RateLimiter",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        RateLimiter.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        RateLimiter.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => RateLimiter.fromBcs(data),
      bcs: RateLimiter.bcs,
      fromJSONField: (field: any) => RateLimiter.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => RateLimiter.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        RateLimiter.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        RateLimiter.fetch(client, id),
      new: (fields: RateLimiterFields) => {
        return new RateLimiter([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return RateLimiter.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<RateLimiter>> {
    return phantom(RateLimiter.reified());
  }
  static get p() {
    return RateLimiter.phantom();
  }

  static get bcs() {
    return bcs.struct("RateLimiter", {
      config: RateLimiterConfig.bcs,
      prev_qty: Decimal.bcs,
      window_start: bcs.u64(),
      cur_qty: Decimal.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): RateLimiter {
    return RateLimiter.reified().new({
      config: decodeFromFields(RateLimiterConfig.reified(), fields.config),
      prevQty: decodeFromFields(Decimal.reified(), fields.prev_qty),
      windowStart: decodeFromFields("u64", fields.window_start),
      curQty: decodeFromFields(Decimal.reified(), fields.cur_qty),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): RateLimiter {
    if (!isRateLimiter(item.type)) {
      throw new Error("not a RateLimiter type");
    }

    return RateLimiter.reified().new({
      config: decodeFromFieldsWithTypes(
        RateLimiterConfig.reified(),
        item.fields.config,
      ),
      prevQty: decodeFromFieldsWithTypes(
        Decimal.reified(),
        item.fields.prev_qty,
      ),
      windowStart: decodeFromFieldsWithTypes("u64", item.fields.window_start),
      curQty: decodeFromFieldsWithTypes(Decimal.reified(), item.fields.cur_qty),
    });
  }

  static fromBcs(data: Uint8Array): RateLimiter {
    return RateLimiter.fromFields(RateLimiter.bcs.parse(data));
  }

  toJSONField() {
    return {
      config: this.config.toJSONField(),
      prevQty: this.prevQty.toJSONField(),
      windowStart: this.windowStart.toString(),
      curQty: this.curQty.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): RateLimiter {
    return RateLimiter.reified().new({
      config: decodeFromJSONField(RateLimiterConfig.reified(), field.config),
      prevQty: decodeFromJSONField(Decimal.reified(), field.prevQty),
      windowStart: decodeFromJSONField("u64", field.windowStart),
      curQty: decodeFromJSONField(Decimal.reified(), field.curQty),
    });
  }

  static fromJSON(json: Record<string, any>): RateLimiter {
    if (json.$typeName !== RateLimiter.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return RateLimiter.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): RateLimiter {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isRateLimiter(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a RateLimiter object`,
      );
    }
    return RateLimiter.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<RateLimiter> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching RateLimiter object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isRateLimiter(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a RateLimiter object`);
    }
    return RateLimiter.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== RateLimiterConfig =============================== */

export function isRateLimiterConfig(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::rate_limiter::RateLimiterConfig"
  );
}

export interface RateLimiterConfigFields {
  windowDuration: ToField<"u64">;
  maxOutflow: ToField<"u64">;
}

export type RateLimiterConfigReified = Reified<
  RateLimiterConfig,
  RateLimiterConfigFields
>;

export class RateLimiterConfig implements StructClass {
  static readonly $typeName =
    "0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::rate_limiter::RateLimiterConfig";
  static readonly $numTypeParams = 0;

  readonly $typeName = RateLimiterConfig.$typeName;

  readonly $fullTypeName: "0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::rate_limiter::RateLimiterConfig";

  readonly $typeArgs: [];

  readonly windowDuration: ToField<"u64">;
  readonly maxOutflow: ToField<"u64">;

  private constructor(typeArgs: [], fields: RateLimiterConfigFields) {
    this.$fullTypeName = composeSuiType(
      RateLimiterConfig.$typeName,
      ...typeArgs,
    ) as "0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::rate_limiter::RateLimiterConfig";
    this.$typeArgs = typeArgs;

    this.windowDuration = fields.windowDuration;
    this.maxOutflow = fields.maxOutflow;
  }

  static reified(): RateLimiterConfigReified {
    return {
      typeName: RateLimiterConfig.$typeName,
      fullTypeName: composeSuiType(
        RateLimiterConfig.$typeName,
        ...[],
      ) as "0xba79417dd36e8fa1510f53b0491b7a8b2802217a81b1401b1efbb65e4994e016::rate_limiter::RateLimiterConfig",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        RateLimiterConfig.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        RateLimiterConfig.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => RateLimiterConfig.fromBcs(data),
      bcs: RateLimiterConfig.bcs,
      fromJSONField: (field: any) => RateLimiterConfig.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => RateLimiterConfig.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        RateLimiterConfig.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        RateLimiterConfig.fetch(client, id),
      new: (fields: RateLimiterConfigFields) => {
        return new RateLimiterConfig([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return RateLimiterConfig.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<RateLimiterConfig>> {
    return phantom(RateLimiterConfig.reified());
  }
  static get p() {
    return RateLimiterConfig.phantom();
  }

  static get bcs() {
    return bcs.struct("RateLimiterConfig", {
      window_duration: bcs.u64(),
      max_outflow: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): RateLimiterConfig {
    return RateLimiterConfig.reified().new({
      windowDuration: decodeFromFields("u64", fields.window_duration),
      maxOutflow: decodeFromFields("u64", fields.max_outflow),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): RateLimiterConfig {
    if (!isRateLimiterConfig(item.type)) {
      throw new Error("not a RateLimiterConfig type");
    }

    return RateLimiterConfig.reified().new({
      windowDuration: decodeFromFieldsWithTypes(
        "u64",
        item.fields.window_duration,
      ),
      maxOutflow: decodeFromFieldsWithTypes("u64", item.fields.max_outflow),
    });
  }

  static fromBcs(data: Uint8Array): RateLimiterConfig {
    return RateLimiterConfig.fromFields(RateLimiterConfig.bcs.parse(data));
  }

  toJSONField() {
    return {
      windowDuration: this.windowDuration.toString(),
      maxOutflow: this.maxOutflow.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): RateLimiterConfig {
    return RateLimiterConfig.reified().new({
      windowDuration: decodeFromJSONField("u64", field.windowDuration),
      maxOutflow: decodeFromJSONField("u64", field.maxOutflow),
    });
  }

  static fromJSON(json: Record<string, any>): RateLimiterConfig {
    if (json.$typeName !== RateLimiterConfig.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return RateLimiterConfig.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): RateLimiterConfig {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isRateLimiterConfig(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a RateLimiterConfig object`,
      );
    }
    return RateLimiterConfig.fromFieldsWithTypes(content);
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<RateLimiterConfig> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching RateLimiterConfig object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isRateLimiterConfig(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a RateLimiterConfig object`);
    }
    return RateLimiterConfig.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
