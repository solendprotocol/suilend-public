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
import { PriceIdentifier } from "../price-identifier/structs";
import { Price } from "../price/structs";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== PriceFeed =============================== */

export function isPriceFeed(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::price_feed::PriceFeed"
  );
}

export interface PriceFeedFields {
  priceIdentifier: ToField<PriceIdentifier>;
  price: ToField<Price>;
  emaPrice: ToField<Price>;
}

export type PriceFeedReified = Reified<PriceFeed, PriceFeedFields>;

export class PriceFeed implements StructClass {
  static readonly $typeName =
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::price_feed::PriceFeed";
  static readonly $numTypeParams = 0;

  readonly $typeName = PriceFeed.$typeName;

  readonly $fullTypeName: "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::price_feed::PriceFeed";

  readonly $typeArgs: [];

  readonly priceIdentifier: ToField<PriceIdentifier>;
  readonly price: ToField<Price>;
  readonly emaPrice: ToField<Price>;

  private constructor(typeArgs: [], fields: PriceFeedFields) {
    this.$fullTypeName = composeSuiType(
      PriceFeed.$typeName,
      ...typeArgs,
    ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::price_feed::PriceFeed";
    this.$typeArgs = typeArgs;

    this.priceIdentifier = fields.priceIdentifier;
    this.price = fields.price;
    this.emaPrice = fields.emaPrice;
  }

  static reified(): PriceFeedReified {
    return {
      typeName: PriceFeed.$typeName,
      fullTypeName: composeSuiType(
        PriceFeed.$typeName,
        ...[],
      ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::price_feed::PriceFeed",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => PriceFeed.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        PriceFeed.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => PriceFeed.fromBcs(data),
      bcs: PriceFeed.bcs,
      fromJSONField: (field: any) => PriceFeed.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => PriceFeed.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        PriceFeed.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        PriceFeed.fetch(client, id),
      new: (fields: PriceFeedFields) => {
        return new PriceFeed([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PriceFeed.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<PriceFeed>> {
    return phantom(PriceFeed.reified());
  }
  static get p() {
    return PriceFeed.phantom();
  }

  static get bcs() {
    return bcs.struct("PriceFeed", {
      price_identifier: PriceIdentifier.bcs,
      price: Price.bcs,
      ema_price: Price.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): PriceFeed {
    return PriceFeed.reified().new({
      priceIdentifier: decodeFromFields(
        PriceIdentifier.reified(),
        fields.price_identifier,
      ),
      price: decodeFromFields(Price.reified(), fields.price),
      emaPrice: decodeFromFields(Price.reified(), fields.ema_price),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PriceFeed {
    if (!isPriceFeed(item.type)) {
      throw new Error("not a PriceFeed type");
    }

    return PriceFeed.reified().new({
      priceIdentifier: decodeFromFieldsWithTypes(
        PriceIdentifier.reified(),
        item.fields.price_identifier,
      ),
      price: decodeFromFieldsWithTypes(Price.reified(), item.fields.price),
      emaPrice: decodeFromFieldsWithTypes(
        Price.reified(),
        item.fields.ema_price,
      ),
    });
  }

  static fromBcs(data: Uint8Array): PriceFeed {
    return PriceFeed.fromFields(PriceFeed.bcs.parse(data));
  }

  toJSONField() {
    return {
      priceIdentifier: this.priceIdentifier.toJSONField(),
      price: this.price.toJSONField(),
      emaPrice: this.emaPrice.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): PriceFeed {
    return PriceFeed.reified().new({
      priceIdentifier: decodeFromJSONField(
        PriceIdentifier.reified(),
        field.priceIdentifier,
      ),
      price: decodeFromJSONField(Price.reified(), field.price),
      emaPrice: decodeFromJSONField(Price.reified(), field.emaPrice),
    });
  }

  static fromJSON(json: Record<string, any>): PriceFeed {
    if (json.$typeName !== PriceFeed.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return PriceFeed.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): PriceFeed {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPriceFeed(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a PriceFeed object`,
      );
    }
    return PriceFeed.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<PriceFeed> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching PriceFeed object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isPriceFeed(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a PriceFeed object`);
    }
    return PriceFeed.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
