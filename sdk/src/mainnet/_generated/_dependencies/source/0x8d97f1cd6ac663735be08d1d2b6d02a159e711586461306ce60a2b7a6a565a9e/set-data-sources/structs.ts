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
import { DataSource } from "../data-source/structs";
import { PKG_V1 } from "../index";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== DataSources =============================== */

export function isDataSources(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::set_data_sources::DataSources`;
}

export interface DataSourcesFields {
  sources: ToField<Vector<DataSource>>;
}

export type DataSourcesReified = Reified<DataSources, DataSourcesFields>;

export class DataSources implements StructClass {
  static readonly $typeName = `${PKG_V1}::set_data_sources::DataSources`;
  static readonly $numTypeParams = 0;

  readonly $typeName = DataSources.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::set_data_sources::DataSources`;

  readonly $typeArgs: [];

  readonly sources: ToField<Vector<DataSource>>;

  private constructor(typeArgs: [], fields: DataSourcesFields) {
    this.$fullTypeName = composeSuiType(
      DataSources.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::set_data_sources::DataSources`;
    this.$typeArgs = typeArgs;

    this.sources = fields.sources;
  }

  static reified(): DataSourcesReified {
    return {
      typeName: DataSources.$typeName,
      fullTypeName: composeSuiType(
        DataSources.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::set_data_sources::DataSources`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        DataSources.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        DataSources.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => DataSources.fromBcs(data),
      bcs: DataSources.bcs,
      fromJSONField: (field: any) => DataSources.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => DataSources.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        DataSources.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        DataSources.fetch(client, id),
      new: (fields: DataSourcesFields) => {
        return new DataSources([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return DataSources.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<DataSources>> {
    return phantom(DataSources.reified());
  }
  static get p() {
    return DataSources.phantom();
  }

  static get bcs() {
    return bcs.struct("DataSources", {
      sources: bcs.vector(DataSource.bcs),
    });
  }

  static fromFields(fields: Record<string, any>): DataSources {
    return DataSources.reified().new({
      sources: decodeFromFields(
        reified.vector(DataSource.reified()),
        fields.sources,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): DataSources {
    if (!isDataSources(item.type)) {
      throw new Error("not a DataSources type");
    }

    return DataSources.reified().new({
      sources: decodeFromFieldsWithTypes(
        reified.vector(DataSource.reified()),
        item.fields.sources,
      ),
    });
  }

  static fromBcs(data: Uint8Array): DataSources {
    return DataSources.fromFields(DataSources.bcs.parse(data));
  }

  toJSONField() {
    return {
      sources: fieldToJSON<Vector<DataSource>>(
        `vector<${DataSource.$typeName}>`,
        this.sources,
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

  static fromJSONField(field: any): DataSources {
    return DataSources.reified().new({
      sources: decodeFromJSONField(
        reified.vector(DataSource.reified()),
        field.sources,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): DataSources {
    if (json.$typeName !== DataSources.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return DataSources.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): DataSources {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isDataSources(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a DataSources object`,
      );
    }
    return DataSources.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<DataSources> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching DataSources object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isDataSources(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a DataSources object`);
    }
    return DataSources.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
