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
import { ID } from "../../0x2/object/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== MessageTicket =============================== */

export function isMessageTicket(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::publish_message::MessageTicket`;
}

export interface MessageTicketFields {
  sender: ToField<ID>;
  sequence: ToField<"u64">;
  nonce: ToField<"u32">;
  payload: ToField<Vector<"u8">>;
}

export type MessageTicketReified = Reified<MessageTicket, MessageTicketFields>;

export class MessageTicket implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::publish_message::MessageTicket`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = MessageTicket.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::publish_message::MessageTicket`;
  readonly $typeArgs: [];
  readonly $isPhantom = MessageTicket.$isPhantom;

  readonly sender: ToField<ID>;
  readonly sequence: ToField<"u64">;
  readonly nonce: ToField<"u32">;
  readonly payload: ToField<Vector<"u8">>;

  private constructor(typeArgs: [], fields: MessageTicketFields) {
    this.$fullTypeName = composeSuiType(
      MessageTicket.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::publish_message::MessageTicket`;
    this.$typeArgs = typeArgs;

    this.sender = fields.sender;
    this.sequence = fields.sequence;
    this.nonce = fields.nonce;
    this.payload = fields.payload;
  }

  static reified(): MessageTicketReified {
    return {
      typeName: MessageTicket.$typeName,
      fullTypeName: composeSuiType(
        MessageTicket.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::publish_message::MessageTicket`,
      typeArgs: [] as [],
      isPhantom: MessageTicket.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        MessageTicket.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        MessageTicket.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => MessageTicket.fromBcs(data),
      bcs: MessageTicket.bcs,
      fromJSONField: (field: any) => MessageTicket.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => MessageTicket.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        MessageTicket.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        MessageTicket.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        MessageTicket.fetch(client, id),
      new: (fields: MessageTicketFields) => {
        return new MessageTicket([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return MessageTicket.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<MessageTicket>> {
    return phantom(MessageTicket.reified());
  }
  static get p() {
    return MessageTicket.phantom();
  }

  static get bcs() {
    return bcs.struct("MessageTicket", {
      sender: ID.bcs,
      sequence: bcs.u64(),
      nonce: bcs.u32(),
      payload: bcs.vector(bcs.u8()),
    });
  }

  static fromFields(fields: Record<string, any>): MessageTicket {
    return MessageTicket.reified().new({
      sender: decodeFromFields(ID.reified(), fields.sender),
      sequence: decodeFromFields("u64", fields.sequence),
      nonce: decodeFromFields("u32", fields.nonce),
      payload: decodeFromFields(reified.vector("u8"), fields.payload),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): MessageTicket {
    if (!isMessageTicket(item.type)) {
      throw new Error("not a MessageTicket type");
    }

    return MessageTicket.reified().new({
      sender: decodeFromFieldsWithTypes(ID.reified(), item.fields.sender),
      sequence: decodeFromFieldsWithTypes("u64", item.fields.sequence),
      nonce: decodeFromFieldsWithTypes("u32", item.fields.nonce),
      payload: decodeFromFieldsWithTypes(
        reified.vector("u8"),
        item.fields.payload,
      ),
    });
  }

  static fromBcs(data: Uint8Array): MessageTicket {
    return MessageTicket.fromFields(MessageTicket.bcs.parse(data));
  }

  toJSONField() {
    return {
      sender: this.sender,
      sequence: this.sequence.toString(),
      nonce: this.nonce,
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

  static fromJSONField(field: any): MessageTicket {
    return MessageTicket.reified().new({
      sender: decodeFromJSONField(ID.reified(), field.sender),
      sequence: decodeFromJSONField("u64", field.sequence),
      nonce: decodeFromJSONField("u32", field.nonce),
      payload: decodeFromJSONField(reified.vector("u8"), field.payload),
    });
  }

  static fromJSON(json: Record<string, any>): MessageTicket {
    if (json.$typeName !== MessageTicket.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return MessageTicket.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): MessageTicket {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isMessageTicket(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a MessageTicket object`,
      );
    }
    return MessageTicket.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): MessageTicket {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isMessageTicket(data.bcs.type)
      ) {
        throw new Error(`object at is not a MessageTicket object`);
      }

      return MessageTicket.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return MessageTicket.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<MessageTicket> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching MessageTicket object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isMessageTicket(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a MessageTicket object`);
    }

    return MessageTicket.fromSuiObjectData(res.data);
  }
}

/* ============================== WormholeMessage =============================== */

export function isWormholeMessage(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::publish_message::WormholeMessage`;
}

export interface WormholeMessageFields {
  sender: ToField<ID>;
  sequence: ToField<"u64">;
  nonce: ToField<"u32">;
  payload: ToField<Vector<"u8">>;
  consistencyLevel: ToField<"u8">;
  timestamp: ToField<"u64">;
}

export type WormholeMessageReified = Reified<
  WormholeMessage,
  WormholeMessageFields
>;

export class WormholeMessage implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::publish_message::WormholeMessage`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = WormholeMessage.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::publish_message::WormholeMessage`;
  readonly $typeArgs: [];
  readonly $isPhantom = WormholeMessage.$isPhantom;

  readonly sender: ToField<ID>;
  readonly sequence: ToField<"u64">;
  readonly nonce: ToField<"u32">;
  readonly payload: ToField<Vector<"u8">>;
  readonly consistencyLevel: ToField<"u8">;
  readonly timestamp: ToField<"u64">;

  private constructor(typeArgs: [], fields: WormholeMessageFields) {
    this.$fullTypeName = composeSuiType(
      WormholeMessage.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::publish_message::WormholeMessage`;
    this.$typeArgs = typeArgs;

    this.sender = fields.sender;
    this.sequence = fields.sequence;
    this.nonce = fields.nonce;
    this.payload = fields.payload;
    this.consistencyLevel = fields.consistencyLevel;
    this.timestamp = fields.timestamp;
  }

  static reified(): WormholeMessageReified {
    return {
      typeName: WormholeMessage.$typeName,
      fullTypeName: composeSuiType(
        WormholeMessage.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::publish_message::WormholeMessage`,
      typeArgs: [] as [],
      isPhantom: WormholeMessage.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        WormholeMessage.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        WormholeMessage.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => WormholeMessage.fromBcs(data),
      bcs: WormholeMessage.bcs,
      fromJSONField: (field: any) => WormholeMessage.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => WormholeMessage.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        WormholeMessage.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        WormholeMessage.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        WormholeMessage.fetch(client, id),
      new: (fields: WormholeMessageFields) => {
        return new WormholeMessage([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return WormholeMessage.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<WormholeMessage>> {
    return phantom(WormholeMessage.reified());
  }
  static get p() {
    return WormholeMessage.phantom();
  }

  static get bcs() {
    return bcs.struct("WormholeMessage", {
      sender: ID.bcs,
      sequence: bcs.u64(),
      nonce: bcs.u32(),
      payload: bcs.vector(bcs.u8()),
      consistency_level: bcs.u8(),
      timestamp: bcs.u64(),
    });
  }

  static fromFields(fields: Record<string, any>): WormholeMessage {
    return WormholeMessage.reified().new({
      sender: decodeFromFields(ID.reified(), fields.sender),
      sequence: decodeFromFields("u64", fields.sequence),
      nonce: decodeFromFields("u32", fields.nonce),
      payload: decodeFromFields(reified.vector("u8"), fields.payload),
      consistencyLevel: decodeFromFields("u8", fields.consistency_level),
      timestamp: decodeFromFields("u64", fields.timestamp),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): WormholeMessage {
    if (!isWormholeMessage(item.type)) {
      throw new Error("not a WormholeMessage type");
    }

    return WormholeMessage.reified().new({
      sender: decodeFromFieldsWithTypes(ID.reified(), item.fields.sender),
      sequence: decodeFromFieldsWithTypes("u64", item.fields.sequence),
      nonce: decodeFromFieldsWithTypes("u32", item.fields.nonce),
      payload: decodeFromFieldsWithTypes(
        reified.vector("u8"),
        item.fields.payload,
      ),
      consistencyLevel: decodeFromFieldsWithTypes(
        "u8",
        item.fields.consistency_level,
      ),
      timestamp: decodeFromFieldsWithTypes("u64", item.fields.timestamp),
    });
  }

  static fromBcs(data: Uint8Array): WormholeMessage {
    return WormholeMessage.fromFields(WormholeMessage.bcs.parse(data));
  }

  toJSONField() {
    return {
      sender: this.sender,
      sequence: this.sequence.toString(),
      nonce: this.nonce,
      payload: fieldToJSON<Vector<"u8">>(`vector<u8>`, this.payload),
      consistencyLevel: this.consistencyLevel,
      timestamp: this.timestamp.toString(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): WormholeMessage {
    return WormholeMessage.reified().new({
      sender: decodeFromJSONField(ID.reified(), field.sender),
      sequence: decodeFromJSONField("u64", field.sequence),
      nonce: decodeFromJSONField("u32", field.nonce),
      payload: decodeFromJSONField(reified.vector("u8"), field.payload),
      consistencyLevel: decodeFromJSONField("u8", field.consistencyLevel),
      timestamp: decodeFromJSONField("u64", field.timestamp),
    });
  }

  static fromJSON(json: Record<string, any>): WormholeMessage {
    if (json.$typeName !== WormholeMessage.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return WormholeMessage.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): WormholeMessage {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isWormholeMessage(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a WormholeMessage object`,
      );
    }
    return WormholeMessage.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): WormholeMessage {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isWormholeMessage(data.bcs.type)
      ) {
        throw new Error(`object at is not a WormholeMessage object`);
      }

      return WormholeMessage.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return WormholeMessage.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<WormholeMessage> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching WormholeMessage object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isWormholeMessage(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a WormholeMessage object`);
    }

    return WormholeMessage.fromSuiObjectData(res.data);
  }
}
