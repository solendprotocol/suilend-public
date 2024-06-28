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
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

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
  static readonly $typeName = `${PKG_V1}::price_status::PriceStatus`;
  static readonly $numTypeParams = 0;

  readonly $typeName = PriceStatus.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::price_status::PriceStatus`;

  readonly $typeArgs: [];

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
    return PriceStatus.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
