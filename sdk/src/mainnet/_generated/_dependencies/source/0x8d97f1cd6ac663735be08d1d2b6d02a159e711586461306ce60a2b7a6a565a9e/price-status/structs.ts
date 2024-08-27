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
import { fromB64 } from "@mysten/sui/utils";

/* ============================== PriceStatus =============================== */

export function isPriceStatus(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::price_status::PriceStatus`;
}

export interface PriceStatusFields {
  status: ToField<"u64">;
}

export type PriceStatusReified = Reified<PriceStatus, PriceStatusFields>;

export class PriceStatus implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::price_status::PriceStatus`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = PriceStatus.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::price_status::PriceStatus`;
  readonly $typeArgs: [];
  readonly $isPhantom = PriceStatus.$isPhantom;

  readonly status: ToField<"u64">;

  private constructor(typeArgs: [], fields: PriceStatusFields) {
    this.$fullTypeName = composeSuiType(
      PriceStatus.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::price_status::PriceStatus`;
    this.$typeArgs = typeArgs;

    this.status = fields.status;
  }

  static reified(): PriceStatusReified {
    return {
      typeName: PriceStatus.$typeName,
      fullTypeName: composeSuiType(
        PriceStatus.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::price_status::PriceStatus`,
      typeArgs: [] as [],
      isPhantom: PriceStatus.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        PriceStatus.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        PriceStatus.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => PriceStatus.fromBcs(data),
      bcs: PriceStatus.bcs,
      fromJSONField: (field: any) => PriceStatus.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => PriceStatus.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        PriceStatus.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        PriceStatus.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        PriceStatus.fetch(client, id),
      new: (fields: PriceStatusFields) => {
        return new PriceStatus([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PriceStatus.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<PriceStatus>> {
    return phantom(PriceStatus.reified());
  }
  static get p() {
    return PriceStatus.phantom();
  }

  static get bcs() {
    return bcs.struct("PriceStatus", {
      status: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): PriceStatus {
    return PriceStatus.reified().new({
      status: decodeFromFields("u64", fields.status),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PriceStatus {
    if (!isPriceStatus(item.type)) {
      throw new Error("not a PriceStatus type");
    }

    return PriceStatus.reified().new({
      status: decodeFromFieldsWithTypes("u64", item.fields.status),
    });
  }

  static fromBcs(data: Uint8Array): PriceStatus {
    return PriceStatus.fromFields(PriceStatus.bcs.parse(data));
  }

  toJSONField() {
    return {
      status: this.status.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): PriceStatus {
    return PriceStatus.reified().new({
      status: decodeFromJSONField("u64", field.status),
    });
  }

  static fromJSON(json: Record<string, any>): PriceStatus {
    if (json.$typeName !== PriceStatus.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return PriceStatus.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): PriceStatus {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPriceStatus(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a PriceStatus object`,
      );
    }
    return PriceStatus.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): PriceStatus {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isPriceStatus(data.bcs.type)) {
        throw new Error(`object at is not a PriceStatus object`);
      }

      return PriceStatus.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return PriceStatus.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<PriceStatus> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching PriceStatus object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isPriceStatus(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a PriceStatus object`);
    }

    return PriceStatus.fromSuiObjectData(res.data);
  }
}
