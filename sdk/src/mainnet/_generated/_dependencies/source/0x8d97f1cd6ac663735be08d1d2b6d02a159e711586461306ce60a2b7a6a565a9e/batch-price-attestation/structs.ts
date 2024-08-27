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
import { PriceInfo } from "../price-info/structs";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui.js/client";

/* ============================== BatchPriceAttestation =============================== */

export function isBatchPriceAttestation(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::batch_price_attestation::BatchPriceAttestation"
  );
}

export interface BatchPriceAttestationFields {
  header: ToField<Header>;
  attestationSize: ToField<"u64">;
  attestationCount: ToField<"u64">;
  priceInfos: ToField<Vector<PriceInfo>>;
}

export type BatchPriceAttestationReified = Reified<
  BatchPriceAttestation,
  BatchPriceAttestationFields
>;

export class BatchPriceAttestation implements StructClass {
  static readonly $typeName =
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::batch_price_attestation::BatchPriceAttestation";
  static readonly $numTypeParams = 0;

  readonly $typeName = BatchPriceAttestation.$typeName;

  readonly $fullTypeName: "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::batch_price_attestation::BatchPriceAttestation";

  readonly $typeArgs: [];

  readonly header: ToField<Header>;
  readonly attestationSize: ToField<"u64">;
  readonly attestationCount: ToField<"u64">;
  readonly priceInfos: ToField<Vector<PriceInfo>>;

  private constructor(typeArgs: [], fields: BatchPriceAttestationFields) {
    this.$fullTypeName = composeSuiType(
      BatchPriceAttestation.$typeName,
      ...typeArgs,
    ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::batch_price_attestation::BatchPriceAttestation";
    this.$typeArgs = typeArgs;

    this.header = fields.header;
    this.attestationSize = fields.attestationSize;
    this.attestationCount = fields.attestationCount;
    this.priceInfos = fields.priceInfos;
  }

  static reified(): BatchPriceAttestationReified {
    return {
      typeName: BatchPriceAttestation.$typeName,
      fullTypeName: composeSuiType(
        BatchPriceAttestation.$typeName,
        ...[],
      ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::batch_price_attestation::BatchPriceAttestation",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        BatchPriceAttestation.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        BatchPriceAttestation.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => BatchPriceAttestation.fromBcs(data),
      bcs: BatchPriceAttestation.bcs,
      fromJSONField: (field: any) => BatchPriceAttestation.fromJSONField(field),
      fromJSON: (json: Record<string, any>) =>
        BatchPriceAttestation.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        BatchPriceAttestation.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        BatchPriceAttestation.fetch(client, id),
      new: (fields: BatchPriceAttestationFields) => {
        return new BatchPriceAttestation([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return BatchPriceAttestation.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<BatchPriceAttestation>> {
    return phantom(BatchPriceAttestation.reified());
  }
  static get p() {
    return BatchPriceAttestation.phantom();
  }

  static get bcs() {
    return bcs.struct("BatchPriceAttestation", {
      header: Header.bcs,
      attestation_size: bcs.u64(),
      attestation_count: bcs.u64(),
      price_infos: bcs.vector(PriceInfo.bcs),
    });
  }

  static fromFields(fields: Record<string, any>): BatchPriceAttestation {
    return BatchPriceAttestation.reified().new({
      header: decodeFromFields(Header.reified(), fields.header),
      attestationSize: decodeFromFields("u64", fields.attestation_size),
      attestationCount: decodeFromFields("u64", fields.attestation_count),
      priceInfos: decodeFromFields(
        reified.vector(PriceInfo.reified()),
        fields.price_infos,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): BatchPriceAttestation {
    if (!isBatchPriceAttestation(item.type)) {
      throw new Error("not a BatchPriceAttestation type");
    }

    return BatchPriceAttestation.reified().new({
      header: decodeFromFieldsWithTypes(Header.reified(), item.fields.header),
      attestationSize: decodeFromFieldsWithTypes(
        "u64",
        item.fields.attestation_size,
      ),
      attestationCount: decodeFromFieldsWithTypes(
        "u64",
        item.fields.attestation_count,
      ),
      priceInfos: decodeFromFieldsWithTypes(
        reified.vector(PriceInfo.reified()),
        item.fields.price_infos,
      ),
    });
  }

  static fromBcs(data: Uint8Array): BatchPriceAttestation {
    return BatchPriceAttestation.fromFields(
      BatchPriceAttestation.bcs.parse(data),
    );
  }

  toJSONField() {
    return {
      header: this.header.toJSONField(),
      attestationSize: this.attestationSize.toString(),
      attestationCount: this.attestationCount.toString(),
      priceInfos: fieldToJSON<Vector<PriceInfo>>(
        `vector<0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::price_info::PriceInfo>`,
        this.priceInfos,
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

  static fromJSONField(field: any): BatchPriceAttestation {
    return BatchPriceAttestation.reified().new({
      header: decodeFromJSONField(Header.reified(), field.header),
      attestationSize: decodeFromJSONField("u64", field.attestationSize),
      attestationCount: decodeFromJSONField("u64", field.attestationCount),
      priceInfos: decodeFromJSONField(
        reified.vector(PriceInfo.reified()),
        field.priceInfos,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): BatchPriceAttestation {
    if (json.$typeName !== BatchPriceAttestation.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return BatchPriceAttestation.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): BatchPriceAttestation {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isBatchPriceAttestation(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a BatchPriceAttestation object`,
      );
    }
    return BatchPriceAttestation.fromFieldsWithTypes(content);
  }

  static async fetch(
    client: SuiClient,
    id: string,
  ): Promise<BatchPriceAttestation> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching BatchPriceAttestation object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isBatchPriceAttestation(res.data.bcs.type)
    ) {
      throw new Error(
        `object at id ${id} is not a BatchPriceAttestation object`,
      );
    }
    return BatchPriceAttestation.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== Header =============================== */

export function isHeader(type: string): boolean {
  type = compressSuiType(type);
  return (
    type ===
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::batch_price_attestation::Header"
  );
}

export interface HeaderFields {
  magic: ToField<"u64">;
  versionMajor: ToField<"u64">;
  versionMinor: ToField<"u64">;
  headerSize: ToField<"u64">;
  payloadId: ToField<"u8">;
}

export type HeaderReified = Reified<Header, HeaderFields>;

export class Header implements StructClass {
  static readonly $typeName =
    "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::batch_price_attestation::Header";
  static readonly $numTypeParams = 0;

  readonly $typeName = Header.$typeName;

  readonly $fullTypeName: "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::batch_price_attestation::Header";

  readonly $typeArgs: [];

  readonly magic: ToField<"u64">;
  readonly versionMajor: ToField<"u64">;
  readonly versionMinor: ToField<"u64">;
  readonly headerSize: ToField<"u64">;
  readonly payloadId: ToField<"u8">;

  private constructor(typeArgs: [], fields: HeaderFields) {
    this.$fullTypeName = composeSuiType(
      Header.$typeName,
      ...typeArgs,
    ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::batch_price_attestation::Header";
    this.$typeArgs = typeArgs;

    this.magic = fields.magic;
    this.versionMajor = fields.versionMajor;
    this.versionMinor = fields.versionMinor;
    this.headerSize = fields.headerSize;
    this.payloadId = fields.payloadId;
  }

  static reified(): HeaderReified {
    return {
      typeName: Header.$typeName,
      fullTypeName: composeSuiType(
        Header.$typeName,
        ...[],
      ) as "0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e::batch_price_attestation::Header",
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) => Header.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        Header.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => Header.fromBcs(data),
      bcs: Header.bcs,
      fromJSONField: (field: any) => Header.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => Header.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        Header.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) => Header.fetch(client, id),
      new: (fields: HeaderFields) => {
        return new Header([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return Header.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<Header>> {
    return phantom(Header.reified());
  }
  static get p() {
    return Header.phantom();
  }

  static get bcs() {
    return bcs.struct("Header", {
      magic: bcs.u64(),
      version_major: bcs.u64(),
      version_minor: bcs.u64(),
      header_size: bcs.u64(),
      payload_id: bcs.u8(),
    });
  }

  static fromFields(fields: Record<string, any>): Header {
    return Header.reified().new({
      magic: decodeFromFields("u64", fields.magic),
      versionMajor: decodeFromFields("u64", fields.version_major),
      versionMinor: decodeFromFields("u64", fields.version_minor),
      headerSize: decodeFromFields("u64", fields.header_size),
      payloadId: decodeFromFields("u8", fields.payload_id),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): Header {
    if (!isHeader(item.type)) {
      throw new Error("not a Header type");
    }

    return Header.reified().new({
      magic: decodeFromFieldsWithTypes("u64", item.fields.magic),
      versionMajor: decodeFromFieldsWithTypes("u64", item.fields.version_major),
      versionMinor: decodeFromFieldsWithTypes("u64", item.fields.version_minor),
      headerSize: decodeFromFieldsWithTypes("u64", item.fields.header_size),
      payloadId: decodeFromFieldsWithTypes("u8", item.fields.payload_id),
    });
  }

  static fromBcs(data: Uint8Array): Header {
    return Header.fromFields(Header.bcs.parse(data));
  }

  toJSONField() {
    return {
      magic: this.magic.toString(),
      versionMajor: this.versionMajor.toString(),
      versionMinor: this.versionMinor.toString(),
      headerSize: this.headerSize.toString(),
      payloadId: this.payloadId,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): Header {
    return Header.reified().new({
      magic: decodeFromJSONField("u64", field.magic),
      versionMajor: decodeFromJSONField("u64", field.versionMajor),
      versionMinor: decodeFromJSONField("u64", field.versionMinor),
      headerSize: decodeFromJSONField("u64", field.headerSize),
      payloadId: decodeFromJSONField("u8", field.payloadId),
    });
  }

  static fromJSON(json: Record<string, any>): Header {
    if (json.$typeName !== Header.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return Header.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): Header {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isHeader(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a Header object`,
      );
    }
    return Header.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<Header> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching Header object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isHeader(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a Header object`);
    }
    return Header.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
