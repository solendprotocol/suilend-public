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
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== DeployerCap =============================== */

export function isDeployerCap(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::setup::DeployerCap`;
}

export interface DeployerCapFields {
  id: ToField<UID>;
}

export type DeployerCapReified = Reified<DeployerCap, DeployerCapFields>;

export class DeployerCap implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::setup::DeployerCap`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = DeployerCap.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::setup::DeployerCap`;
  readonly $typeArgs: [];
  readonly $isPhantom = DeployerCap.$isPhantom;

  readonly id: ToField<UID>;

  private constructor(typeArgs: [], fields: DeployerCapFields) {
    this.$fullTypeName = composeSuiType(
      DeployerCap.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::setup::DeployerCap`;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
  }

  static reified(): DeployerCapReified {
    return {
      typeName: DeployerCap.$typeName,
      fullTypeName: composeSuiType(
        DeployerCap.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::setup::DeployerCap`,
      typeArgs: [] as [],
      isPhantom: DeployerCap.$isPhantom,
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
      fromSuiObjectData: (content: SuiObjectData) =>
        DeployerCap.fromSuiObjectData(content),
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

  static fromSuiObjectData(data: SuiObjectData): DeployerCap {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isDeployerCap(data.bcs.type)) {
        throw new Error(`object at is not a DeployerCap object`);
      }

      return DeployerCap.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return DeployerCap.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
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

    return DeployerCap.fromSuiObjectData(res.data);
  }
}
