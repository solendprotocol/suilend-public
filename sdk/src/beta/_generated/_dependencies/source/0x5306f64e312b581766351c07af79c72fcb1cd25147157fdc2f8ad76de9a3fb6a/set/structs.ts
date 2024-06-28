import * as reified from "../../../../_framework/reified";
import {
  PhantomReified,
  PhantomToTypeStr,
  PhantomTypeArgument,
  Reified,
  StructClass,
  ToField,
  ToPhantomTypeArgument,
  ToTypeStr,
  assertFieldsWithTypesArgsMatch,
  assertReifiedTypeArgsMatch,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  extractType,
  phantom,
  ToTypeStr as ToPhantom,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { Table } from "../../0x2/table/structs";
import { PKG_V1 } from "../index";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== Empty =============================== */

export function isEmpty(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::set::Empty`;
}

export interface EmptyFields {
  dummyField: ToField<"bool">;
}

export type EmptyReified = Reified<Empty, EmptyFields>;

export class Empty implements StructClass {
  static readonly $typeName = `${PKG_V1}::set::Empty`;
  static readonly $numTypeParams = 0;

  readonly $typeName = Empty.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::set::Empty`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: EmptyFields) {
    this.$fullTypeName = composeSuiType(
      Empty.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::set::Empty`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): EmptyReified {
    return {
      typeName: Empty.$typeName,
      fullTypeName: composeSuiType(
        Empty.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::set::Empty`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Empty.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Empty.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Empty.fromBcs(data),
      bcs: Empty.bcs,
      fromJSONField: (field: any) => Empty.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Empty.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Empty.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) => Empty.fetch(client, id),
      new: (fields: EmptyFields) => {
        return new Empty([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Empty.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Empty>> {
    return phantom(Empty.reified());
  }
  static get p() {
    return Empty.phantom();
  }

  static get bcs() {
    return bcs.struct("Empty", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): Empty {
    return Empty.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Empty {
    if (!isEmpty(item.type)) {
      throw new Error("not a Empty type");
    }

    return Empty.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): Empty {
    return Empty.fromFields(Empty.bcs.parse(data));
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

  static fromJSONField(field: any): Empty {
    return Empty.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): Empty {
    if (json.$typeName !== Empty.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Empty.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Empty {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isEmpty(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a Empty object`,
      );
    }
    return Empty.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<Empty> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching Empty object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isEmpty(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a Empty object`);
    }
    return Empty.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== Set =============================== */

export function isSet(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::set::Set` + "<");
}

export interface SetFields<T extends PhantomTypeArgument> {
  items: ToField<Table<T, ToPhantom<Empty>>>;
}

export type SetReified<T extends PhantomTypeArgument> = Reified<
  Set<T>,
  SetFields<T>
>;

export class Set<T extends PhantomTypeArgument> implements StructClass {
  static readonly $typeName = `${PKG_V1}::set::Set`;
  static readonly $numTypeParams = 1;

  readonly $typeName = Set.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::set::Set<${PhantomToTypeStr<T>}>`;

  readonly $typeArgs: [PhantomToTypeStr<T>];

  readonly items: ToField<Table<T, ToPhantom<Empty>>>;

  private constructor(typeArgs: [PhantomToTypeStr<T>], fields: SetFields<T>) {
    this.$fullTypeName = composeSuiType(
      Set.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::set::Set<${PhantomToTypeStr<T>}>`;
    this.$typeArgs = typeArgs;

    this.items = fields.items;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(
    T: T,
  ): SetReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: Set.$typeName,
      fullTypeName: composeSuiType(
        Set.$typeName,
        ...[extractType(T)],
      ) as `${typeof PKG_V1}::set::Set<${PhantomToTypeStr<ToPhantomTypeArgument<T>>}>`,
      typeArgs: [extractType(T)] as [
        PhantomToTypeStr<ToPhantomTypeArgument<T>>,
      ],
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) => Set.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Set.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => Set.fromBcs(T, data),
      bcs: Set.bcs,
      fromJSONField: (field: any) => Set.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => Set.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Set.fromSuiParsedData(T, content),
      fetch: async (client: SuiClient, id: string) => Set.fetch(client, T, id),
      new: (fields: SetFields<ToPhantomTypeArgument<T>>) => {
        return new Set([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Set.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T,
  ): PhantomReified<ToTypeStr<Set<ToPhantomTypeArgument<T>>>> {
    return phantom(Set.reified(T));
  }
  static get p() {
    return Set.phantom;
  }

  static get bcs() {
    return bcs.struct("Set", {
      items: Table.bcs,
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>,
  ): Set<ToPhantomTypeArgument<T>> {
    return Set.reified(typeArg).new({
      items: decodeFromFields(
        Table.reified(typeArg, reified.phantom(Empty.reified())),
        fields.items,
      ),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes,
  ): Set<ToPhantomTypeArgument<T>> {
    if (!isSet(item.type)) {
      throw new Error("not a Set type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return Set.reified(typeArg).new({
      items: decodeFromFieldsWithTypes(
        Table.reified(typeArg, reified.phantom(Empty.reified())),
        item.fields.items,
      ),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array,
  ): Set<ToPhantomTypeArgument<T>> {
    return Set.fromFields(typeArg, Set.bcs.parse(data));
  }

  toJSONField() {
    return {
      items: this.items.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    field: any,
  ): Set<ToPhantomTypeArgument<T>> {
    return Set.reified(typeArg).new({
      items: decodeFromJSONField(
        Table.reified(typeArg, reified.phantom(Empty.reified())),
        field.items,
      ),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>,
  ): Set<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== Set.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(
      composeSuiType(Set.$typeName, extractType(typeArg)),
      json.$typeArgs,
      [typeArg],
    );

    return Set.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData,
  ): Set<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isSet(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a Set object`,
      );
    }
    return Set.fromFieldsWithTypes(typeArg, content);
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string,
  ): Promise<Set<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching Set object at id ${id}: ${res.error.code}`,
      );
    }
    if (res.data?.bcs?.dataType !== "moveObject" || !isSet(res.data.bcs.type)) {
      throw new Error(`object at id ${id} is not a Set object`);
    }
    return Set.fromBcs(typeArg, fromB64(res.data.bcs.bcsBytes));
  }
}
