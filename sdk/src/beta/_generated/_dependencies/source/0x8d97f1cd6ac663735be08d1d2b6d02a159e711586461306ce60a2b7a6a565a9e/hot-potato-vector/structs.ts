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

/* ============================== HotPotatoVector =============================== */

export function isHotPotatoVector(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::hot_potato_vector::HotPotatoVector` + "<");
}

export interface HotPotatoVectorFields<T extends TypeArgument> {
  contents: ToField<Vector<T>>;
}

export type HotPotatoVectorReified<T extends TypeArgument> = Reified<
  HotPotatoVector<T>,
  HotPotatoVectorFields<T>
>;

export class HotPotatoVector<T extends TypeArgument> implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::hot_potato_vector::HotPotatoVector`;
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [false] as const;

  readonly $typeName = HotPotatoVector.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::hot_potato_vector::HotPotatoVector<${ToTypeStr<T>}>`;
  readonly $typeArgs: [ToTypeStr<T>];
  readonly $isPhantom = HotPotatoVector.$isPhantom;

  readonly contents: ToField<Vector<T>>;

  private constructor(
    typeArgs: [ToTypeStr<T>],
    fields: HotPotatoVectorFields<T>,
  ) {
    this.$fullTypeName = composeSuiType(
      HotPotatoVector.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::hot_potato_vector::HotPotatoVector<${ToTypeStr<T>}>`;
    this.$typeArgs = typeArgs;

    this.contents = fields.contents;
  }

  static reified<T extends Reified<TypeArgument, any>>(
    T: T,
  ): HotPotatoVectorReified<ToTypeArgument<T>> {
    return {
      typeName: HotPotatoVector.$typeName,
      fullTypeName: composeSuiType(
        HotPotatoVector.$typeName,
        ...[extractType(T)],
      ) as `${typeof PKG_V1}::hot_potato_vector::HotPotatoVector<${ToTypeStr<ToTypeArgument<T>>}>`,
      typeArgs: [extractType(T)] as [ToTypeStr<ToTypeArgument<T>>],
      isPhantom: HotPotatoVector.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) =>
        HotPotatoVector.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        HotPotatoVector.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => HotPotatoVector.fromBcs(T, data),
      bcs: HotPotatoVector.bcs(toBcs(T)),
      fromJSONField: (field: any) => HotPotatoVector.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) =>
        HotPotatoVector.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) =>
        HotPotatoVector.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) =>
        HotPotatoVector.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) =>
        HotPotatoVector.fetch(client, T, id),
      new: (fields: HotPotatoVectorFields<ToTypeArgument<T>>) => {
        return new HotPotatoVector([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return HotPotatoVector.reified;
  }

  static phantom<T extends Reified<TypeArgument, any>>(
    T: T,
  ): PhantomReified<ToTypeStr<HotPotatoVector<ToTypeArgument<T>>>> {
    return phantom(HotPotatoVector.reified(T));
  }
  static get p() {
    return HotPotatoVector.phantom;
  }

  static get bcs() {
    return <T extends BcsType<any>>(T: T) =>
      bcs.struct(`HotPotatoVector<${T.name}>`, {
        contents: bcs.vector(T),
      });
  }

  static fromFields<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    fields: Record<string, any>,
  ): HotPotatoVector<ToTypeArgument<T>> {
    return HotPotatoVector.reified(typeArg).new({
      contents: decodeFromFields(reified.vector(typeArg), fields.contents),
    });
  }

  static fromFieldsWithTypes<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    item: FieldsWithTypes,
  ): HotPotatoVector<ToTypeArgument<T>> {
    if (!isHotPotatoVector(item.type)) {
      throw new Error("not a HotPotatoVector type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return HotPotatoVector.reified(typeArg).new({
      contents: decodeFromFieldsWithTypes(
        reified.vector(typeArg),
        item.fields.contents,
      ),
    });
  }

  static fromBcs<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    data: Uint8Array,
  ): HotPotatoVector<ToTypeArgument<T>> {
    const typeArgs = [typeArg];

    return HotPotatoVector.fromFields(
      typeArg,
      HotPotatoVector.bcs(toBcs(typeArgs[0])).parse(data),
    );
  }

  toJSONField() {
    return {
      contents: fieldToJSON<Vector<T>>(
        `vector<${this.$typeArgs[0]}>`,
        this.contents,
      ),
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
  ): HotPotatoVector<ToTypeArgument<T>> {
    return HotPotatoVector.reified(typeArg).new({
      contents: decodeFromJSONField(reified.vector(typeArg), field.contents),
    });
  }

  static fromJSON<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    json: Record<string, any>,
  ): HotPotatoVector<ToTypeArgument<T>> {
    if (json.$typeName !== HotPotatoVector.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(
      composeSuiType(HotPotatoVector.$typeName, extractType(typeArg)),
      json.$typeArgs,
      [typeArg],
    );

    return HotPotatoVector.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    content: SuiParsedData,
  ): HotPotatoVector<ToTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isHotPotatoVector(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a HotPotatoVector object`,
      );
    }
    return HotPotatoVector.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends Reified<TypeArgument, any>>(
    typeArg: T,
    data: SuiObjectData,
  ): HotPotatoVector<ToTypeArgument<T>> {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isHotPotatoVector(data.bcs.type)
      ) {
        throw new Error(`object at is not a HotPotatoVector object`);
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

      return HotPotatoVector.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return HotPotatoVector.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch<T extends Reified<TypeArgument, any>>(
    client: SuiClient,
    typeArg: T,
    id: string,
  ): Promise<HotPotatoVector<ToTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching HotPotatoVector object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isHotPotatoVector(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a HotPotatoVector object`);
    }

    return HotPotatoVector.fromSuiObjectData(typeArg, res.data);
  }
}
