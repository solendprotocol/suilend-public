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
} from "../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../_framework/util";
import { PKG_V1 } from "../index";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== MAIN_POOL =============================== */

export function isMAIN_POOL(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::suilend::MAIN_POOL`;
}

export interface MAIN_POOLFields {
  dummyField: ToField<"bool">;
}

export type MAIN_POOLReified = Reified<MAIN_POOL, MAIN_POOLFields>;

export class MAIN_POOL implements StructClass {
  static readonly $typeName = `${PKG_V1}::suilend::MAIN_POOL`;
  static readonly $numTypeParams = 0;

  readonly $typeName = MAIN_POOL.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::suilend::MAIN_POOL`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: MAIN_POOLFields) {
    this.$fullTypeName = composeSuiType(
      MAIN_POOL.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::suilend::MAIN_POOL`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): MAIN_POOLReified {
    return {
      typeName: MAIN_POOL.$typeName,
      fullTypeName: composeSuiType(
        MAIN_POOL.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::suilend::MAIN_POOL`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => MAIN_POOL.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        MAIN_POOL.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => MAIN_POOL.fromBcs(data),
      bcs: MAIN_POOL.bcs,
      fromJSONField: (field: any) => MAIN_POOL.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => MAIN_POOL.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        MAIN_POOL.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        MAIN_POOL.fetch(client, id),
      new: (fields: MAIN_POOLFields) => {
        return new MAIN_POOL([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return MAIN_POOL.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<MAIN_POOL>> {
    return phantom(MAIN_POOL.reified());
  }
  static get p() {
    return MAIN_POOL.phantom();
  }

  static get bcs() {
    return bcs.struct("MAIN_POOL", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): MAIN_POOL {
    return MAIN_POOL.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): MAIN_POOL {
    if (!isMAIN_POOL(item.type)) {
      throw new Error("not a MAIN_POOL type");
    }

    return MAIN_POOL.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): MAIN_POOL {
    return MAIN_POOL.fromFields(MAIN_POOL.bcs.parse(data));
  }

  toJSONField() {
    return {
      dummyField: this.dummyField,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): MAIN_POOL {
    return MAIN_POOL.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): MAIN_POOL {
    if (json.$typeName !== MAIN_POOL.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return MAIN_POOL.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): MAIN_POOL {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMAIN_POOL(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a MAIN_POOL object`,
      );
    }
    return MAIN_POOL.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<MAIN_POOL> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching MAIN_POOL object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isMAIN_POOL(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a MAIN_POOL object`);
    }
    return MAIN_POOL.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
