import * as reified from "../../../../_framework/reified";
import {
  PhantomReified,
  Reified,
  StructClass,
  ToField,
  ToTypeArgument,
  ToTypeStr,
  TypeArgument,
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
  parseTypeName,
} from "../../../../_framework/util";
import { Vector } from "../../../../_framework/vector";
import { PKG_V1 } from "../index";
import { BcsType, bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== Cursor =============================== */

export function isCursor(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::cursor::Cursor` + "<");
}

export interface CursorFields<T extends TypeArgument> {
  data: ToField<Vector<T>>;
}

export type CursorReified<T extends TypeArgument> = Reified<
  Cursor<T>,
  CursorFields<T>
>;

export class Cursor<T extends TypeArgument> implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::cursor::Cursor`;
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [false] as const;

  readonly $typeName = Cursor.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::cursor::Cursor<${ToTypeStr<T>}>`;
  readonly $typeArgs: [ToTypeStr<T>];
  readonly $isPhantom = Cursor.$isPhantom;

  readonly data: ToField<Vector<T>>;

  private constructor(typeArgs: [ToTypeStr<T>], fields: CursorFields<T>) {
    this.$fullTypeName = composeSuiType(
      Cursor.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::cursor::Cursor<${ToTypeStr<T>}>`;
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
      ) as `${typeof PKG_V1}::cursor::Cursor<${ToTypeStr<ToTypeArgument<T>>}>`,
      typeArgs: [extractType(T)] as [ToTypeStr<ToTypeArgument<T>>],
      isPhantom: Cursor.$isPhantom,
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
      fromSuiObjectData: (content: SuiObjectData) =>
        Cursor.fromSuiObjectData(T, content),
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

  static fromSuiObjectData<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    data: SuiObjectData,
  ): Cursor<ToTypeArgument<T>> {
    if (data.bcs) {
      if (data.bcs.dataType !== "moveObject" || !isCursor(data.bcs.type)) {
        throw new Error(`object at is not a Cursor object`);
      }

      const gotTypeArgs = parseTypeName(data.bcs.type).typeArgs;
      if (gotTypeArgs.length !== 1) {
        throw new Error(
          `type argument mismatch: expected 1 type argument but got '${gotTypeArgs.length}'`,
        );
      }
      const gotTypeArg = compressSuiType(gotTypeArgs[0]);
      const expectedTypeArg = compressSuiType(extractType(typeArg));
      if (gotTypeArg !== compressSuiType(extractType(typeArg))) {
        throw new Error(
          `type argument mismatch: expected '${expectedTypeArg}' but got '${gotTypeArg}'`,
        );
      }

      return Cursor.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return Cursor.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
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

    return Cursor.fromSuiObjectData(typeArg, res.data);
  }
}
