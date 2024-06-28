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
  ToTypeStr as ToPhantom,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { Table } from "../../0x2/table/structs";
import { PKG_V1 } from "../index";
import { BcsType, bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== Set =============================== */

export function isSet(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::set::Set` + "<");
}

export interface SetFields<A extends TypeArgument> {
  keys: ToField<Vector<A>>;
  elems: ToField<Table<ToPhantom<A>, ToPhantom<Unit>>>;
}

export type SetReified<A extends TypeArgument> = Reified<Set<A>, SetFields<A>>;

export class Set<A extends TypeArgument> implements StructClass {
  static readonly $typeName = `${PKG_V1}::set::Set`;
  static readonly $numTypeParams = 1;

  readonly $typeName = Set.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::set::Set<${ToTypeStr<A>}>`;

  readonly $typeArgs: [ToTypeStr<A>];

  readonly keys: ToField<Vector<A>>;
  readonly elems: ToField<Table<ToPhantom<A>, ToPhantom<Unit>>>;

  private constructor(typeArgs: [ToTypeStr<A>], fields: SetFields<A>) {
    this.$fullTypeName = composeSuiType(
      Set.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::set::Set<${ToTypeStr<A>}>`;
    this.$typeArgs = typeArgs;

    this.keys = fields.keys;
    this.elems = fields.elems;
  }

  static reified<A extends Reified<TypeArgument, any>>(
    A: A,
  ): SetReified<ToTypeArgument<A>> {
    return {
      typeName: Set.$typeName,
      fullTypeName: composeSuiType(
        Set.$typeName,
        ...[extractType(A)],
      ) as `${typeof PKG_V1}::set::Set<${ToTypeStr<ToTypeArgument<A>>}>`,
      typeArgs: [extractType(A)] as [ToTypeStr<ToTypeArgument<A>>],
      reifiedTypeArgs: [A],
      fromFields: (fields: Record<string, any>) => Set.fromFields(A, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Set.fromFieldsWithTypes(A, item),
      fromBcs: (data: Uint8Array) => Set.fromBcs(A, data),
      bcs: Set.bcs(toBcs(A)),
      fromJSONField: (field: any) => Set.fromJSONField(A, field),
      fromJSON: (json: Record<string, any>) => Set.fromJSON(A, json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Set.fromSuiParsedData(A, content),
      fetch: async (client: SuiClient, id: string) => Set.fetch(client, A, id),
      new: (fields: SetFields<ToTypeArgument<A>>) => {
        return new Set([extractType(A)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Set.reified;
  }

  static phantom<A extends Reified<TypeArgument, any>>(
    A: A,
  ): PhantomReified<ToTypeStr<Set<ToTypeArgument<A>>>> {
    return phantom(Set.reified(A));
  }
  static get p() {
    return Set.phantom;
  }

  static get bcs() {
    return <A extends BcsType<any>>(A: A) =>
      bcs.struct(`Set<${A.name}>`, {
        keys: bcs.vector(A),
        elems: Table.bcs,
      });
  }

  static fromFields<A extends Reified<TypeArgument, any>>(
    typeArg: A,
    fields: Record<string, any>,
  ): Set<ToTypeArgument<A>> {
    return Set.reified(typeArg).new({
      keys: decodeFromFields(reified.vector(typeArg), fields.keys),
      elems: decodeFromFields(
        Table.reified(
          reified.phantom(typeArg),
          reified.phantom(Unit.reified()),
        ),
        fields.elems,
      ),
    });
  }

  static fromFieldsWithTypes<A extends Reified<TypeArgument, any>>(
    typeArg: A,
    item: FieldsWithTypes,
  ): Set<ToTypeArgument<A>> {
    if (!isSet(item.type)) {
      throw new Error("not a Set type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return Set.reified(typeArg).new({
      keys: decodeFromFieldsWithTypes(
        reified.vector(typeArg),
        item.fields.keys,
      ),
      elems: decodeFromFieldsWithTypes(
        Table.reified(
          reified.phantom(typeArg),
          reified.phantom(Unit.reified()),
        ),
        item.fields.elems,
      ),
    });
  }

  static fromBcs<A extends Reified<TypeArgument, any>>(
    typeArg: A,
    data: Uint8Array,
  ): Set<ToTypeArgument<A>> {
    const typeArgs = [typeArg];

    return Set.fromFields(typeArg, Set.bcs(toBcs(typeArgs[0])).parse(data));
  }

  toJSONField() {
    return {
      keys: fieldToJSON<Vector<A>>(`vector<${this.$typeArgs[0]}>`, this.keys),
      elems: this.elems.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField<A extends Reified<TypeArgument, any>>(
    typeArg: A,
    field: any,
  ): Set<ToTypeArgument<A>> {
    return Set.reified(typeArg).new({
      keys: decodeFromJSONField(reified.vector(typeArg), field.keys),
      elems: decodeFromJSONField(
        Table.reified(
          reified.phantom(typeArg),
          reified.phantom(Unit.reified()),
        ),
        field.elems,
      ),
    });
  }

  static fromJSON<A extends Reified<TypeArgument, any>>(
    typeArg: A,
    json: Record<string, any>,
  ): Set<ToTypeArgument<A>> {
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

  static fromSuiParsedData<A extends Reified<TypeArgument, any>>(
    typeArg: A,
    content: SuiParsedData,
  ): Set<ToTypeArgument<A>> {
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

  static async fetch<A extends Reified<TypeArgument, any>>(
    client: SuiClient,
    typeArg: A,
    id: string,
  ): Promise<Set<ToTypeArgument<A>>> {
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

/* ============================== Unit =============================== */

export function isUnit(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::set::Unit`;
}

export interface UnitFields {
  dummyField: ToField<"bool">;
}

export type UnitReified = Reified<Unit, UnitFields>;

export class Unit implements StructClass {
  static readonly $typeName = `${PKG_V1}::set::Unit`;
  static readonly $numTypeParams = 0;

  readonly $typeName = Unit.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::set::Unit`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: UnitFields) {
    this.$fullTypeName = composeSuiType(
      Unit.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::set::Unit`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): UnitReified {
    return {
      typeName: Unit.$typeName,
      fullTypeName: composeSuiType(
        Unit.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::set::Unit`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Unit.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Unit.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Unit.fromBcs(data),
      bcs: Unit.bcs,
      fromJSONField: (field: any) => Unit.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Unit.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Unit.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) => Unit.fetch(client, id),
      new: (fields: UnitFields) => {
        return new Unit([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Unit.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Unit>> {
    return phantom(Unit.reified());
  }
  static get p() {
    return Unit.phantom();
  }

  static get bcs() {
    return bcs.struct("Unit", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): Unit {
    return Unit.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Unit {
    if (!isUnit(item.type)) {
      throw new Error("not a Unit type");
    }

    return Unit.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): Unit {
    return Unit.fromFields(Unit.bcs.parse(data));
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

  static fromJSONField(field: any): Unit {
    return Unit.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): Unit {
    if (json.$typeName !== Unit.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Unit.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Unit {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isUnit(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a Unit object`,
      );
    }
    return Unit.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<Unit> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching Unit object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isUnit(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a Unit object`);
    }
    return Unit.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
