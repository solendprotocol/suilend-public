import * as reified from "../../../../_framework/reified";
import {
  PhantomReified,
  PhantomToTypeStr,
  PhantomTypeArgument,
  Reified,
  StructClass,
  ToField,
  ToPhantomTypeArgument,
  ToTypeStr,
  assertFieldsWithTypesArgsMatch,
  assertReifiedTypeArgsMatch,
  decodeFromFields,
  decodeFromFieldsWithTypes,
  decodeFromJSONField,
  extractType,
  fieldToJSON,
  phantom,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
  parseTypeName,
} from "../../../../_framework/util";
import { Vector } from "../../../../_framework/vector";
import { Bytes32 } from "../bytes32/structs";
import { ExternalAddress } from "../external-address/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== DecreeReceipt =============================== */

export function isDecreeReceipt(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::governance_message::DecreeReceipt` + "<");
}

export interface DecreeReceiptFields<T extends PhantomTypeArgument> {
  payload: ToField<Vector<"u8">>;
  digest: ToField<Bytes32>;
  sequence: ToField<"u64">;
}

export type DecreeReceiptReified<T extends PhantomTypeArgument> = Reified<
  DecreeReceipt<T>,
  DecreeReceiptFields<T>
>;

export class DecreeReceipt<T extends PhantomTypeArgument>
  implements StructClass
{
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::governance_message::DecreeReceipt`;
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = DecreeReceipt.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::governance_message::DecreeReceipt<${PhantomToTypeStr<T>}>`;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = DecreeReceipt.$isPhantom;

  readonly payload: ToField<Vector<"u8">>;
  readonly digest: ToField<Bytes32>;
  readonly sequence: ToField<"u64">;

  private constructor(
    typeArgs: [PhantomToTypeStr<T>],
    fields: DecreeReceiptFields<T>,
  ) {
    this.$fullTypeName = composeSuiType(
      DecreeReceipt.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::governance_message::DecreeReceipt<${PhantomToTypeStr<T>}>`;
    this.$typeArgs = typeArgs;

    this.payload = fields.payload;
    this.digest = fields.digest;
    this.sequence = fields.sequence;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(
    T: T,
  ): DecreeReceiptReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: DecreeReceipt.$typeName,
      fullTypeName: composeSuiType(
        DecreeReceipt.$typeName,
        ...[extractType(T)],
      ) as `${typeof PKG_V1}::governance_message::DecreeReceipt<${PhantomToTypeStr<ToPhantomTypeArgument<T>>}>`,
      typeArgs: [extractType(T)] as [
        PhantomToTypeStr<ToPhantomTypeArgument<T>>,
      ],
      isPhantom: DecreeReceipt.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) =>
        DecreeReceipt.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        DecreeReceipt.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => DecreeReceipt.fromBcs(T, data),
      bcs: DecreeReceipt.bcs,
      fromJSONField: (field: any) => DecreeReceipt.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => DecreeReceipt.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) =>
        DecreeReceipt.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) =>
        DecreeReceipt.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) =>
        DecreeReceipt.fetch(client, T, id),
      new: (fields: DecreeReceiptFields<ToPhantomTypeArgument<T>>) => {
        return new DecreeReceipt([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return DecreeReceipt.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T,
  ): PhantomReified<ToTypeStr<DecreeReceipt<ToPhantomTypeArgument<T>>>> {
    return phantom(DecreeReceipt.reified(T));
  }
  static get p() {
    return DecreeReceipt.phantom;
  }

  static get bcs() {
    return bcs.struct("DecreeReceipt", {
      payload: bcs.vector(bcs.u8()),
      digest: Bytes32.bcs,
      sequence: bcs.u64(),
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>,
  ): DecreeReceipt<ToPhantomTypeArgument<T>> {
    return DecreeReceipt.reified(typeArg).new({
      payload: decodeFromFields(reified.vector("u8"), fields.payload),
      digest: decodeFromFields(Bytes32.reified(), fields.digest),
      sequence: decodeFromFields("u64", fields.sequence),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes,
  ): DecreeReceipt<ToPhantomTypeArgument<T>> {
    if (!isDecreeReceipt(item.type)) {
      throw new Error("not a DecreeReceipt type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return DecreeReceipt.reified(typeArg).new({
      payload: decodeFromFieldsWithTypes(
        reified.vector("u8"),
        item.fields.payload,
      ),
      digest: decodeFromFieldsWithTypes(Bytes32.reified(), item.fields.digest),
      sequence: decodeFromFieldsWithTypes("u64", item.fields.sequence),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array,
  ): DecreeReceipt<ToPhantomTypeArgument<T>> {
    return DecreeReceipt.fromFields(typeArg, DecreeReceipt.bcs.parse(data));
  }

  toJSONField() {
    return {
      payload: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.payload),
      digest: this.digest.toJSONField(),
      sequence: this.sequence.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    field: any,
  ): DecreeReceipt<ToPhantomTypeArgument<T>> {
    return DecreeReceipt.reified(typeArg).new({
      payload: decodeFromJSONField(reified.vector("u8"), field.payload),
      digest: decodeFromJSONField(Bytes32.reified(), field.digest),
      sequence: decodeFromJSONField("u64", field.sequence),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>,
  ): DecreeReceipt<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== DecreeReceipt.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(
      composeSuiType(DecreeReceipt.$typeName, extractType(typeArg)),
      json.$typeArgs,
      [typeArg],
    );

    return DecreeReceipt.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData,
  ): DecreeReceipt<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isDecreeReceipt(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a DecreeReceipt object`,
      );
    }
    return DecreeReceipt.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData,
  ): DecreeReceipt<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isDecreeReceipt(data.bcs.type)
      ) {
        throw new Error(`object at is not a DecreeReceipt object`);
      }

      const gotTypeArgs = parseTypeName(data.bcs.type).typeArgs;
      if (gotTypeArgs.length !== 1) {
        throw new Error(
          `type argument mismatch: expected 1 type argument but got '${gotTypeArgs.length}'`,
        );
      }
      const gotTypeArg = compressSuiType(gotTypeArgs[0]);
      const expectedTypeArg = compressSuiType(extractType(typeArg));
      if (gotTypeArg !== compressSuiType(extractType(typeArg))) {
        throw new Error(
          `type argument mismatch: expected '${expectedTypeArg}' but got '${gotTypeArg}'`,
        );
      }

      return DecreeReceipt.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return DecreeReceipt.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string,
  ): Promise<DecreeReceipt<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching DecreeReceipt object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isDecreeReceipt(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a DecreeReceipt object`);
    }

    return DecreeReceipt.fromSuiObjectData(typeArg, res.data);
  }
}

/* ============================== DecreeTicket =============================== */

export function isDecreeTicket(type: string): boolean {
  type = compressSuiType(type);
  return type.startsWith(`${PKG_V1}::governance_message::DecreeTicket` + "<");
}

export interface DecreeTicketFields<T extends PhantomTypeArgument> {
  governanceChain: ToField<"u16">;
  governanceContract: ToField<ExternalAddress>;
  moduleName: ToField<Bytes32>;
  action: ToField<"u8">;
  global: ToField<"bool">;
}

export type DecreeTicketReified<T extends PhantomTypeArgument> = Reified<
  DecreeTicket<T>,
  DecreeTicketFields<T>
>;

export class DecreeTicket<T extends PhantomTypeArgument>
  implements StructClass
{
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::governance_message::DecreeTicket`;
  static readonly $numTypeParams = 1;
  static readonly $isPhantom = [true] as const;

  readonly $typeName = DecreeTicket.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::governance_message::DecreeTicket<${PhantomToTypeStr<T>}>`;
  readonly $typeArgs: [PhantomToTypeStr<T>];
  readonly $isPhantom = DecreeTicket.$isPhantom;

  readonly governanceChain: ToField<"u16">;
  readonly governanceContract: ToField<ExternalAddress>;
  readonly moduleName: ToField<Bytes32>;
  readonly action: ToField<"u8">;
  readonly global: ToField<"bool">;

  private constructor(
    typeArgs: [PhantomToTypeStr<T>],
    fields: DecreeTicketFields<T>,
  ) {
    this.$fullTypeName = composeSuiType(
      DecreeTicket.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::governance_message::DecreeTicket<${PhantomToTypeStr<T>}>`;
    this.$typeArgs = typeArgs;

    this.governanceChain = fields.governanceChain;
    this.governanceContract = fields.governanceContract;
    this.moduleName = fields.moduleName;
    this.action = fields.action;
    this.global = fields.global;
  }

  static reified<T extends PhantomReified<PhantomTypeArgument>>(
    T: T,
  ): DecreeTicketReified<ToPhantomTypeArgument<T>> {
    return {
      typeName: DecreeTicket.$typeName,
      fullTypeName: composeSuiType(
        DecreeTicket.$typeName,
        ...[extractType(T)],
      ) as `${typeof PKG_V1}::governance_message::DecreeTicket<${PhantomToTypeStr<ToPhantomTypeArgument<T>>}>`,
      typeArgs: [extractType(T)] as [
        PhantomToTypeStr<ToPhantomTypeArgument<T>>,
      ],
      isPhantom: DecreeTicket.$isPhantom,
      reifiedTypeArgs: [T],
      fromFields: (fields: Record<string, any>) =>
        DecreeTicket.fromFields(T, fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        DecreeTicket.fromFieldsWithTypes(T, item),
      fromBcs: (data: Uint8Array) => DecreeTicket.fromBcs(T, data),
      bcs: DecreeTicket.bcs,
      fromJSONField: (field: any) => DecreeTicket.fromJSONField(T, field),
      fromJSON: (json: Record<string, any>) => DecreeTicket.fromJSON(T, json),
      fromSuiParsedData: (content: SuiParsedData) =>
        DecreeTicket.fromSuiParsedData(T, content),
      fromSuiObjectData: (content: SuiObjectData) =>
        DecreeTicket.fromSuiObjectData(T, content),
      fetch: async (client: SuiClient, id: string) =>
        DecreeTicket.fetch(client, T, id),
      new: (fields: DecreeTicketFields<ToPhantomTypeArgument<T>>) => {
        return new DecreeTicket([extractType(T)], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return DecreeTicket.reified;
  }

  static phantom<T extends PhantomReified<PhantomTypeArgument>>(
    T: T,
  ): PhantomReified<ToTypeStr<DecreeTicket<ToPhantomTypeArgument<T>>>> {
    return phantom(DecreeTicket.reified(T));
  }
  static get p() {
    return DecreeTicket.phantom;
  }

  static get bcs() {
    return bcs.struct("DecreeTicket", {
      governance_chain: bcs.u16(),
      governance_contract: ExternalAddress.bcs,
      module_name: Bytes32.bcs,
      action: bcs.u8(),
      global: bcs.bool(),
    });
  }

  static fromFields<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    fields: Record<string, any>,
  ): DecreeTicket<ToPhantomTypeArgument<T>> {
    return DecreeTicket.reified(typeArg).new({
      governanceChain: decodeFromFields("u16", fields.governance_chain),
      governanceContract: decodeFromFields(
        ExternalAddress.reified(),
        fields.governance_contract,
      ),
      moduleName: decodeFromFields(Bytes32.reified(), fields.module_name),
      action: decodeFromFields("u8", fields.action),
      global: decodeFromFields("bool", fields.global),
    });
  }

  static fromFieldsWithTypes<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    item: FieldsWithTypes,
  ): DecreeTicket<ToPhantomTypeArgument<T>> {
    if (!isDecreeTicket(item.type)) {
      throw new Error("not a DecreeTicket type");
    }
    assertFieldsWithTypesArgsMatch(item, [typeArg]);

    return DecreeTicket.reified(typeArg).new({
      governanceChain: decodeFromFieldsWithTypes(
        "u16",
        item.fields.governance_chain,
      ),
      governanceContract: decodeFromFieldsWithTypes(
        ExternalAddress.reified(),
        item.fields.governance_contract,
      ),
      moduleName: decodeFromFieldsWithTypes(
        Bytes32.reified(),
        item.fields.module_name,
      ),
      action: decodeFromFieldsWithTypes("u8", item.fields.action),
      global: decodeFromFieldsWithTypes("bool", item.fields.global),
    });
  }

  static fromBcs<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: Uint8Array,
  ): DecreeTicket<ToPhantomTypeArgument<T>> {
    return DecreeTicket.fromFields(typeArg, DecreeTicket.bcs.parse(data));
  }

  toJSONField() {
    return {
      governanceChain: this.governanceChain,
      governanceContract: this.governanceContract.toJSONField(),
      moduleName: this.moduleName.toJSONField(),
      action: this.action,
      global: this.global,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    field: any,
  ): DecreeTicket<ToPhantomTypeArgument<T>> {
    return DecreeTicket.reified(typeArg).new({
      governanceChain: decodeFromJSONField("u16", field.governanceChain),
      governanceContract: decodeFromJSONField(
        ExternalAddress.reified(),
        field.governanceContract,
      ),
      moduleName: decodeFromJSONField(Bytes32.reified(), field.moduleName),
      action: decodeFromJSONField("u8", field.action),
      global: decodeFromJSONField("bool", field.global),
    });
  }

  static fromJSON<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    json: Record<string, any>,
  ): DecreeTicket<ToPhantomTypeArgument<T>> {
    if (json.$typeName !== DecreeTicket.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }
    assertReifiedTypeArgsMatch(
      composeSuiType(DecreeTicket.$typeName, extractType(typeArg)),
      json.$typeArgs,
      [typeArg],
    );

    return DecreeTicket.fromJSONField(typeArg, json);
  }

  static fromSuiParsedData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    content: SuiParsedData,
  ): DecreeTicket<ToPhantomTypeArgument<T>> {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isDecreeTicket(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a DecreeTicket object`,
      );
    }
    return DecreeTicket.fromFieldsWithTypes(typeArg, content);
  }

  static fromSuiObjectData<T extends PhantomReified<PhantomTypeArgument>>(
    typeArg: T,
    data: SuiObjectData,
  ): DecreeTicket<ToPhantomTypeArgument<T>> {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isDecreeTicket(data.bcs.type)
      ) {
        throw new Error(`object at is not a DecreeTicket object`);
      }

      const gotTypeArgs = parseTypeName(data.bcs.type).typeArgs;
      if (gotTypeArgs.length !== 1) {
        throw new Error(
          `type argument mismatch: expected 1 type argument but got '${gotTypeArgs.length}'`,
        );
      }
      const gotTypeArg = compressSuiType(gotTypeArgs[0]);
      const expectedTypeArg = compressSuiType(extractType(typeArg));
      if (gotTypeArg !== compressSuiType(extractType(typeArg))) {
        throw new Error(
          `type argument mismatch: expected '${expectedTypeArg}' but got '${gotTypeArg}'`,
        );
      }

      return DecreeTicket.fromBcs(typeArg, fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return DecreeTicket.fromSuiParsedData(typeArg, data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch<T extends PhantomReified<PhantomTypeArgument>>(
    client: SuiClient,
    typeArg: T,
    id: string,
  ): Promise<DecreeTicket<ToPhantomTypeArgument<T>>> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching DecreeTicket object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isDecreeTicket(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a DecreeTicket object`);
    }

    return DecreeTicket.fromSuiObjectData(typeArg, res.data);
  }
}
