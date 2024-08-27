import * as reified from "../../../../_framework/reified";
import {
  PhantomReified,
  Reified,
  StructClass,
  ToField,
  ToTypeStr,
  Vector,
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
import { GovernanceAction } from "../governance-action/structs";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== GovernanceInstruction =============================== */

export function isGovernanceInstruction(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::governance_instruction::GovernanceInstruction"
  );
}

export interface GovernanceInstructionFields {
  module: ToField<"u8">;
  action: ToField<GovernanceAction>;
  targetChainId: ToField<"u64">;
  payload: ToField<Vector<"u8">>;
}

export type GovernanceInstructionReified = Reified<
  GovernanceInstruction,
  GovernanceInstructionFields
>;

export class GovernanceInstruction implements StructClass {
  static readonly $typeName =
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::governance_instruction::GovernanceInstruction";
  static readonly $numTypeParams = 0;

  readonly $typeName = GovernanceInstruction.$typeName;

  readonly $fullTypeName: "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::governance_instruction::GovernanceInstruction";

  readonly $typeArgs: [];

  readonly module: ToField<"u8">;
  readonly action: ToField<GovernanceAction>;
  readonly targetChainId: ToField<"u64">;
  readonly payload: ToField<Vector<"u8">>;

  private constructor(typeArgs: [], fields: GovernanceInstructionFields) {
    this.$fullTypeName = composeSuiType(
      GovernanceInstruction.$typeName,
      ...typeArgs,
    ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::governance_instruction::GovernanceInstruction";
    this.$typeArgs = typeArgs;

    this.module = fields.module;
    this.action = fields.action;
    this.targetChainId = fields.targetChainId;
    this.payload = fields.payload;
  }

  static reified(): GovernanceInstructionReified {
    return {
      typeName: GovernanceInstruction.$typeName,
      fullTypeName: composeSuiType(
        GovernanceInstruction.$typeName,
        ...[],
      ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::governance_instruction::GovernanceInstruction",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        GovernanceInstruction.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        GovernanceInstruction.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => GovernanceInstruction.fromBcs(data),
      bcs: GovernanceInstruction.bcs,
      fromJSONField: (field: any) => GovernanceInstruction.fromJSONField(field),
      fromJSON: (json: Record<string, any>) =>
        GovernanceInstruction.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        GovernanceInstruction.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        GovernanceInstruction.fetch(client, id),
      new: (fields: GovernanceInstructionFields) => {
        return new GovernanceInstruction([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return GovernanceInstruction.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<GovernanceInstruction>> {
    return phantom(GovernanceInstruction.reified());
  }
  static get p() {
    return GovernanceInstruction.phantom();
  }

  static get bcs() {
    return bcs.struct("GovernanceInstruction", {
      module_: bcs.u8(),
      action: GovernanceAction.bcs,
      target_chain_id: bcs.u64(),
      payload: bcs.vector(bcs.u8()),
    });
  }

  static fromFields(fields: Record<string, any>): GovernanceInstruction {
    return GovernanceInstruction.reified().new({
      module: decodeFromFields("u8", fields.module_),
      action: decodeFromFields(GovernanceAction.reified(), fields.action),
      targetChainId: decodeFromFields("u64", fields.target_chain_id),
      payload: decodeFromFields(reified.vector("u8"), fields.payload),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): GovernanceInstruction {
    if (!isGovernanceInstruction(item.type)) {
      throw new Error("not a GovernanceInstruction type");
    }

    return GovernanceInstruction.reified().new({
      module: decodeFromFieldsWithTypes("u8", item.fields.module_),
      action: decodeFromFieldsWithTypes(
        GovernanceAction.reified(),
        item.fields.action,
      ),
      targetChainId: decodeFromFieldsWithTypes(
        "u64",
        item.fields.target_chain_id,
      ),
      payload: decodeFromFieldsWithTypes(
        reified.vector("u8"),
        item.fields.payload,
      ),
    });
  }

  static fromBcs(data: Uint8Array): GovernanceInstruction {
    return GovernanceInstruction.fromFields(
      GovernanceInstruction.bcs.parse(data),
    );
  }

  toJSONField() {
    return {
      module: this.module,
      action: this.action.toJSONField(),
      targetChainId: this.targetChainId.toString(),
      payload: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.payload),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): GovernanceInstruction {
    return GovernanceInstruction.reified().new({
      module: decodeFromJSONField("u8", field.module),
      action: decodeFromJSONField(GovernanceAction.reified(), field.action),
      targetChainId: decodeFromJSONField("u64", field.targetChainId),
      payload: decodeFromJSONField(reified.vector("u8"), field.payload),
    });
  }

  static fromJSON(json: Record<string, any>): GovernanceInstruction {
    if (json.$typeName !== GovernanceInstruction.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return GovernanceInstruction.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): GovernanceInstruction {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isGovernanceInstruction(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a GovernanceInstruction object`,
      );
    }
    return GovernanceInstruction.fromFieldsWithTypes(content);
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<GovernanceInstruction> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching GovernanceInstruction object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isGovernanceInstruction(res.data.bcs.type)
    ) {
      throw new Error(
        `object at id ${id} is not a GovernanceInstruction object`,
      );
    }
    return GovernanceInstruction.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
