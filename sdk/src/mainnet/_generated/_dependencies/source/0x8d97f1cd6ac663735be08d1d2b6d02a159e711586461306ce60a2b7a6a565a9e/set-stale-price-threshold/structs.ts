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
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== StalePriceThreshold =============================== */

export function isStalePriceThreshold(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::set_stale_price_threshold::StalePriceThreshold"
  );
}

export interface StalePriceThresholdFields {
  threshold: ToField<"u64">;
}

export type StalePriceThresholdReified = Reified<
  StalePriceThreshold,
  StalePriceThresholdFields
>;

export class StalePriceThreshold implements StructClass {
  static readonly $typeName =
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::set_stale_price_threshold::StalePriceThreshold";
  static readonly $numTypeParams = 0;

  readonly $typeName = StalePriceThreshold.$typeName;

  readonly $fullTypeName: "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::set_stale_price_threshold::StalePriceThreshold";

  readonly $typeArgs: [];

  readonly threshold: ToField<"u64">;

  private constructor(typeArgs: [], fields: StalePriceThresholdFields) {
    this.$fullTypeName = composeSuiType(
      StalePriceThreshold.$typeName,
      ...typeArgs,
    ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::set_stale_price_threshold::StalePriceThreshold";
    this.$typeArgs = typeArgs;

    this.threshold = fields.threshold;
  }

  static reified(): StalePriceThresholdReified {
    return {
      typeName: StalePriceThreshold.$typeName,
      fullTypeName: composeSuiType(
        StalePriceThreshold.$typeName,
        ...[],
      ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::set_stale_price_threshold::StalePriceThreshold",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        StalePriceThreshold.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        StalePriceThreshold.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => StalePriceThreshold.fromBcs(data),
      bcs: StalePriceThreshold.bcs,
      fromJSONField: (field: any) => StalePriceThreshold.fromJSONField(field),
      fromJSON: (json: Record<string, any>) =>
        StalePriceThreshold.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        StalePriceThreshold.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        StalePriceThreshold.fetch(client, id),
      new: (fields: StalePriceThresholdFields) => {
        return new StalePriceThreshold([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return StalePriceThreshold.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<StalePriceThreshold>> {
    return phantom(StalePriceThreshold.reified());
  }
  static get p() {
    return StalePriceThreshold.phantom();
  }

  static get bcs() {
    return bcs.struct("StalePriceThreshold", {
      threshold: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): StalePriceThreshold {
    return StalePriceThreshold.reified().new({
      threshold: decodeFromFields("u64", fields.threshold),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): StalePriceThreshold {
    if (!isStalePriceThreshold(item.type)) {
      throw new Error("not a StalePriceThreshold type");
    }

    return StalePriceThreshold.reified().new({
      threshold: decodeFromFieldsWithTypes("u64", item.fields.threshold),
    });
  }

  static fromBcs(data: Uint8Array): StalePriceThreshold {
    return StalePriceThreshold.fromFields(StalePriceThreshold.bcs.parse(data));
  }

  toJSONField() {
    return {
      threshold: this.threshold.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): StalePriceThreshold {
    return StalePriceThreshold.reified().new({
      threshold: decodeFromJSONField("u64", field.threshold),
    });
  }

  static fromJSON(json: Record<string, any>): StalePriceThreshold {
    if (json.$typeName !== StalePriceThreshold.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return StalePriceThreshold.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): StalePriceThreshold {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isStalePriceThreshold(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a StalePriceThreshold object`,
      );
    }
    return StalePriceThreshold.fromFieldsWithTypes(content);
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<StalePriceThreshold> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching StalePriceThreshold object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isStalePriceThreshold(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a StalePriceThreshold object`);
    }
    return StalePriceThreshold.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
