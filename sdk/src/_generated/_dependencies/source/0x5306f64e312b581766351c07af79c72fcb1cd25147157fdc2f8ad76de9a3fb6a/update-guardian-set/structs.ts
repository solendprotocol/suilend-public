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
  fieldToJSON,
  phantom,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { Vector } from "../../../../_framework/vector";
import { Guardian } from "../guardian/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== GovernanceWitness =============================== */

export function isGovernanceWitness(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::update_guardian_set::GovernanceWitness`;
}

export interface GovernanceWitnessFields {
  dummyField: ToField<"bool">;
}

export type GovernanceWitnessReified = Reified<
  GovernanceWitness,
  GovernanceWitnessFields
>;

export class GovernanceWitness implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::update_guardian_set::GovernanceWitness`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = GovernanceWitness.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::update_guardian_set::GovernanceWitness`;
  readonly $typeArgs: [];
  readonly $isPhantom = GovernanceWitness.$isPhantom;

  readonly dummyField: ToField<"bool">;

  private constructor(typeArgs: [], fields: GovernanceWitnessFields) {
    this.$fullTypeName = composeSuiType(
      GovernanceWitness.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::update_guardian_set::GovernanceWitness`;
    this.$typeArgs = typeArgs;

    this.dummyField = fields.dummyField;
  }

  static reified(): GovernanceWitnessReified {
    return {
      typeName: GovernanceWitness.$typeName,
      fullTypeName: composeSuiType(
        GovernanceWitness.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::update_guardian_set::GovernanceWitness`,
      typeArgs: [] as [],
      isPhantom: GovernanceWitness.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        GovernanceWitness.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        GovernanceWitness.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => GovernanceWitness.fromBcs(data),
      bcs: GovernanceWitness.bcs,
      fromJSONField: (field: any) => GovernanceWitness.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => GovernanceWitness.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        GovernanceWitness.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        GovernanceWitness.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        GovernanceWitness.fetch(client, id),
      new: (fields: GovernanceWitnessFields) => {
        return new GovernanceWitness([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return GovernanceWitness.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<GovernanceWitness>> {
    return phantom(GovernanceWitness.reified());
  }
  static get p() {
    return GovernanceWitness.phantom();
  }

  static get bcs() {
    return bcs.struct("GovernanceWitness", {
      dummy_field: bcs.bool(),
    });
  }

  static fromFields(fields: Record<string, any>): GovernanceWitness {
    return GovernanceWitness.reified().new({
      dummyField: decodeFromFields("bool", fields.dummy_field),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): GovernanceWitness {
    if (!isGovernanceWitness(item.type)) {
      throw new Error("not a GovernanceWitness type");
    }

    return GovernanceWitness.reified().new({
      dummyField: decodeFromFieldsWithTypes("bool", item.fields.dummy_field),
    });
  }

  static fromBcs(data: Uint8Array): GovernanceWitness {
    return GovernanceWitness.fromFields(GovernanceWitness.bcs.parse(data));
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

  static fromJSONField(field: any): GovernanceWitness {
    return GovernanceWitness.reified().new({
      dummyField: decodeFromJSONField("bool", field.dummyField),
    });
  }

  static fromJSON(json: Record<string, any>): GovernanceWitness {
    if (json.$typeName !== GovernanceWitness.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return GovernanceWitness.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): GovernanceWitness {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isGovernanceWitness(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a GovernanceWitness object`,
      );
    }
    return GovernanceWitness.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): GovernanceWitness {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isGovernanceWitness(data.bcs.type)
      ) {
        throw new Error(`object at is not a GovernanceWitness object`);
      }

      return GovernanceWitness.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return GovernanceWitness.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<GovernanceWitness> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching GovernanceWitness object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isGovernanceWitness(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a GovernanceWitness object`);
    }

    return GovernanceWitness.fromSuiObjectData(res.data);
  }
}

/* ============================== GuardianSetAdded =============================== */

export function isGuardianSetAdded(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::update_guardian_set::GuardianSetAdded`;
}

export interface GuardianSetAddedFields {
  newIndex: ToField<"u32">;
}

export type GuardianSetAddedReified = Reified<
  GuardianSetAdded,
  GuardianSetAddedFields
>;

export class GuardianSetAdded implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::update_guardian_set::GuardianSetAdded`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = GuardianSetAdded.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::update_guardian_set::GuardianSetAdded`;
  readonly $typeArgs: [];
  readonly $isPhantom = GuardianSetAdded.$isPhantom;

  readonly newIndex: ToField<"u32">;

  private constructor(typeArgs: [], fields: GuardianSetAddedFields) {
    this.$fullTypeName = composeSuiType(
      GuardianSetAdded.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::update_guardian_set::GuardianSetAdded`;
    this.$typeArgs = typeArgs;

    this.newIndex = fields.newIndex;
  }

  static reified(): GuardianSetAddedReified {
    return {
      typeName: GuardianSetAdded.$typeName,
      fullTypeName: composeSuiType(
        GuardianSetAdded.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::update_guardian_set::GuardianSetAdded`,
      typeArgs: [] as [],
      isPhantom: GuardianSetAdded.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        GuardianSetAdded.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        GuardianSetAdded.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => GuardianSetAdded.fromBcs(data),
      bcs: GuardianSetAdded.bcs,
      fromJSONField: (field: any) => GuardianSetAdded.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => GuardianSetAdded.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        GuardianSetAdded.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        GuardianSetAdded.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        GuardianSetAdded.fetch(client, id),
      new: (fields: GuardianSetAddedFields) => {
        return new GuardianSetAdded([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return GuardianSetAdded.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<GuardianSetAdded>> {
    return phantom(GuardianSetAdded.reified());
  }
  static get p() {
    return GuardianSetAdded.phantom();
  }

  static get bcs() {
    return bcs.struct("GuardianSetAdded", {
      new_index: bcs.u32(),
    });
  }

  static fromFields(fields: Record<string, any>): GuardianSetAdded {
    return GuardianSetAdded.reified().new({
      newIndex: decodeFromFields("u32", fields.new_index),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): GuardianSetAdded {
    if (!isGuardianSetAdded(item.type)) {
      throw new Error("not a GuardianSetAdded type");
    }

    return GuardianSetAdded.reified().new({
      newIndex: decodeFromFieldsWithTypes("u32", item.fields.new_index),
    });
  }

  static fromBcs(data: Uint8Array): GuardianSetAdded {
    return GuardianSetAdded.fromFields(GuardianSetAdded.bcs.parse(data));
  }

  toJSONField() {
    return {
      newIndex: this.newIndex,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): GuardianSetAdded {
    return GuardianSetAdded.reified().new({
      newIndex: decodeFromJSONField("u32", field.newIndex),
    });
  }

  static fromJSON(json: Record<string, any>): GuardianSetAdded {
    if (json.$typeName !== GuardianSetAdded.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return GuardianSetAdded.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): GuardianSetAdded {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isGuardianSetAdded(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a GuardianSetAdded object`,
      );
    }
    return GuardianSetAdded.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): GuardianSetAdded {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isGuardianSetAdded(data.bcs.type)
      ) {
        throw new Error(`object at is not a GuardianSetAdded object`);
      }

      return GuardianSetAdded.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return GuardianSetAdded.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<GuardianSetAdded> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching GuardianSetAdded object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isGuardianSetAdded(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a GuardianSetAdded object`);
    }

    return GuardianSetAdded.fromSuiObjectData(res.data);
  }
}

/* ============================== UpdateGuardianSet =============================== */

export function isUpdateGuardianSet(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::update_guardian_set::UpdateGuardianSet`;
}

export interface UpdateGuardianSetFields {
  newIndex: ToField<"u32">;
  guardians: ToField<Vector<Guardian>>;
}

export type UpdateGuardianSetReified = Reified<
  UpdateGuardianSet,
  UpdateGuardianSetFields
>;

export class UpdateGuardianSet implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::update_guardian_set::UpdateGuardianSet`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = UpdateGuardianSet.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::update_guardian_set::UpdateGuardianSet`;
  readonly $typeArgs: [];
  readonly $isPhantom = UpdateGuardianSet.$isPhantom;

  readonly newIndex: ToField<"u32">;
  readonly guardians: ToField<Vector<Guardian>>;

  private constructor(typeArgs: [], fields: UpdateGuardianSetFields) {
    this.$fullTypeName = composeSuiType(
      UpdateGuardianSet.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::update_guardian_set::UpdateGuardianSet`;
    this.$typeArgs = typeArgs;

    this.newIndex = fields.newIndex;
    this.guardians = fields.guardians;
  }

  static reified(): UpdateGuardianSetReified {
    return {
      typeName: UpdateGuardianSet.$typeName,
      fullTypeName: composeSuiType(
        UpdateGuardianSet.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::update_guardian_set::UpdateGuardianSet`,
      typeArgs: [] as [],
      isPhantom: UpdateGuardianSet.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        UpdateGuardianSet.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        UpdateGuardianSet.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => UpdateGuardianSet.fromBcs(data),
      bcs: UpdateGuardianSet.bcs,
      fromJSONField: (field: any) => UpdateGuardianSet.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => UpdateGuardianSet.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        UpdateGuardianSet.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        UpdateGuardianSet.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        UpdateGuardianSet.fetch(client, id),
      new: (fields: UpdateGuardianSetFields) => {
        return new UpdateGuardianSet([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return UpdateGuardianSet.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<UpdateGuardianSet>> {
    return phantom(UpdateGuardianSet.reified());
  }
  static get p() {
    return UpdateGuardianSet.phantom();
  }

  static get bcs() {
    return bcs.struct("UpdateGuardianSet", {
      new_index: bcs.u32(),
      guardians: bcs.vector(Guardian.bcs),
    });
  }

  static fromFields(fields: Record<string, any>): UpdateGuardianSet {
    return UpdateGuardianSet.reified().new({
      newIndex: decodeFromFields("u32", fields.new_index),
      guardians: decodeFromFields(
        reified.vector(Guardian.reified()),
        fields.guardians,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): UpdateGuardianSet {
    if (!isUpdateGuardianSet(item.type)) {
      throw new Error("not a UpdateGuardianSet type");
    }

    return UpdateGuardianSet.reified().new({
      newIndex: decodeFromFieldsWithTypes("u32", item.fields.new_index),
      guardians: decodeFromFieldsWithTypes(
        reified.vector(Guardian.reified()),
        item.fields.guardians,
      ),
    });
  }

  static fromBcs(data: Uint8Array): UpdateGuardianSet {
    return UpdateGuardianSet.fromFields(UpdateGuardianSet.bcs.parse(data));
  }

  toJSONField() {
    return {
      newIndex: this.newIndex,
      guardians: fieldToJSON<Vector<Guardian>>(
        `vector<${Guardian.$typeName}>`,
        this.guardians,
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

  static fromJSONField(field: any): UpdateGuardianSet {
    return UpdateGuardianSet.reified().new({
      newIndex: decodeFromJSONField("u32", field.newIndex),
      guardians: decodeFromJSONField(
        reified.vector(Guardian.reified()),
        field.guardians,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): UpdateGuardianSet {
    if (json.$typeName !== UpdateGuardianSet.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return UpdateGuardianSet.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): UpdateGuardianSet {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isUpdateGuardianSet(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a UpdateGuardianSet object`,
      );
    }
    return UpdateGuardianSet.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): UpdateGuardianSet {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isUpdateGuardianSet(data.bcs.type)
      ) {
        throw new Error(`object at is not a UpdateGuardianSet object`);
      }

      return UpdateGuardianSet.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return UpdateGuardianSet.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<UpdateGuardianSet> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching UpdateGuardianSet object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isUpdateGuardianSet(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a UpdateGuardianSet object`);
    }

    return UpdateGuardianSet.fromSuiObjectData(res.data);
  }
}
