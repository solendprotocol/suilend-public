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
import { PriceFeed } from "../price-feed/structs";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== PriceFeedUpdateEvent =============================== */

export function isPriceFeedUpdateEvent(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::event::PriceFeedUpdateEvent"
  );
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
  static readonly $typeName =
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::event::PriceFeedUpdateEvent";
  static readonly $numTypeParams = 0;

  readonly $typeName = PriceFeedUpdateEvent.$typeName;

  readonly $fullTypeName: "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::event::PriceFeedUpdateEvent";

  readonly $typeArgs: [];

  readonly priceFeed: ToField<PriceFeed>;
  readonly timestamp: ToField<"u64">;

  private constructor(typeArgs: [], fields: PriceFeedUpdateEventFields) {
    this.$fullTypeName = composeSuiType(
      PriceFeedUpdateEvent.$typeName,
      ...typeArgs,
    ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::event::PriceFeedUpdateEvent";
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
      ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::event::PriceFeedUpdateEvent",
      typeArgs: [] as [],
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
    return PriceFeedUpdateEvent.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== PythInitializationEvent =============================== */

export function isPythInitializationEvent(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::event::PythInitializationEvent"
  );
}

export interface PythInitializationEventFields {
  dummyField: ToField<"bool">;
}

export type PythInitializationEventReified = Reified<
  PythInitializationEvent,
  PythInitializationEventFields
>;

export class PythInitializationEvent implements StructClass {
  static readonly $typeName =
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::event::PythInitializationEvent";
  static readonly $numTypeParams = 0;

  readonly $typeName = PythInitializationEvent.$typeName;

  readonly $fullTypeName: "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::event::PythInitializationEvent";

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: PythInitializationEventFields) {
    this.$fullTypeName = composeSuiType(
      PythInitializationEvent.$typeName,
      ...typeArgs,
    ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::event::PythInitializationEvent";
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): PythInitializationEventReified {
    return {
      typeName: PythInitializationEvent.$typeName,
      fullTypeName: composeSuiType(
        PythInitializationEvent.$typeName,
        ...[],
      ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::event::PythInitializationEvent",
      typeArgs: [] as [],
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
    return PythInitializationEvent.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
