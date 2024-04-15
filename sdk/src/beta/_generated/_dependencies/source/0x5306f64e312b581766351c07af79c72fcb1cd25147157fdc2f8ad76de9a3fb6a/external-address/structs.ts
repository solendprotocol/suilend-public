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
import { Bytes32 } from "../bytes32/structs";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== ExternalAddress =============================== */

export function isExternalAddress(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::external_address::ExternalAddress"
  );
}

export interface ExternalAddressFields {
  value: ToField<Bytes32>;
}

export type ExternalAddressReified = Reified<
  ExternalAddress,
  ExternalAddressFields
>;

export class ExternalAddress implements StructClass {
  static readonly $typeName =
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::external_address::ExternalAddress";
  static readonly $numTypeParams = 0;

  readonly $typeName = ExternalAddress.$typeName;

  readonly $fullTypeName: "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::external_address::ExternalAddress";

  readonly $typeArgs: [];

  readonly value: ToField<Bytes32>;

  private constructor(typeArgs: [], fields: ExternalAddressFields) {
    this.$fullTypeName = composeSuiType(
      ExternalAddress.$typeName,
      ...typeArgs,
    ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::external_address::ExternalAddress";
    this.$typeArgs = typeArgs;

    this.value = fields.value;
  }

  static reified(): ExternalAddressReified {
    return {
      typeName: ExternalAddress.$typeName,
      fullTypeName: composeSuiType(
        ExternalAddress.$typeName,
        ...[],
      ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::external_address::ExternalAddress",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        ExternalAddress.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        ExternalAddress.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => ExternalAddress.fromBcs(data),
      bcs: ExternalAddress.bcs,
      fromJSONField: (field: any) => ExternalAddress.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => ExternalAddress.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        ExternalAddress.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        ExternalAddress.fetch(client, id),
      new: (fields: ExternalAddressFields) => {
        return new ExternalAddress([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return ExternalAddress.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<ExternalAddress>> {
    return phantom(ExternalAddress.reified());
  }
  static get p() {
    return ExternalAddress.phantom();
  }

  static get bcs() {
    return bcs.struct("ExternalAddress", {
      value: Bytes32.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): ExternalAddress {
    return ExternalAddress.reified().new({
      value: decodeFromFields(Bytes32.reified(), fields.value),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): ExternalAddress {
    if (!isExternalAddress(item.type)) {
      throw new Error("not a ExternalAddress type");
    }

    return ExternalAddress.reified().new({
      value: decodeFromFieldsWithTypes(Bytes32.reified(), item.fields.value),
    });
  }

  static fromBcs(data: Uint8Array): ExternalAddress {
    return ExternalAddress.fromFields(ExternalAddress.bcs.parse(data));
  }

  toJSONField() {
    return {
      value: this.value.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): ExternalAddress {
    return ExternalAddress.reified().new({
      value: decodeFromJSONField(Bytes32.reified(), field.value),
    });
  }

  static fromJSON(json: Record<string, any>): ExternalAddress {
    if (json.$typeName !== ExternalAddress.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return ExternalAddress.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): ExternalAddress {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isExternalAddress(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a ExternalAddress object`,
      );
    }
    return ExternalAddress.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<ExternalAddress> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching ExternalAddress object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isExternalAddress(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a ExternalAddress object`);
    }
    return ExternalAddress.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
