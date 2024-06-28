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
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== DataSource =============================== */

export function isDataSource(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::data_source::DataSource`;
}

export interface DataSourceFields {
  emitterChain: ToField<"u64">;
  emitterAddress: ToField<ExternalAddress>;
}

export type DataSourceReified = Reified<DataSource, DataSourceFields>;

export class DataSource implements StructClass {
  static readonly $typeName = `${PKG_V1}::data_source::DataSource`;
  static readonly $numTypeParams = 0;

  readonly $typeName = DataSource.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::data_source::DataSource`;

  readonly $typeArgs: [];

  readonly emitterChain: ToField<"u64">;
  readonly emitterAddress: ToField<ExternalAddress>;

  private constructor(typeArgs: [], fields: DataSourceFields) {
    this.$fullTypeName = composeSuiType(
      DataSource.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::data_source::DataSource`;
    this.$typeArgs = typeArgs;

    this.emitterChain = fields.emitterChain;
    this.emitterAddress = fields.emitterAddress;
  }

  static reified(): DataSourceReified {
    return {
      typeName: DataSource.$typeName,
      fullTypeName: composeSuiType(
        DataSource.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::data_source::DataSource`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        DataSource.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        DataSource.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => DataSource.fromBcs(data),
      bcs: DataSource.bcs,
      fromJSONField: (field: any) => DataSource.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => DataSource.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        DataSource.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        DataSource.fetch(client, id),
      new: (fields: DataSourceFields) => {
        return new DataSource([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return DataSource.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<DataSource>> {
    return phantom(DataSource.reified());
  }
  static get p() {
    return DataSource.phantom();
  }

  static get bcs() {
    return bcs.struct("DataSource", {
      emitter_chain: bcs.u64(),
      emitter_address: ExternalAddress.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): DataSource {
    return DataSource.reified().new({
      emitterChain: decodeFromFields("u64", fields.emitter_chain),
      emitterAddress: decodeFromFields(
        ExternalAddress.reified(),
        fields.emitter_address,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): DataSource {
    if (!isDataSource(item.type)) {
      throw new Error("not a DataSource type");
    }

    return DataSource.reified().new({
      emitterChain: decodeFromFieldsWithTypes("u64", item.fields.emitter_chain),
      emitterAddress: decodeFromFieldsWithTypes(
        ExternalAddress.reified(),
        item.fields.emitter_address,
      ),
    });
  }

  static fromBcs(data: Uint8Array): DataSource {
    return DataSource.fromFields(DataSource.bcs.parse(data));
  }

  toJSONField() {
    return {
      emitterChain: this.emitterChain.toString(),
      emitterAddress: this.emitterAddress.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): DataSource {
    return DataSource.reified().new({
      emitterChain: decodeFromJSONField("u64", field.emitterChain),
      emitterAddress: decodeFromJSONField(
        ExternalAddress.reified(),
        field.emitterAddress,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): DataSource {
    if (json.$typeName !== DataSource.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return DataSource.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): DataSource {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isDataSource(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a DataSource object`,
      );
    }
    return DataSource.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<DataSource> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching DataSource object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isDataSource(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a DataSource object`);
    }
    return DataSource.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
