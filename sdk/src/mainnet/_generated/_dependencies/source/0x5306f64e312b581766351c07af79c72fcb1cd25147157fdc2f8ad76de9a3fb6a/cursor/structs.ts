import * as reified from "../../../../_framework/reified";
import {
  PhantomReified,
  Reified,
  StructClass,
  ToField,
  ToTypeArgument,
  ToTypeStr,
  TypeArgument,
  Vector,
  assertFieldsWithTypesArgsMatch,
  assertReifiedTypeArgsMatch,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  extractType,
  fieldToJSON,
  phantom,
  toBcs,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { BcsType, bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== Cursor =============================== */

export function isCursor(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::cursor::Cursor<",
  );
}

export interface CursorFields<T extends TypeArgument> {
  data: ToField<Vector<T>>;
}

export type CursorReified<T extends TypeArgument> = Reified<
  Cursor<T>,
  CursorFields<T>
>;

export class Cursor<T extends TypeArgument> implements StructClass {
  static readonly $typeName =
    "0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::cursor::Cursor";
  static readonly $numTypeParams = 1;

  readonly $typeName = Cursor.$typeName;

  readonly $fullTypeName: `0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::cursor::Cursor<${ToTypeStr<T>}>`;

  readonly $typeArgs: [ToTypeStr<T>];

  readonly data: ToField<Vector<T>>;

  private constructor(typeArgs: [ToTypeStr<T>], fields: CursorFields<T>) {
    this.$fullTypeName = composeSuiType(
      Cursor.$typeName,
      ...typeArgs,
    ) as `0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::cursor::Cursor<${ToTypeStr<T>}>`;
    this.$typeArgs = typeArgs;

    this.data = fields.data;
  }

  static reified<T extends Reified<TypeArgument, any>>(
    T: T,
  ): CursorReified<ToTypeArgument<T>> {
    return {
      typeName: Cursor.$typeName,
      fullTypeName: composeSuiType(
        Cursor.$typeName,
        ...[extractType(T)],
      ) as `0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a::cursor::Cursor<${ToTypeStr<ToTypeArgument<T>>}>`,
      typeArgs: [extractType(T)] as [ToTypeStr<ToTypeArgument<T>>],
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => Cursor.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Cursor.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => Cursor.fromBcs(T, data),
      bcs: Cursor.bcs(toBcs(T)),
      fromJSONField: (field: any) => Cursor.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => Cursor.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Cursor.fromSuiParsedData(T, content),
      fetch: async (client: SuiClient, id: string) =>
        Cursor.fetch(client, T, id),
      new: (fields: CursorFields<ToTypeArgument<T>>) => {
        return new Cursor([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Cursor.reified;
  }

  static phantom<T extends Reified<TypeArgument, any>>(
    T: T,
  ): PhantomReified<ToTypeStr<Cursor<ToTypeArgument<T>>>> {
    return phantom(Cursor.reified(T));
  }
  static get p() {
    return Cursor.phantom;
  }

  static get bcs() {
    return <T extends BcsType<any>>(T: T) =>
      bcs.struct(`Cursor<${T.name}>`, {
        data: bcs.vector(T),
      });
  }

  static fromFields<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    fields: Record<string, any>,
  ): Cursor<ToTypeArgument<T>> {
    return Cursor.reified(typeArg).new({
      data: decodeFromFields(reified.vector(typeArg), fields.data),
    });
  }

  static fromFieldsWithTypes<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    item: FieldsWithTypes,
  ): Cursor<ToTypeArgument<T>> {
    if (!isCursor(item.type)) {
      throw new Error("not a Cursor type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return Cursor.reified(typeArg).new({
      data: decodeFromFieldsWithTypes(
        reified.vector(typeArg),
        item.fields.data,
      ),
    });
  }

  static fromBcs<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    data: Uint8Array,
  ): Cursor<ToTypeArgument<T>> {
    const typeArgs = [typeArg];

    return Cursor.fromFields(
      typeArg,
      Cursor.bcs(toBcs(typeArgs[0])).parse(data),
    );
  }

  toJSONField() {
    return {
      data: fieldToJSON<Vector<T>>(`vector<${this.$typeArgs[0]}>`, this.data),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    field: any,
  ): Cursor<ToTypeArgument<T>> {
    return Cursor.reified(typeArg).new({
      data: decodeFromJSONField(reified.vector(typeArg), field.data),
    });
  }

  static fromJSON<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    json: Record<string, any>,
  ): Cursor<ToTypeArgument<T>> {
    if (json.$typeName !== Cursor.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(
      composeSuiType(Cursor.$typeName, extractType(typeArg)),
      json.$typeArgs,
      [typeArg],
    );

    return Cursor.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    content: SuiParsedData,
  ): Cursor<ToTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isCursor(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a Cursor object`,
      );
    }
    return Cursor.fromFieldsWithTypes(typeArg, content);
  }

  static async fetch<T extends Reified<TypeArgument, any>>(
    client: SuiClient,
    typeArg: T,
    id: string,
  ): Promise<Cursor<ToTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching Cursor object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isCursor(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a Cursor object`);
    }
    return Cursor.fromBcs(typeArg, fromB64(res.data.bcs.bcsBytes));
  }
}
