import { Option } from "../../_dependencies/source/0x1/option/structs";
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
} from "../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../_framework/util";
import { BcsType, bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== Cell =============================== */

export function isCell(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(
    "0x9d5c964fda4247e0e191c5856bcdb7c96d19800c82d2a4a6e52740a64bc44625::cell::Cell<",
  );
}

export interface CellFields<Element extends TypeArgument> {
  element: ToField<Option<Element>>;
}

export type CellReified<Element extends TypeArgument> = Reified<
  Cell<Element>,
  CellFields<Element>
>;

export class Cell<Element extends TypeArgument> implements StructClass {
  static readonly $typeName =
    "0x9d5c964fda4247e0e191c5856bcdb7c96d19800c82d2a4a6e52740a64bc44625::cell::Cell";
  static readonly $numTypeParams = 1;

  readonly $typeName = Cell.$typeName;

  readonly $fullTypeName: `0x9d5c964fda4247e0e191c5856bcdb7c96d19800c82d2a4a6e52740a64bc44625::cell::Cell<${ToTypeStr<Element>}>`;

  readonly $typeArgs: [ToTypeStr<Element>];

  readonly element: ToField<Option<Element>>;

  private constructor(
    typeArgs: [ToTypeStr<Element>],
    fields: CellFields<Element>,
  ) {
    this.$fullTypeName = composeSuiType(
      Cell.$typeName,
      ...typeArgs,
    ) as `0x9d5c964fda4247e0e191c5856bcdb7c96d19800c82d2a4a6e52740a64bc44625::cell::Cell<${ToTypeStr<Element>}>`;
    this.$typeArgs = typeArgs;

    this.element = fields.element;
  }

  static reified<Element extends Reified<TypeArgument, any>>(
    Element: Element,
  ): CellReified<ToTypeArgument<Element>> {
    return {
      typeName: Cell.$typeName,
      fullTypeName: composeSuiType(
        Cell.$typeName,
        ...[extractType(Element)],
      ) as `0x9d5c964fda4247e0e191c5856bcdb7c96d19800c82d2a4a6e52740a64bc44625::cell::Cell<${ToTypeStr<ToTypeArgument<Element>>}>`,
      typeArgs: [extractType(Element)] as [ToTypeStr<ToTypeArgument<Element>>],
      reifiedTypeArgs: [Element],
      fromFields: (fields: Record<string, any>) =>
        Cell.fromFields(Element, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Cell.fromFieldsWithTypes(Element, item),
      fromBcs: (data: Uint8Array) => Cell.fromBcs(Element, data),
      bcs: Cell.bcs(toBcs(Element)),
      fromJSONField: (field: any) => Cell.fromJSONField(Element, field),
      fromJSON: (json: Record<string, any>) => Cell.fromJSON(Element, json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Cell.fromSuiParsedData(Element, content),
      fetch: async (client: SuiClient, id: string) =>
        Cell.fetch(client, Element, id),
      new: (fields: CellFields<ToTypeArgument<Element>>) => {
        return new Cell([extractType(Element)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Cell.reified;
  }

  static phantom<Element extends Reified<TypeArgument, any>>(
    Element: Element,
  ): PhantomReified<ToTypeStr<Cell<ToTypeArgument<Element>>>> {
    return phantom(Cell.reified(Element));
  }
  static get p() {
    return Cell.phantom;
  }

  static get bcs() {
    return <Element extends BcsType<any>>(Element: Element) =>
      bcs.struct(`Cell<${Element.name}>`, {
        element: Option.bcs(Element),
      });
  }

  static fromFields<Element extends Reified<TypeArgument, any>>(
    typeArg: Element,
    fields: Record<string, any>,
  ): Cell<ToTypeArgument<Element>> {
    return Cell.reified(typeArg).new({
      element: decodeFromFields(Option.reified(typeArg), fields.element),
    });
  }

  static fromFieldsWithTypes<Element extends Reified<TypeArgument, any>>(
    typeArg: Element,
    item: FieldsWithTypes,
  ): Cell<ToTypeArgument<Element>> {
    if (!isCell(item.type)) {
      throw new Error("not a Cell type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return Cell.reified(typeArg).new({
      element: decodeFromFieldsWithTypes(
        Option.reified(typeArg),
        item.fields.element,
      ),
    });
  }

  static fromBcs<Element extends Reified<TypeArgument, any>>(
    typeArg: Element,
    data: Uint8Array,
  ): Cell<ToTypeArgument<Element>> {
    const typeArgs = [typeArg];

    return Cell.fromFields(typeArg, Cell.bcs(toBcs(typeArgs[0])).parse(data));
  }

  toJSONField() {
    return {
      element: fieldToJSON<Option<Element>>(
        `0x1::option::Option<${this.$typeArgs[0]}>`,
        this.element,
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

  static fromJSONField<Element extends Reified<TypeArgument, any>>(
    typeArg: Element,
    field: any,
  ): Cell<ToTypeArgument<Element>> {
    return Cell.reified(typeArg).new({
      element: decodeFromJSONField(Option.reified(typeArg), field.element),
    });
  }

  static fromJSON<Element extends Reified<TypeArgument, any>>(
    typeArg: Element,
    json: Record<string, any>,
  ): Cell<ToTypeArgument<Element>> {
    if (json.$typeName !== Cell.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(
      composeSuiType(Cell.$typeName, extractType(typeArg)),
      json.$typeArgs,
      [typeArg],
    );

    return Cell.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<Element extends Reified<TypeArgument, any>>(
    typeArg: Element,
    content: SuiParsedData,
  ): Cell<ToTypeArgument<Element>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isCell(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a Cell object`,
      );
    }
    return Cell.fromFieldsWithTypes(typeArg, content);
  }

  static async fetch<Element extends Reified<TypeArgument, any>>(
    client: SuiClient,
    typeArg: Element,
    id: string,
  ): Promise<Cell<ToTypeArgument<Element>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching Cell object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isCell(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a Cell object`);
    }
    return Cell.fromBcs(typeArg, fromB64(res.data.bcs.bcsBytes));
  }
}
