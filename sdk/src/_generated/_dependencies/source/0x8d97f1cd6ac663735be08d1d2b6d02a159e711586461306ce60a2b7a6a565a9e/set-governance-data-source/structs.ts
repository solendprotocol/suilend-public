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
import { ExternalAddress } from "../../0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a/external-address/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== GovernanceDataSource =============================== */

export function isGovernanceDataSource(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::set_governance_data_source::GovernanceDataSource`;
}

export interface GovernanceDataSourceFields {
  emitterChainId: ToField<"u64">;
  emitterAddress: ToField<ExternalAddress>;
  initialSequence: ToField<"u64">;
}

export type GovernanceDataSourceReified = Reified<
  GovernanceDataSource,
  GovernanceDataSourceFields
>;

export class GovernanceDataSource implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::set_governance_data_source::GovernanceDataSource`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = GovernanceDataSource.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::set_governance_data_source::GovernanceDataSource`;
  readonly $typeArgs: [];
  readonly $isPhantom = GovernanceDataSource.$isPhantom;

  readonly emitterChainId: ToField<"u64">;
  readonly emitterAddress: ToField<ExternalAddress>;
  readonly initialSequence: ToField<"u64">;

  private constructor(typeArgs: [], fields: GovernanceDataSourceFields) {
    this.$fullTypeName = composeSuiType(
      GovernanceDataSource.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::set_governance_data_source::GovernanceDataSource`;
    this.$typeArgs = typeArgs;

    this.emitterChainId = fields.emitterChainId;
    this.emitterAddress = fields.emitterAddress;
    this.initialSequence = fields.initialSequence;
  }

  static reified(): GovernanceDataSourceReified {
    return {
      typeName: GovernanceDataSource.$typeName,
      fullTypeName: composeSuiType(
        GovernanceDataSource.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::set_governance_data_source::GovernanceDataSource`,
      typeArgs: [] as [],
      isPhantom: GovernanceDataSource.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        GovernanceDataSource.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        GovernanceDataSource.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => GovernanceDataSource.fromBcs(data),
      bcs: GovernanceDataSource.bcs,
      fromJSONField: (field: any) => GovernanceDataSource.fromJSONField(field),
      fromJSON: (json: Record<string, any>) =>
        GovernanceDataSource.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        GovernanceDataSource.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        GovernanceDataSource.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        GovernanceDataSource.fetch(client, id),
      new: (fields: GovernanceDataSourceFields) => {
        return new GovernanceDataSource([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return GovernanceDataSource.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<GovernanceDataSource>> {
    return phantom(GovernanceDataSource.reified());
  }
  static get p() {
    return GovernanceDataSource.phantom();
  }

  static get bcs() {
    return bcs.struct("GovernanceDataSource", {
      emitter_chain_id: bcs.u64(),
      emitter_address: ExternalAddress.bcs,
      initial_sequence: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): GovernanceDataSource {
    return GovernanceDataSource.reified().new({
      emitterChainId: decodeFromFields("u64", fields.emitter_chain_id),
      emitterAddress: decodeFromFields(
        ExternalAddress.reified(),
        fields.emitter_address,
      ),
      initialSequence: decodeFromFields("u64", fields.initial_sequence),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): GovernanceDataSource {
    if (!isGovernanceDataSource(item.type)) {
      throw new Error("not a GovernanceDataSource type");
    }

    return GovernanceDataSource.reified().new({
      emitterChainId: decodeFromFieldsWithTypes(
        "u64",
        item.fields.emitter_chain_id,
      ),
      emitterAddress: decodeFromFieldsWithTypes(
        ExternalAddress.reified(),
        item.fields.emitter_address,
      ),
      initialSequence: decodeFromFieldsWithTypes(
        "u64",
        item.fields.initial_sequence,
      ),
    });
  }

  static fromBcs(data: Uint8Array): GovernanceDataSource {
    return GovernanceDataSource.fromFields(
      GovernanceDataSource.bcs.parse(data),
    );
  }

  toJSONField() {
    return {
      emitterChainId: this.emitterChainId.toString(),
      emitterAddress: this.emitterAddress.toJSONField(),
      initialSequence: this.initialSequence.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): GovernanceDataSource {
    return GovernanceDataSource.reified().new({
      emitterChainId: decodeFromJSONField("u64", field.emitterChainId),
      emitterAddress: decodeFromJSONField(
        ExternalAddress.reified(),
        field.emitterAddress,
      ),
      initialSequence: decodeFromJSONField("u64", field.initialSequence),
    });
  }

  static fromJSON(json: Record<string, any>): GovernanceDataSource {
    if (json.$typeName !== GovernanceDataSource.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return GovernanceDataSource.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): GovernanceDataSource {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isGovernanceDataSource(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a GovernanceDataSource object`,
      );
    }
    return GovernanceDataSource.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): GovernanceDataSource {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isGovernanceDataSource(data.bcs.type)
      ) {
        throw new Error(`object at is not a GovernanceDataSource object`);
      }

      return GovernanceDataSource.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return GovernanceDataSource.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<GovernanceDataSource> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching GovernanceDataSource object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isGovernanceDataSource(res.data.bcs.type)
    ) {
      throw new Error(
        `object at id ${id} is not a GovernanceDataSource object`,
      );
    }

    return GovernanceDataSource.fromSuiObjectData(res.data);
  }
}
