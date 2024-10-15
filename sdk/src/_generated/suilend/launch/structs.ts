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
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== LAUNCH =============================== */

export function isLAUNCH(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0xa81dad144b39b6bfe8491d593136d0d2e21d308339990c23fa63275c28b43e86::launch::LAUNCH"
  );
}

export interface LAUNCHFields {
  dummyField: ToField<"bool">;
}

export type LAUNCHReified = Reified<LAUNCH, LAUNCHFields>;

export class LAUNCH implements StructClass {
  static readonly $typeName =
    "0xa81dad144b39b6bfe8491d593136d0d2e21d308339990c23fa63275c28b43e86::launch::LAUNCH";
  static readonly $numTypeParams = 0;

  readonly $typeName = LAUNCH.$typeName;

  readonly $fullTypeName: "0xa81dad144b39b6bfe8491d593136d0d2e21d308339990c23fa63275c28b43e86::launch::LAUNCH";

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: LAUNCHFields) {
    this.$fullTypeName = composeSuiType(
      LAUNCH.$typeName,
      ...typeArgs,
    ) as "0xa81dad144b39b6bfe8491d593136d0d2e21d308339990c23fa63275c28b43e86::launch::LAUNCH";
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): LAUNCHReified {
    return {
      typeName: LAUNCH.$typeName,
      fullTypeName: composeSuiType(
        LAUNCH.$typeName,
        ...[],
      ) as "0xa81dad144b39b6bfe8491d593136d0d2e21d308339990c23fa63275c28b43e86::launch::LAUNCH",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => LAUNCH.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        LAUNCH.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => LAUNCH.fromBcs(data),
      bcs: LAUNCH.bcs,
      fromJSONField: (field: any) => LAUNCH.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => LAUNCH.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        LAUNCH.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) => LAUNCH.fetch(client, id),
      new: (fields: LAUNCHFields) => {
        return new LAUNCH([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return LAUNCH.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<LAUNCH>> {
    return phantom(LAUNCH.reified());
  }
  static get p() {
    return LAUNCH.phantom();
  }

  static get bcs() {
    return bcs.struct("LAUNCH", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): LAUNCH {
    return LAUNCH.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): LAUNCH {
    if (!isLAUNCH(item.type)) {
      throw new Error("not a LAUNCH type");
    }

    return LAUNCH.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): LAUNCH {
    return LAUNCH.fromFields(LAUNCH.bcs.parse(data));
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

  static fromJSONField(field: any): LAUNCH {
    return LAUNCH.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): LAUNCH {
    if (json.$typeName !== LAUNCH.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return LAUNCH.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): LAUNCH {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isLAUNCH(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a LAUNCH object`,
      );
    }
    return LAUNCH.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<LAUNCH> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching LAUNCH object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isLAUNCH(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a LAUNCH object`);
    }
    return LAUNCH.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
