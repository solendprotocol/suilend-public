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
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== GovernanceAction =============================== */

export function isGovernanceAction(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::governance_action::GovernanceAction`;
}

export interface GovernanceActionFields {
  value: ToField<"u8">;
}

export type GovernanceActionReified = Reified<
  GovernanceAction,
  GovernanceActionFields
>;

export class GovernanceAction implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::governance_action::GovernanceAction`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = GovernanceAction.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::governance_action::GovernanceAction`;
  readonly $typeArgs: [];
  readonly $isPhantom = GovernanceAction.$isPhantom;

  readonly value: ToField<"u8">;

  private constructor(typeArgs: [], fields: GovernanceActionFields) {
    this.$fullTypeName = composeSuiType(
      GovernanceAction.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::governance_action::GovernanceAction`;
    this.$typeArgs = typeArgs;

    this.value = fields.value;
  }

  static reified(): GovernanceActionReified {
    return {
      typeName: GovernanceAction.$typeName,
      fullTypeName: composeSuiType(
        GovernanceAction.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::governance_action::GovernanceAction`,
      typeArgs: [] as [],
      isPhantom: GovernanceAction.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        GovernanceAction.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        GovernanceAction.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => GovernanceAction.fromBcs(data),
      bcs: GovernanceAction.bcs,
      fromJSONField: (field: any) => GovernanceAction.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => GovernanceAction.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        GovernanceAction.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        GovernanceAction.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        GovernanceAction.fetch(client, id),
      new: (fields: GovernanceActionFields) => {
        return new GovernanceAction([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return GovernanceAction.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<GovernanceAction>> {
    return phantom(GovernanceAction.reified());
  }
  static get p() {
    return GovernanceAction.phantom();
  }

  static get bcs() {
    return bcs.struct("GovernanceAction", {
      value: bcs.u8(),
    });
  }

  static fromFields(fields: Record<string, any>): GovernanceAction {
    return GovernanceAction.reified().new({
      value: decodeFromFields("u8", fields.value),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): GovernanceAction {
    if (!isGovernanceAction(item.type)) {
      throw new Error("not a GovernanceAction type");
    }

    return GovernanceAction.reified().new({
      value: decodeFromFieldsWithTypes("u8", item.fields.value),
    });
  }

  static fromBcs(data: Uint8Array): GovernanceAction {
    return GovernanceAction.fromFields(GovernanceAction.bcs.parse(data));
  }

  toJSONField() {
    return {
      value: this.value,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): GovernanceAction {
    return GovernanceAction.reified().new({
      value: decodeFromJSONField("u8", field.value),
    });
  }

  static fromJSON(json: Record<string, any>): GovernanceAction {
    if (json.$typeName !== GovernanceAction.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return GovernanceAction.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): GovernanceAction {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isGovernanceAction(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a GovernanceAction object`,
      );
    }
    return GovernanceAction.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): GovernanceAction {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isGovernanceAction(data.bcs.type)
      ) {
        throw new Error(`object at is not a GovernanceAction object`);
      }

      return GovernanceAction.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return GovernanceAction.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<GovernanceAction> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching GovernanceAction object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isGovernanceAction(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a GovernanceAction object`);
    }

    return GovernanceAction.fromSuiObjectData(res.data);
  }
}
