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
import { ID } from "../../0x2/object/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== MigrateComplete =============================== */

export function isMigrateComplete(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::migrate::MigrateComplete`;
}

export interface MigrateCompleteFields {
  package: ToField<ID>;
}

export type MigrateCompleteReified = Reified<
  MigrateComplete,
  MigrateCompleteFields
>;

export class MigrateComplete implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::migrate::MigrateComplete`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = MigrateComplete.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::migrate::MigrateComplete`;
  readonly $typeArgs: [];
  readonly $isPhantom = MigrateComplete.$isPhantom;

  readonly package: ToField<ID>;

  private constructor(typeArgs: [], fields: MigrateCompleteFields) {
    this.$fullTypeName = composeSuiType(
      MigrateComplete.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::migrate::MigrateComplete`;
    this.$typeArgs = typeArgs;

    this.package = fields.package;
  }

  static reified(): MigrateCompleteReified {
    return {
      typeName: MigrateComplete.$typeName,
      fullTypeName: composeSuiType(
        MigrateComplete.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::migrate::MigrateComplete`,
      typeArgs: [] as [],
      isPhantom: MigrateComplete.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        MigrateComplete.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        MigrateComplete.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => MigrateComplete.fromBcs(data),
      bcs: MigrateComplete.bcs,
      fromJSONField: (field: any) => MigrateComplete.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => MigrateComplete.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        MigrateComplete.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        MigrateComplete.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        MigrateComplete.fetch(client, id),
      new: (fields: MigrateCompleteFields) => {
        return new MigrateComplete([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return MigrateComplete.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<MigrateComplete>> {
    return phantom(MigrateComplete.reified());
  }
  static get p() {
    return MigrateComplete.phantom();
  }

  static get bcs() {
    return bcs.struct("MigrateComplete", {
      package: ID.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): MigrateComplete {
    return MigrateComplete.reified().new({
      package: decodeFromFields(ID.reified(), fields.package),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): MigrateComplete {
    if (!isMigrateComplete(item.type)) {
      throw new Error("not a MigrateComplete type");
    }

    return MigrateComplete.reified().new({
      package: decodeFromFieldsWithTypes(ID.reified(), item.fields.package),
    });
  }

  static fromBcs(data: Uint8Array): MigrateComplete {
    return MigrateComplete.fromFields(MigrateComplete.bcs.parse(data));
  }

  toJSONField() {
    return {
      package: this.package,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): MigrateComplete {
    return MigrateComplete.reified().new({
      package: decodeFromJSONField(ID.reified(), field.package),
    });
  }

  static fromJSON(json: Record<string, any>): MigrateComplete {
    if (json.$typeName !== MigrateComplete.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return MigrateComplete.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): MigrateComplete {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMigrateComplete(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a MigrateComplete object`,
      );
    }
    return MigrateComplete.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): MigrateComplete {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isMigrateComplete(data.bcs.type)
      ) {
        throw new Error(`object at is not a MigrateComplete object`);
      }

      return MigrateComplete.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return MigrateComplete.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<MigrateComplete> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching MigrateComplete object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isMigrateComplete(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a MigrateComplete object`);
    }

    return MigrateComplete.fromSuiObjectData(res.data);
  }
}
