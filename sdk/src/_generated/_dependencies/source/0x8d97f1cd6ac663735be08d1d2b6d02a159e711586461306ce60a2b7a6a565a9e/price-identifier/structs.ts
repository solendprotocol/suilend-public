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
  fieldToJSON,
  phantom,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { Vector } from "../../../../_framework/vector";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== PriceIdentifier =============================== */

export function isPriceIdentifier(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::price_identifier::PriceIdentifier`;
}

export interface PriceIdentifierFields {
  bytes: ToField<Vector<"u8">>;
}

export type PriceIdentifierReified = Reified<
  PriceIdentifier,
  PriceIdentifierFields
>;

export class PriceIdentifier implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::price_identifier::PriceIdentifier`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = PriceIdentifier.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::price_identifier::PriceIdentifier`;
  readonly $typeArgs: [];
  readonly $isPhantom = PriceIdentifier.$isPhantom;

  readonly bytes: ToField<Vector<"u8">>;

  private constructor(typeArgs: [], fields: PriceIdentifierFields) {
    this.$fullTypeName = composeSuiType(
      PriceIdentifier.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::price_identifier::PriceIdentifier`;
    this.$typeArgs = typeArgs;

    this.bytes = fields.bytes;
  }

  static reified(): PriceIdentifierReified {
    return {
      typeName: PriceIdentifier.$typeName,
      fullTypeName: composeSuiType(
        PriceIdentifier.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::price_identifier::PriceIdentifier`,
      typeArgs: [] as [],
      isPhantom: PriceIdentifier.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        PriceIdentifier.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        PriceIdentifier.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => PriceIdentifier.fromBcs(data),
      bcs: PriceIdentifier.bcs,
      fromJSONField: (field: any) => PriceIdentifier.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => PriceIdentifier.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        PriceIdentifier.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        PriceIdentifier.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        PriceIdentifier.fetch(client, id),
      new: (fields: PriceIdentifierFields) => {
        return new PriceIdentifier([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PriceIdentifier.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<PriceIdentifier>> {
    return phantom(PriceIdentifier.reified());
  }
  static get p() {
    return PriceIdentifier.phantom();
  }

  static get bcs() {
    return bcs.struct("PriceIdentifier", {
      bytes: bcs.vector(bcs.u8()),
    });
  }

  static fromFields(fields: Record<string, any>): PriceIdentifier {
    return PriceIdentifier.reified().new({
      bytes: decodeFromFields(reified.vector("u8"), fields.bytes),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PriceIdentifier {
    if (!isPriceIdentifier(item.type)) {
      throw new Error("not a PriceIdentifier type");
    }

    return PriceIdentifier.reified().new({
      bytes: decodeFromFieldsWithTypes(reified.vector("u8"), item.fields.bytes),
    });
  }

  static fromBcs(data: Uint8Array): PriceIdentifier {
    return PriceIdentifier.fromFields(PriceIdentifier.bcs.parse(data));
  }

  toJSONField() {
    return {
      bytes: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.bytes),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): PriceIdentifier {
    return PriceIdentifier.reified().new({
      bytes: decodeFromJSONField(reified.vector("u8"), field.bytes),
    });
  }

  static fromJSON(json: Record<string, any>): PriceIdentifier {
    if (json.$typeName !== PriceIdentifier.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return PriceIdentifier.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): PriceIdentifier {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPriceIdentifier(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a PriceIdentifier object`,
      );
    }
    return PriceIdentifier.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): PriceIdentifier {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isPriceIdentifier(data.bcs.type)
      ) {
        throw new Error(`object at is not a PriceIdentifier object`);
      }

      return PriceIdentifier.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return PriceIdentifier.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<PriceIdentifier> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching PriceIdentifier object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isPriceIdentifier(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a PriceIdentifier object`);
    }

    return PriceIdentifier.fromSuiObjectData(res.data);
  }
}
