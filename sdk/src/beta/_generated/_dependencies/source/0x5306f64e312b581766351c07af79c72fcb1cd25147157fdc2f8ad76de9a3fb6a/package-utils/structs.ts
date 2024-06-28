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
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { ID } from "../../0x2/object/structs";
import { Bytes32 } from "../bytes32/structs";
import { PKG_V1 } from "../index";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== CurrentVersion =============================== */

export function isCurrentVersion(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::package_utils::CurrentVersion`;
}

export interface CurrentVersionFields {
  dummyField: ToField<"bool">;
}

export type CurrentVersionReified = Reified<
  CurrentVersion,
  CurrentVersionFields
>;

export class CurrentVersion implements StructClass {
  static readonly $typeName = `${PKG_V1}::package_utils::CurrentVersion`;
  static readonly $numTypeParams = 0;

  readonly $typeName = CurrentVersion.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::package_utils::CurrentVersion`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: CurrentVersionFields) {
    this.$fullTypeName = composeSuiType(
      CurrentVersion.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::package_utils::CurrentVersion`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): CurrentVersionReified {
    return {
      typeName: CurrentVersion.$typeName,
      fullTypeName: composeSuiType(
        CurrentVersion.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::package_utils::CurrentVersion`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        CurrentVersion.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        CurrentVersion.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => CurrentVersion.fromBcs(data),
      bcs: CurrentVersion.bcs,
      fromJSONField: (field: any) => CurrentVersion.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => CurrentVersion.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        CurrentVersion.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        CurrentVersion.fetch(client, id),
      new: (fields: CurrentVersionFields) => {
        return new CurrentVersion([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return CurrentVersion.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<CurrentVersion>> {
    return phantom(CurrentVersion.reified());
  }
  static get p() {
    return CurrentVersion.phantom();
  }

  static get bcs() {
    return bcs.struct("CurrentVersion", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): CurrentVersion {
    return CurrentVersion.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): CurrentVersion {
    if (!isCurrentVersion(item.type)) {
      throw new Error("not a CurrentVersion type");
    }

    return CurrentVersion.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): CurrentVersion {
    return CurrentVersion.fromFields(CurrentVersion.bcs.parse(data));
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

  static fromJSONField(field: any): CurrentVersion {
    return CurrentVersion.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): CurrentVersion {
    if (json.$typeName !== CurrentVersion.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return CurrentVersion.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): CurrentVersion {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isCurrentVersion(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a CurrentVersion object`,
      );
    }
    return CurrentVersion.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<CurrentVersion> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching CurrentVersion object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isCurrentVersion(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a CurrentVersion object`);
    }
    return CurrentVersion.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== CurrentPackage =============================== */

export function isCurrentPackage(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::package_utils::CurrentPackage`;
}

export interface CurrentPackageFields {
  dummyField: ToField<"bool">;
}

export type CurrentPackageReified = Reified<
  CurrentPackage,
  CurrentPackageFields
>;

export class CurrentPackage implements StructClass {
  static readonly $typeName = `${PKG_V1}::package_utils::CurrentPackage`;
  static readonly $numTypeParams = 0;

  readonly $typeName = CurrentPackage.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::package_utils::CurrentPackage`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: CurrentPackageFields) {
    this.$fullTypeName = composeSuiType(
      CurrentPackage.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::package_utils::CurrentPackage`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): CurrentPackageReified {
    return {
      typeName: CurrentPackage.$typeName,
      fullTypeName: composeSuiType(
        CurrentPackage.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::package_utils::CurrentPackage`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        CurrentPackage.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        CurrentPackage.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => CurrentPackage.fromBcs(data),
      bcs: CurrentPackage.bcs,
      fromJSONField: (field: any) => CurrentPackage.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => CurrentPackage.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        CurrentPackage.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        CurrentPackage.fetch(client, id),
      new: (fields: CurrentPackageFields) => {
        return new CurrentPackage([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return CurrentPackage.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<CurrentPackage>> {
    return phantom(CurrentPackage.reified());
  }
  static get p() {
    return CurrentPackage.phantom();
  }

  static get bcs() {
    return bcs.struct("CurrentPackage", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): CurrentPackage {
    return CurrentPackage.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): CurrentPackage {
    if (!isCurrentPackage(item.type)) {
      throw new Error("not a CurrentPackage type");
    }

    return CurrentPackage.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): CurrentPackage {
    return CurrentPackage.fromFields(CurrentPackage.bcs.parse(data));
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

  static fromJSONField(field: any): CurrentPackage {
    return CurrentPackage.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): CurrentPackage {
    if (json.$typeName !== CurrentPackage.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return CurrentPackage.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): CurrentPackage {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isCurrentPackage(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a CurrentPackage object`,
      );
    }
    return CurrentPackage.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<CurrentPackage> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching CurrentPackage object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isCurrentPackage(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a CurrentPackage object`);
    }
    return CurrentPackage.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== PackageInfo =============================== */

export function isPackageInfo(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::package_utils::PackageInfo`;
}

export interface PackageInfoFields {
  package: ToField<ID>;
  digest: ToField<Bytes32>;
}

export type PackageInfoReified = Reified<PackageInfo, PackageInfoFields>;

export class PackageInfo implements StructClass {
  static readonly $typeName = `${PKG_V1}::package_utils::PackageInfo`;
  static readonly $numTypeParams = 0;

  readonly $typeName = PackageInfo.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::package_utils::PackageInfo`;

  readonly $typeArgs: [];

  readonly package: ToField<ID>;
  readonly digest: ToField<Bytes32>;

  private constructor(typeArgs: [], fields: PackageInfoFields) {
    this.$fullTypeName = composeSuiType(
      PackageInfo.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::package_utils::PackageInfo`;
    this.$typeArgs = typeArgs;

    this.package = fields.package;
    this.digest = fields.digest;
  }

  static reified(): PackageInfoReified {
    return {
      typeName: PackageInfo.$typeName,
      fullTypeName: composeSuiType(
        PackageInfo.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::package_utils::PackageInfo`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        PackageInfo.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        PackageInfo.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => PackageInfo.fromBcs(data),
      bcs: PackageInfo.bcs,
      fromJSONField: (field: any) => PackageInfo.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => PackageInfo.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        PackageInfo.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        PackageInfo.fetch(client, id),
      new: (fields: PackageInfoFields) => {
        return new PackageInfo([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PackageInfo.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<PackageInfo>> {
    return phantom(PackageInfo.reified());
  }
  static get p() {
    return PackageInfo.phantom();
  }

  static get bcs() {
    return bcs.struct("PackageInfo", {
      package: ID.bcs,
      digest: Bytes32.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): PackageInfo {
    return PackageInfo.reified().new({
      package: decodeFromFields(ID.reified(), fields.package),
      digest: decodeFromFields(Bytes32.reified(), fields.digest),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PackageInfo {
    if (!isPackageInfo(item.type)) {
      throw new Error("not a PackageInfo type");
    }

    return PackageInfo.reified().new({
      package: decodeFromFieldsWithTypes(ID.reified(), item.fields.package),
      digest: decodeFromFieldsWithTypes(Bytes32.reified(), item.fields.digest),
    });
  }

  static fromBcs(data: Uint8Array): PackageInfo {
    return PackageInfo.fromFields(PackageInfo.bcs.parse(data));
  }

  toJSONField() {
    return {
      package: this.package,
      digest: this.digest.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): PackageInfo {
    return PackageInfo.reified().new({
      package: decodeFromJSONField(ID.reified(), field.package),
      digest: decodeFromJSONField(Bytes32.reified(), field.digest),
    });
  }

  static fromJSON(json: Record<string, any>): PackageInfo {
    if (json.$typeName !== PackageInfo.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return PackageInfo.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): PackageInfo {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPackageInfo(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a PackageInfo object`,
      );
    }
    return PackageInfo.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<PackageInfo> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching PackageInfo object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isPackageInfo(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a PackageInfo object`);
    }
    return PackageInfo.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== PendingPackage =============================== */

export function isPendingPackage(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::package_utils::PendingPackage`;
}

export interface PendingPackageFields {
  dummyField: ToField<"bool">;
}

export type PendingPackageReified = Reified<
  PendingPackage,
  PendingPackageFields
>;

export class PendingPackage implements StructClass {
  static readonly $typeName = `${PKG_V1}::package_utils::PendingPackage`;
  static readonly $numTypeParams = 0;

  readonly $typeName = PendingPackage.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::package_utils::PendingPackage`;

  readonly $typeArgs: [];

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: PendingPackageFields) {
    this.$fullTypeName = composeSuiType(
      PendingPackage.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::package_utils::PendingPackage`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): PendingPackageReified {
    return {
      typeName: PendingPackage.$typeName,
      fullTypeName: composeSuiType(
        PendingPackage.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::package_utils::PendingPackage`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        PendingPackage.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        PendingPackage.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => PendingPackage.fromBcs(data),
      bcs: PendingPackage.bcs,
      fromJSONField: (field: any) => PendingPackage.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => PendingPackage.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        PendingPackage.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        PendingPackage.fetch(client, id),
      new: (fields: PendingPackageFields) => {
        return new PendingPackage([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return PendingPackage.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<PendingPackage>> {
    return phantom(PendingPackage.reified());
  }
  static get p() {
    return PendingPackage.phantom();
  }

  static get bcs() {
    return bcs.struct("PendingPackage", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): PendingPackage {
    return PendingPackage.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): PendingPackage {
    if (!isPendingPackage(item.type)) {
      throw new Error("not a PendingPackage type");
    }

    return PendingPackage.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): PendingPackage {
    return PendingPackage.fromFields(PendingPackage.bcs.parse(data));
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

  static fromJSONField(field: any): PendingPackage {
    return PendingPackage.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): PendingPackage {
    if (json.$typeName !== PendingPackage.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return PendingPackage.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): PendingPackage {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isPendingPackage(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a PendingPackage object`,
      );
    }
    return PendingPackage.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<PendingPackage> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching PendingPackage object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isPendingPackage(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a PendingPackage object`);
    }
    return PendingPackage.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
