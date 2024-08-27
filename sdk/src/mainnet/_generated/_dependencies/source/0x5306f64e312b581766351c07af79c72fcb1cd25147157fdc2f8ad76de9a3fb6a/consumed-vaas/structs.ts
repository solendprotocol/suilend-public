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
  phantom,
  ToTypeStr as ToPhantom,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { Bytes32 } from "../bytes32/structs";
import { Set } from "../set/structs";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== ConsumedVAAs =============================== */

export function isConsumedVAAs(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::consumed_vaas::ConsumedVAAs"
  );
}

export interface ConsumedVAAsFields {
  hashes: ToField<Set<ToPhantom<Bytes32>>>;
}

export type ConsumedVAAsReified = Reified<ConsumedVAAs, ConsumedVAAsFields>;

export class ConsumedVAAs implements StructClass {
  static readonly $typeName =
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::consumed_vaas::ConsumedVAAs";
  static readonly $numTypeParams = 0;

  readonly $typeName = ConsumedVAAs.$typeName;

  readonly $fullTypeName: "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::consumed_vaas::ConsumedVAAs";

  readonly $typeArgs: [];

  readonly hashes: ToField<Set<ToPhantom<Bytes32>>>;

  private constructor(typeArgs: [], fields: ConsumedVAAsFields) {
    this.$fullTypeName = composeSuiType(
      ConsumedVAAs.$typeName,
      ...typeArgs,
    ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::consumed_vaas::ConsumedVAAs";
    this.$typeArgs = typeArgs;

    this.hashes = fields.hashes;
  }

  static reified(): ConsumedVAAsReified {
    return {
      typeName: ConsumedVAAs.$typeName,
      fullTypeName: composeSuiType(
        ConsumedVAAs.$typeName,
        ...[],
      ) as "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::consumed_vaas::ConsumedVAAs",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        ConsumedVAAs.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        ConsumedVAAs.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => ConsumedVAAs.fromBcs(data),
      bcs: ConsumedVAAs.bcs,
      fromJSONField: (field: any) => ConsumedVAAs.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => ConsumedVAAs.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        ConsumedVAAs.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        ConsumedVAAs.fetch(client, id),
      new: (fields: ConsumedVAAsFields) => {
        return new ConsumedVAAs([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return ConsumedVAAs.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<ConsumedVAAs>> {
    return phantom(ConsumedVAAs.reified());
  }
  static get p() {
    return ConsumedVAAs.phantom();
  }

  static get bcs() {
    return bcs.struct("ConsumedVAAs", {
      hashes: Set.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): ConsumedVAAs {
    return ConsumedVAAs.reified().new({
      hashes: decodeFromFields(
        Set.reified(reified.phantom(Bytes32.reified())),
        fields.hashes,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): ConsumedVAAs {
    if (!isConsumedVAAs(item.type)) {
      throw new Error("not a ConsumedVAAs type");
    }

    return ConsumedVAAs.reified().new({
      hashes: decodeFromFieldsWithTypes(
        Set.reified(reified.phantom(Bytes32.reified())),
        item.fields.hashes,
      ),
    });
  }

  static fromBcs(data: Uint8Array): ConsumedVAAs {
    return ConsumedVAAs.fromFields(ConsumedVAAs.bcs.parse(data));
  }

  toJSONField() {
    return {
      hashes: this.hashes.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): ConsumedVAAs {
    return ConsumedVAAs.reified().new({
      hashes: decodeFromJSONField(
        Set.reified(reified.phantom(Bytes32.reified())),
        field.hashes,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): ConsumedVAAs {
    if (json.$typeName !== ConsumedVAAs.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return ConsumedVAAs.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): ConsumedVAAs {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isConsumedVAAs(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a ConsumedVAAs object`,
      );
    }
    return ConsumedVAAs.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<ConsumedVAAs> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching ConsumedVAAs object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isConsumedVAAs(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a ConsumedVAAs object`);
    }
    return ConsumedVAAs.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
