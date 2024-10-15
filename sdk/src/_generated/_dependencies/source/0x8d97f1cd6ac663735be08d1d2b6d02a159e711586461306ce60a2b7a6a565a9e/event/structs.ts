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
import { PriceFeed } from "../price-feed/structs";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== PriceFeedUpdateEvent =============================== */

export function isPriceFeedUpdateEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::event::PriceFeedUpdateEvent`;
}

export interface PriceFeedUpdateEventFields {
  priceFeed: ToField<PriceFeed>;
  timestamp: ToField<"u64">;
}

export type PriceFeedUpdateEventReified = Reified<
  PriceFeedUpdateEvent,
  PriceFeedUpdateEventFields
>;

export class PriceFeedUpdateEvent implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::event::PriceFeedUpdateEvent`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = PriceFeedUpdateEvent.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::event::PriceFeedUpdateEvent`;
  readonly $typeArgs: [];
  readonly $isPhantom = PriceFeedUpdateEvent.$isPhantom;

  readonly priceFeed: ToField<PriceFeed>;
  readonly timestamp: ToField<"u64">;

  private constructor(typeArgs: [], fields: PriceFeedUpdateEventFields) {
    this.$fullTypeName = composeSuiType(
      PriceFeedUpdateEvent.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::event::PriceFeedUpdateEvent`;
    this.$typeArgs = typeArgs;

    this.priceFeed = fields.priceFeed;
    this.timestamp = fields.timestamp;
  }

  static reified(): PriceFeedUpdateEventReified {
    return {
      typeName: PriceFeedUpdateEvent.$typeName,
      fullTypeName: composeSuiType(
        PriceFeedUpdateEvent.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::event::PriceFeedUpdateEvent`,
      typeArgs: [] as [],
      isPhantom: PriceFeedUpdateEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        PriceFeedUpdateEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        PriceFeedUpdateEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => PriceFeedUpdateEvent.fromBcs(data),
      bcs: PriceFeedUpdateEvent.bcs,
      fromJSONField: (field: any) => PriceFeedUpdateEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) =>
        PriceFeedUpdateEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        PriceFeedUpdateEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        PriceFeedUpdateEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        PriceFeedUpdateEvent.fetch(client, id),
      new: (fields: PriceFeedUpdateEventFields) => {
        return new PriceFeedUpdateEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PriceFeedUpdateEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<PriceFeedUpdateEvent>> {
    return phantom(PriceFeedUpdateEvent.reified());
  }
  static get p() {
    return PriceFeedUpdateEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("PriceFeedUpdateEvent", {
      price_feed: PriceFeed.bcs,
      timestamp: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): PriceFeedUpdateEvent {
    return PriceFeedUpdateEvent.reified().new({
      priceFeed: decodeFromFields(PriceFeed.reified(), fields.price_feed),
      timestamp: decodeFromFields("u64", fields.timestamp),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PriceFeedUpdateEvent {
    if (!isPriceFeedUpdateEvent(item.type)) {
      throw new Error("not a PriceFeedUpdateEvent type");
    }

    return PriceFeedUpdateEvent.reified().new({
      priceFeed: decodeFromFieldsWithTypes(
        PriceFeed.reified(),
        item.fields.price_feed,
      ),
      timestamp: decodeFromFieldsWithTypes("u64", item.fields.timestamp),
    });
  }

  static fromBcs(data: Uint8Array): PriceFeedUpdateEvent {
    return PriceFeedUpdateEvent.fromFields(
      PriceFeedUpdateEvent.bcs.parse(data),
    );
  }

  toJSONField() {
    return {
      priceFeed: this.priceFeed.toJSONField(),
      timestamp: this.timestamp.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): PriceFeedUpdateEvent {
    return PriceFeedUpdateEvent.reified().new({
      priceFeed: decodeFromJSONField(PriceFeed.reified(), field.priceFeed),
      timestamp: decodeFromJSONField("u64", field.timestamp),
    });
  }

  static fromJSON(json: Record<string, any>): PriceFeedUpdateEvent {
    if (json.$typeName !== PriceFeedUpdateEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return PriceFeedUpdateEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): PriceFeedUpdateEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPriceFeedUpdateEvent(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a PriceFeedUpdateEvent object`,
      );
    }
    return PriceFeedUpdateEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): PriceFeedUpdateEvent {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isPriceFeedUpdateEvent(data.bcs.type)
      ) {
        throw new Error(`object at is not a PriceFeedUpdateEvent object`);
      }

      return PriceFeedUpdateEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return PriceFeedUpdateEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<PriceFeedUpdateEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching PriceFeedUpdateEvent object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isPriceFeedUpdateEvent(res.data.bcs.type)
    ) {
      throw new Error(
        `object at id ${id} is not a PriceFeedUpdateEvent object`,
      );
    }

    return PriceFeedUpdateEvent.fromSuiObjectData(res.data);
  }
}

/* ============================== PythInitializationEvent =============================== */

export function isPythInitializationEvent(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::event::PythInitializationEvent`;
}

export interface PythInitializationEventFields {
  dummyField: ToField<"bool">;
}

export type PythInitializationEventReified = Reified<
  PythInitializationEvent,
  PythInitializationEventFields
>;

export class PythInitializationEvent implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::event::PythInitializationEvent`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = PythInitializationEvent.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::event::PythInitializationEvent`;
  readonly $typeArgs: [];
  readonly $isPhantom = PythInitializationEvent.$isPhantom;

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: PythInitializationEventFields) {
    this.$fullTypeName = composeSuiType(
      PythInitializationEvent.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::event::PythInitializationEvent`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): PythInitializationEventReified {
    return {
      typeName: PythInitializationEvent.$typeName,
      fullTypeName: composeSuiType(
        PythInitializationEvent.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::event::PythInitializationEvent`,
      typeArgs: [] as [],
      isPhantom: PythInitializationEvent.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        PythInitializationEvent.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        PythInitializationEvent.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => PythInitializationEvent.fromBcs(data),
      bcs: PythInitializationEvent.bcs,
      fromJSONField: (field: any) =>
        PythInitializationEvent.fromJSONField(field),
      fromJSON: (json: Record<string, any>) =>
        PythInitializationEvent.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        PythInitializationEvent.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        PythInitializationEvent.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        PythInitializationEvent.fetch(client, id),
      new: (fields: PythInitializationEventFields) => {
        return new PythInitializationEvent([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PythInitializationEvent.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<PythInitializationEvent>> {
    return phantom(PythInitializationEvent.reified());
  }
  static get p() {
    return PythInitializationEvent.phantom();
  }

  static get bcs() {
    return bcs.struct("PythInitializationEvent", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): PythInitializationEvent {
    return PythInitializationEvent.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PythInitializationEvent {
    if (!isPythInitializationEvent(item.type)) {
      throw new Error("not a PythInitializationEvent type");
    }

    return PythInitializationEvent.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): PythInitializationEvent {
    return PythInitializationEvent.fromFields(
      PythInitializationEvent.bcs.parse(data),
    );
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

  static fromJSONField(field: any): PythInitializationEvent {
    return PythInitializationEvent.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): PythInitializationEvent {
    if (json.$typeName !== PythInitializationEvent.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return PythInitializationEvent.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): PythInitializationEvent {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPythInitializationEvent(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a PythInitializationEvent object`,
      );
    }
    return PythInitializationEvent.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): PythInitializationEvent {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isPythInitializationEvent(data.bcs.type)
      ) {
        throw new Error(`object at is not a PythInitializationEvent object`);
      }

      return PythInitializationEvent.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return PythInitializationEvent.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<PythInitializationEvent> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching PythInitializationEvent object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isPythInitializationEvent(res.data.bcs.type)
    ) {
      throw new Error(
        `object at id ${id} is not a PythInitializationEvent object`,
      );
    }

    return PythInitializationEvent.fromSuiObjectData(res.data);
  }
}
