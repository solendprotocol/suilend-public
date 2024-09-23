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
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== ExternalAddress =============================== */

export function isExternalAddress(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::external_address::ExternalAddress`;
}

export interface ExternalAddressFields {
  value: ToField<Bytes32>;
}

export type ExternalAddressReified = Reified<
  ExternalAddress,
  ExternalAddressFields
>;

export class ExternalAddress implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::external_address::ExternalAddress`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = ExternalAddress.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::external_address::ExternalAddress`;
  readonly $typeArgs: [];
  readonly $isPhantom = ExternalAddress.$isPhantom;

  readonly value: ToField<Bytes32>;

  private constructor(typeArgs: [], fields: ExternalAddressFields) {
    this.$fullTypeName = composeSuiType(
      ExternalAddress.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::external_address::ExternalAddress`;
    this.$typeArgs = typeArgs;

    this.value = fields.value;
  }

  static reified(): ExternalAddressReified {
    return {
      typeName: ExternalAddress.$typeName,
      fullTypeName: composeSuiType(
        ExternalAddress.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::external_address::ExternalAddress`,
      typeArgs: [] as [],
      isPhantom: ExternalAddress.$isPhantom,
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
      fromSuiObjectData: (content: SuiObjectData) =>
        ExternalAddress.fromSuiObjectData(content),
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

  static fromSuiObjectData(data: SuiObjectData): ExternalAddress {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isExternalAddress(data.bcs.type)
      ) {
        throw new Error(`object at is not a ExternalAddress object`);
      }

      return ExternalAddress.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return ExternalAddress.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
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

    return ExternalAddress.fromSuiObjectData(res.data);
  }
}
