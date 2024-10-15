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
import { Bytes20 } from "../bytes20/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== Guardian =============================== */

export function isGuardian(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::guardian::Guardian`;
}

export interface GuardianFields {
  pubkey: ToField<Bytes20>;
}

export type GuardianReified = Reified<Guardian, GuardianFields>;

export class Guardian implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::guardian::Guardian`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = Guardian.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::guardian::Guardian`;
  readonly $typeArgs: [];
  readonly $isPhantom = Guardian.$isPhantom;

  readonly pubkey: ToField<Bytes20>;

  private constructor(typeArgs: [], fields: GuardianFields) {
    this.$fullTypeName = composeSuiType(
      Guardian.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::guardian::Guardian`;
    this.$typeArgs = typeArgs;

    this.pubkey = fields.pubkey;
  }

  static reified(): GuardianReified {
    return {
      typeName: Guardian.$typeName,
      fullTypeName: composeSuiType(
        Guardian.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::guardian::Guardian`,
      typeArgs: [] as [],
      isPhantom: Guardian.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Guardian.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Guardian.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Guardian.fromBcs(data),
      bcs: Guardian.bcs,
      fromJSONField: (field: any) => Guardian.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Guardian.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Guardian.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        Guardian.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        Guardian.fetch(client, id),
      new: (fields: GuardianFields) => {
        return new Guardian([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Guardian.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Guardian>> {
    return phantom(Guardian.reified());
  }
  static get p() {
    return Guardian.phantom();
  }

  static get bcs() {
    return bcs.struct("Guardian", {
      pubkey: Bytes20.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): Guardian {
    return Guardian.reified().new({
      pubkey: decodeFromFields(Bytes20.reified(), fields.pubkey),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Guardian {
    if (!isGuardian(item.type)) {
      throw new Error("not a Guardian type");
    }

    return Guardian.reified().new({
      pubkey: decodeFromFieldsWithTypes(Bytes20.reified(), item.fields.pubkey),
    });
  }

  static fromBcs(data: Uint8Array): Guardian {
    return Guardian.fromFields(Guardian.bcs.parse(data));
  }

  toJSONField() {
    return {
      pubkey: this.pubkey.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): Guardian {
    return Guardian.reified().new({
      pubkey: decodeFromJSONField(Bytes20.reified(), field.pubkey),
    });
  }

  static fromJSON(json: Record<string, any>): Guardian {
    if (json.$typeName !== Guardian.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Guardian.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Guardian {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isGuardian(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a Guardian object`,
      );
    }
    return Guardian.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): Guardian {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isGuardian(data.bcs.type)) {
        throw new Error(`object at is not a Guardian object`);
      }

      return Guardian.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Guardian.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<Guardian> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching Guardian object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isGuardian(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a Guardian object`);
    }

    return Guardian.fromSuiObjectData(res.data);
  }
}
