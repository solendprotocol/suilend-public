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
import { UID } from "../../0x2/object/structs";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== DeployerCap =============================== */

export function isDeployerCap(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::setup::DeployerCap"
  );
}

export interface DeployerCapFields {
  id: ToField<UID>;
}

export type DeployerCapReified = Reified<DeployerCap, DeployerCapFields>;

export class DeployerCap implements StructClass {
  static readonly $typeName =
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::setup::DeployerCap";
  static readonly $numTypeParams = 0;

  readonly $typeName = DeployerCap.$typeName;

  readonly $fullTypeName: "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::setup::DeployerCap";

  readonly $typeArgs: [];

  readonly id: ToField<UID>;

  private constructor(typeArgs: [], fields: DeployerCapFields) {
    this.$fullTypeName = composeSuiType(
      DeployerCap.$typeName,
      ...typeArgs,
    ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::setup::DeployerCap";
    this.$typeArgs = typeArgs;

    this.id = fields.id;
  }

  static reified(): DeployerCapReified {
    return {
      typeName: DeployerCap.$typeName,
      fullTypeName: composeSuiType(
        DeployerCap.$typeName,
        ...[],
      ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::setup::DeployerCap",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        DeployerCap.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        DeployerCap.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => DeployerCap.fromBcs(data),
      bcs: DeployerCap.bcs,
      fromJSONField: (field: any) => DeployerCap.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => DeployerCap.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        DeployerCap.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        DeployerCap.fetch(client, id),
      new: (fields: DeployerCapFields) => {
        return new DeployerCap([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return DeployerCap.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<DeployerCap>> {
    return phantom(DeployerCap.reified());
  }
  static get p() {
    return DeployerCap.phantom();
  }

  static get bcs() {
    return bcs.struct("DeployerCap", {
      id: UID.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): DeployerCap {
    return DeployerCap.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): DeployerCap {
    if (!isDeployerCap(item.type)) {
      throw new Error("not a DeployerCap type");
    }

    return DeployerCap.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
    });
  }

  static fromBcs(data: Uint8Array): DeployerCap {
    return DeployerCap.fromFields(DeployerCap.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): DeployerCap {
    return DeployerCap.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
    });
  }

  static fromJSON(json: Record<string, any>): DeployerCap {
    if (json.$typeName !== DeployerCap.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return DeployerCap.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): DeployerCap {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isDeployerCap(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a DeployerCap object`,
      );
    }
    return DeployerCap.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<DeployerCap> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching DeployerCap object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isDeployerCap(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a DeployerCap object`);
    }
    return DeployerCap.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
