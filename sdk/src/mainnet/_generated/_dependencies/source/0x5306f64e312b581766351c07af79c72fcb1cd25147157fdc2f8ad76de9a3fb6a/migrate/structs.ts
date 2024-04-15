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
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== MigrateComplete =============================== */

export function isMigrateComplete(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::migrate::MigrateComplete"
  );
}

export interface MigrateCompleteFields {
  package: ToField<ID>;
}

export type MigrateCompleteReified = Reified<
  MigrateComplete,
  MigrateCompleteFields
>;

export class MigrateComplete implements StructClass {
  static readonly $typeName =
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::migrate::MigrateComplete";
  static readonly $numTypeParams = 0;

  readonly $typeName = MigrateComplete.$typeName;

  readonly $fullTypeName: "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::migrate::MigrateComplete";

  readonly $typeArgs: [];

  readonly package: ToField<ID>;

  private constructor(typeArgs: [], fields: MigrateCompleteFields) {
    this.$fullTypeName = composeSuiType(
      MigrateComplete.$typeName,
      ...typeArgs,
    ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::migrate::MigrateComplete";
    this.$typeArgs = typeArgs;

    this.package = fields.package;
  }

  static reified(): MigrateCompleteReified {
    return {
      typeName: MigrateComplete.$typeName,
      fullTypeName: composeSuiType(
        MigrateComplete.$typeName,
        ...[],
      ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::migrate::MigrateComplete",
      typeArgs: [] as [],
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
    return MigrateComplete.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
