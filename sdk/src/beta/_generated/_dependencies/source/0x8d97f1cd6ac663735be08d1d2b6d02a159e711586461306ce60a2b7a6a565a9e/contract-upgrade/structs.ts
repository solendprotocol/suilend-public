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
import { Bytes32 } from "../../0x5306f64e312b581766351c07af79c72fcb1cd25147157fdc2f8ad76de9a3fb6a/bytes32/structs";
import { PKG_V1 } from "../index";
import { bcs, fromB64 } from "@mysten/bcs";
import { SuiClient, SuiParsedData } from "@mysten/sui/client";

/* ============================== ContractUpgraded =============================== */

export function isContractUpgraded(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::contract_upgrade::ContractUpgraded`;
}

export interface ContractUpgradedFields {
  oldContract: ToField<ID>;
  newContract: ToField<ID>;
}

export type ContractUpgradedReified = Reified<
  ContractUpgraded,
  ContractUpgradedFields
>;

export class ContractUpgraded implements StructClass {
  static readonly $typeName = `${PKG_V1}::contract_upgrade::ContractUpgraded`;
  static readonly $numTypeParams = 0;

  readonly $typeName = ContractUpgraded.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::contract_upgrade::ContractUpgraded`;

  readonly $typeArgs: [];

  readonly oldContract: ToField<ID>;
  readonly newContract: ToField<ID>;

  private constructor(typeArgs: [], fields: ContractUpgradedFields) {
    this.$fullTypeName = composeSuiType(
      ContractUpgraded.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::contract_upgrade::ContractUpgraded`;
    this.$typeArgs = typeArgs;

    this.oldContract = fields.oldContract;
    this.newContract = fields.newContract;
  }

  static reified(): ContractUpgradedReified {
    return {
      typeName: ContractUpgraded.$typeName,
      fullTypeName: composeSuiType(
        ContractUpgraded.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::contract_upgrade::ContractUpgraded`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        ContractUpgraded.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        ContractUpgraded.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => ContractUpgraded.fromBcs(data),
      bcs: ContractUpgraded.bcs,
      fromJSONField: (field: any) => ContractUpgraded.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => ContractUpgraded.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        ContractUpgraded.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        ContractUpgraded.fetch(client, id),
      new: (fields: ContractUpgradedFields) => {
        return new ContractUpgraded([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return ContractUpgraded.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<ContractUpgraded>> {
    return phantom(ContractUpgraded.reified());
  }
  static get p() {
    return ContractUpgraded.phantom();
  }

  static get bcs() {
    return bcs.struct("ContractUpgraded", {
      old_contract: ID.bcs,
      new_contract: ID.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): ContractUpgraded {
    return ContractUpgraded.reified().new({
      oldContract: decodeFromFields(ID.reified(), fields.old_contract),
      newContract: decodeFromFields(ID.reified(), fields.new_contract),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): ContractUpgraded {
    if (!isContractUpgraded(item.type)) {
      throw new Error("not a ContractUpgraded type");
    }

    return ContractUpgraded.reified().new({
      oldContract: decodeFromFieldsWithTypes(
        ID.reified(),
        item.fields.old_contract,
      ),
      newContract: decodeFromFieldsWithTypes(
        ID.reified(),
        item.fields.new_contract,
      ),
    });
  }

  static fromBcs(data: Uint8Array): ContractUpgraded {
    return ContractUpgraded.fromFields(ContractUpgraded.bcs.parse(data));
  }

  toJSONField() {
    return {
      oldContract: this.oldContract,
      newContract: this.newContract,
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): ContractUpgraded {
    return ContractUpgraded.reified().new({
      oldContract: decodeFromJSONField(ID.reified(), field.oldContract),
      newContract: decodeFromJSONField(ID.reified(), field.newContract),
    });
  }

  static fromJSON(json: Record<string, any>): ContractUpgraded {
    if (json.$typeName !== ContractUpgraded.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return ContractUpgraded.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): ContractUpgraded {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isContractUpgraded(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a ContractUpgraded object`,
      );
    }
    return ContractUpgraded.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<ContractUpgraded> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching ContractUpgraded object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isContractUpgraded(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a ContractUpgraded object`);
    }
    return ContractUpgraded.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}

/* ============================== UpgradeContract =============================== */

export function isUpgradeContract(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::contract_upgrade::UpgradeContract`;
}

export interface UpgradeContractFields {
  digest: ToField<Bytes32>;
}

export type UpgradeContractReified = Reified<
  UpgradeContract,
  UpgradeContractFields
>;

export class UpgradeContract implements StructClass {
  static readonly $typeName = `${PKG_V1}::contract_upgrade::UpgradeContract`;
  static readonly $numTypeParams = 0;

  readonly $typeName = UpgradeContract.$typeName;

  readonly $fullTypeName: `${typeof PKG_V1}::contract_upgrade::UpgradeContract`;

  readonly $typeArgs: [];

  readonly digest: ToField<Bytes32>;

  private constructor(typeArgs: [], fields: UpgradeContractFields) {
    this.$fullTypeName = composeSuiType(
      UpgradeContract.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::contract_upgrade::UpgradeContract`;
    this.$typeArgs = typeArgs;

    this.digest = fields.digest;
  }

  static reified(): UpgradeContractReified {
    return {
      typeName: UpgradeContract.$typeName,
      fullTypeName: composeSuiType(
        UpgradeContract.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::contract_upgrade::UpgradeContract`,
      typeArgs: [] as [],
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        UpgradeContract.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        UpgradeContract.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => UpgradeContract.fromBcs(data),
      bcs: UpgradeContract.bcs,
      fromJSONField: (field: any) => UpgradeContract.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => UpgradeContract.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        UpgradeContract.fromSuiParsedData(content),
      fetch: async (client: SuiClient, id: string) =>
        UpgradeContract.fetch(client, id),
      new: (fields: UpgradeContractFields) => {
        return new UpgradeContract([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return UpgradeContract.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<UpgradeContract>> {
    return phantom(UpgradeContract.reified());
  }
  static get p() {
    return UpgradeContract.phantom();
  }

  static get bcs() {
    return bcs.struct("UpgradeContract", {
      digest: Bytes32.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): UpgradeContract {
    return UpgradeContract.reified().new({
      digest: decodeFromFields(Bytes32.reified(), fields.digest),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): UpgradeContract {
    if (!isUpgradeContract(item.type)) {
      throw new Error("not a UpgradeContract type");
    }

    return UpgradeContract.reified().new({
      digest: decodeFromFieldsWithTypes(Bytes32.reified(), item.fields.digest),
    });
  }

  static fromBcs(data: Uint8Array): UpgradeContract {
    return UpgradeContract.fromFields(UpgradeContract.bcs.parse(data));
  }

  toJSONField() {
    return {
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

  static fromJSONField(field: any): UpgradeContract {
    return UpgradeContract.reified().new({
      digest: decodeFromJSONField(Bytes32.reified(), field.digest),
    });
  }

  static fromJSON(json: Record<string, any>): UpgradeContract {
    if (json.$typeName !== UpgradeContract.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return UpgradeContract.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): UpgradeContract {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isUpgradeContract(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a UpgradeContract object`,
      );
    }
    return UpgradeContract.fromFieldsWithTypes(content);
  }

  static async fetch(client: SuiClient, id: string): Promise<UpgradeContract> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching UpgradeContract object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isUpgradeContract(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a UpgradeContract object`);
    }
    return UpgradeContract.fromBcs(fromB64(res.data.bcs.bcsBytes));
  }
}
