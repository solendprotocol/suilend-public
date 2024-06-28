import * as reified from "../../_framework/reified";
import { TypeName } from "../../_dependencies/source/0x1/type-name/structs";
import { ID, UID } from "../../_dependencies/source/0x2/object/structs";
import { Table } from "../../_dependencies/source/0x2/table/structs";
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
} from "../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../_framework/util";
import { PKG_V1 } from "../index";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== LENDING_MARKET_2 =============================== */

export function isLENDING_MARKET_2(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::lending_market_registry::LENDING_MARKET_2`;
}

export interface LENDING_MARKET_2Fields {
  dummyField: ToField<"bool">;
}

export type LENDING_MARKET_2Reified = Reified<
  LENDING_MARKET_2,
  LENDING_MARKET_2Fields
>;

export class LENDING_MARKET_2 implements StructClass {
  static readonly $typeName = `${PKG_V1}::lending_market_registry::LENDING_MARKET_2`;
  static readonly $numTypeParams = 0;

  readonly $typeName = LENDING_MARKET_2.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::lending_market_registry::LENDING_MARKET_2`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: LENDING_MARKET_2Fields) {
    this.$fullTypeName = composeSuiType(
      LENDING_MARKET_2.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::lending_market_registry::LENDING_MARKET_2`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): LENDING_MARKET_2Reified {
    return {
      typeName: LENDING_MARKET_2.$typeName,
      fullTypeName: composeSuiType(
        LENDING_MARKET_2.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::lending_market_registry::LENDING_MARKET_2`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        LENDING_MARKET_2.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        LENDING_MARKET_2.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => LENDING_MARKET_2.fromBcs(data),
      bcs: LENDING_MARKET_2.bcs,
      fromJSONField: (field: any) => LENDING_MARKET_2.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => LENDING_MARKET_2.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        LENDING_MARKET_2.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        LENDING_MARKET_2.fetch(client, id),
      new: (fields: LENDING_MARKET_2Fields) => {
        return new LENDING_MARKET_2([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return LENDING_MARKET_2.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<LENDING_MARKET_2>> {
    return phantom(LENDING_MARKET_2.reified());
  }
  static get p() {
    return LENDING_MARKET_2.phantom();
  }

  static get bcs() {
    return bcs.struct("LENDING_MARKET_2", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): LENDING_MARKET_2 {
    return LENDING_MARKET_2.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): LENDING_MARKET_2 {
    if (!isLENDING_MARKET_2(item.type)) {
      throw new Error("not a LENDING_MARKET_2 type");
    }

    return LENDING_MARKET_2.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): LENDING_MARKET_2 {
    return LENDING_MARKET_2.fromFields(LENDING_MARKET_2.bcs.parse(data));
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

  static fromJSONField(field: any): LENDING_MARKET_2 {
    return LENDING_MARKET_2.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): LENDING_MARKET_2 {
    if (json.$typeName !== LENDING_MARKET_2.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return LENDING_MARKET_2.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): LENDING_MARKET_2 {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isLENDING_MARKET_2(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a LENDING_MARKET_2 object`,
      );
    }
    return LENDING_MARKET_2.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<LENDING_MARKET_2> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching LENDING_MARKET_2 object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isLENDING_MARKET_2(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a LENDING_MARKET_2 object`);
    }
    return LENDING_MARKET_2.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== Registry =============================== */

export function isRegistry(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::lending_market_registry::Registry`;
}

export interface RegistryFields {
  id: ToField<UID>;
  version: ToField<"u64">;
  lendingMarkets: ToField<Table<ToPhantom<TypeName>, ToPhantom<ID>>>;
}

export type RegistryReified = Reified<Registry, RegistryFields>;

export class Registry implements StructClass {
  static readonly $typeName = `${PKG_V1}::lending_market_registry::Registry`;
  static readonly $numTypeParams = 0;

  readonly $typeName = Registry.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::lending_market_registry::Registry`;

  readonly $typeArgs: [];

  readonly id: ToField<UID>;
  readonly version: ToField<"u64">;
  readonly lendingMarkets: ToField<Table<ToPhantom<TypeName>, ToPhantom<ID>>>;

  private constructor(typeArgs: [], fields: RegistryFields) {
    this.$fullTypeName = composeSuiType(
      Registry.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::lending_market_registry::Registry`;
    this.$typeArgs = typeArgs;

    this.id = fields.id;
    this.version = fields.version;
    this.lendingMarkets = fields.lendingMarkets;
  }

  static reified(): RegistryReified {
    return {
      typeName: Registry.$typeName,
      fullTypeName: composeSuiType(
        Registry.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::lending_market_registry::Registry`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Registry.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Registry.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Registry.fromBcs(data),
      bcs: Registry.bcs,
      fromJSONField: (field: any) => Registry.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Registry.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Registry.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        Registry.fetch(client, id),
      new: (fields: RegistryFields) => {
        return new Registry([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Registry.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Registry>> {
    return phantom(Registry.reified());
  }
  static get p() {
    return Registry.phantom();
  }

  static get bcs() {
    return bcs.struct("Registry", {
      id: UID.bcs,
      version: bcs.u64(),
      lending_markets: Table.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): Registry {
    return Registry.reified().new({
      id: decodeFromFields(UID.reified(), fields.id),
      version: decodeFromFields("u64", fields.version),
      lendingMarkets: decodeFromFields(
        Table.reified(
          reified.phantom(TypeName.reified()),
          reified.phantom(ID.reified()),
        ),
        fields.lending_markets,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Registry {
    if (!isRegistry(item.type)) {
      throw new Error("not a Registry type");
    }

    return Registry.reified().new({
      id: decodeFromFieldsWithTypes(UID.reified(), item.fields.id),
      version: decodeFromFieldsWithTypes("u64", item.fields.version),
      lendingMarkets: decodeFromFieldsWithTypes(
        Table.reified(
          reified.phantom(TypeName.reified()),
          reified.phantom(ID.reified()),
        ),
        item.fields.lending_markets,
      ),
    });
  }

  static fromBcs(data: Uint8Array): Registry {
    return Registry.fromFields(Registry.bcs.parse(data));
  }

  toJSONField() {
    return {
      id: this.id,
      version: this.version.toString(),
      lendingMarkets: this.lendingMarkets.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): Registry {
    return Registry.reified().new({
      id: decodeFromJSONField(UID.reified(), field.id),
      version: decodeFromJSONField("u64", field.version),
      lendingMarkets: decodeFromJSONField(
        Table.reified(
          reified.phantom(TypeName.reified()),
          reified.phantom(ID.reified()),
        ),
        field.lendingMarkets,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): Registry {
    if (json.$typeName !== Registry.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Registry.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Registry {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isRegistry(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a Registry object`,
      );
    }
    return Registry.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<Registry> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching Registry object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isRegistry(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a Registry object`);
    }
    return Registry.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
