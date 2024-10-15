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
  phantom,
  ToTypeStr as ToPhantom,
} from "../../../../_framework/reified";
import {
  FieldsWithTypes,
  composeSuiType,
  compressSuiType,
} from "../../../../_framework/util";
import { Balance } from "../../0x2/balance/structs";
import { SUI } from "../../0x2/sui/structs";
import { PKG_V1 } from "../index";
import { bcs } from "@mysten/sui/bcs";
import { SuiClient, SuiObjectData, SuiParsedData } from "@mysten/sui/client";
import { fromB64 } from "@mysten/sui/utils";

/* ============================== FeeCollector =============================== */

export function isFeeCollector(type: string): boolean {
  type = compressSuiType(type);
  return type === `${PKG_V1}::fee_collector::FeeCollector`;
}

export interface FeeCollectorFields {
  feeAmount: ToField<"u64">;
  balance: ToField<Balance<ToPhantom<SUI>>>;
}

export type FeeCollectorReified = Reified<FeeCollector, FeeCollectorFields>;

export class FeeCollector implements StructClass {
  __StructClass = true as const;

  static readonly $typeName = `${PKG_V1}::fee_collector::FeeCollector`;
  static readonly $numTypeParams = 0;
  static readonly $isPhantom = [] as const;

  readonly $typeName = FeeCollector.$typeName;
  readonly $fullTypeName: `${typeof PKG_V1}::fee_collector::FeeCollector`;
  readonly $typeArgs: [];
  readonly $isPhantom = FeeCollector.$isPhantom;

  readonly feeAmount: ToField<"u64">;
  readonly balance: ToField<Balance<ToPhantom<SUI>>>;

  private constructor(typeArgs: [], fields: FeeCollectorFields) {
    this.$fullTypeName = composeSuiType(
      FeeCollector.$typeName,
      ...typeArgs,
    ) as `${typeof PKG_V1}::fee_collector::FeeCollector`;
    this.$typeArgs = typeArgs;

    this.feeAmount = fields.feeAmount;
    this.balance = fields.balance;
  }

  static reified(): FeeCollectorReified {
    return {
      typeName: FeeCollector.$typeName,
      fullTypeName: composeSuiType(
        FeeCollector.$typeName,
        ...[],
      ) as `${typeof PKG_V1}::fee_collector::FeeCollector`,
      typeArgs: [] as [],
      isPhantom: FeeCollector.$isPhantom,
      reifiedTypeArgs: [],
      fromFields: (fields: Record<string, any>) =>
        FeeCollector.fromFields(fields),
      fromFieldsWithTypes: (item: FieldsWithTypes) =>
        FeeCollector.fromFieldsWithTypes(item),
      fromBcs: (data: Uint8Array) => FeeCollector.fromBcs(data),
      bcs: FeeCollector.bcs,
      fromJSONField: (field: any) => FeeCollector.fromJSONField(field),
      fromJSON: (json: Record<string, any>) => FeeCollector.fromJSON(json),
      fromSuiParsedData: (content: SuiParsedData) =>
        FeeCollector.fromSuiParsedData(content),
      fromSuiObjectData: (content: SuiObjectData) =>
        FeeCollector.fromSuiObjectData(content),
      fetch: async (client: SuiClient, id: string) =>
        FeeCollector.fetch(client, id),
      new: (fields: FeeCollectorFields) => {
        return new FeeCollector([], fields);
      },
      kind: "StructClassReified",
    };
  }

  static get r() {
    return FeeCollector.reified();
  }

  static phantom(): PhantomReified<ToTypeStr<FeeCollector>> {
    return phantom(FeeCollector.reified());
  }
  static get p() {
    return FeeCollector.phantom();
  }

  static get bcs() {
    return bcs.struct("FeeCollector", {
      fee_amount: bcs.u64(),
      balance: Balance.bcs,
    });
  }

  static fromFields(fields: Record<string, any>): FeeCollector {
    return FeeCollector.reified().new({
      feeAmount: decodeFromFields("u64", fields.fee_amount),
      balance: decodeFromFields(
        Balance.reified(reified.phantom(SUI.reified())),
        fields.balance,
      ),
    });
  }

  static fromFieldsWithTypes(item: FieldsWithTypes): FeeCollector {
    if (!isFeeCollector(item.type)) {
      throw new Error("not a FeeCollector type");
    }

    return FeeCollector.reified().new({
      feeAmount: decodeFromFieldsWithTypes("u64", item.fields.fee_amount),
      balance: decodeFromFieldsWithTypes(
        Balance.reified(reified.phantom(SUI.reified())),
        item.fields.balance,
      ),
    });
  }

  static fromBcs(data: Uint8Array): FeeCollector {
    return FeeCollector.fromFields(FeeCollector.bcs.parse(data));
  }

  toJSONField() {
    return {
      feeAmount: this.feeAmount.toString(),
      balance: this.balance.toJSONField(),
    };
  }

  toJSON() {
    return {
      $typeName: this.$typeName,
      $typeArgs: this.$typeArgs,
      ...this.toJSONField(),
    };
  }

  static fromJSONField(field: any): FeeCollector {
    return FeeCollector.reified().new({
      feeAmount: decodeFromJSONField("u64", field.feeAmount),
      balance: decodeFromJSONField(
        Balance.reified(reified.phantom(SUI.reified())),
        field.balance,
      ),
    });
  }

  static fromJSON(json: Record<string, any>): FeeCollector {
    if (json.$typeName !== FeeCollector.$typeName) {
      throw new Error("not a WithTwoGenerics json object");
    }

    return FeeCollector.fromJSONField(json);
  }

  static fromSuiParsedData(content: SuiParsedData): FeeCollector {
    if (content.dataType !== "moveObject") {
      throw new Error("not an object");
    }
    if (!isFeeCollector(content.type)) {
      throw new Error(
        `object at ${(content.fields as any).id} is not a FeeCollector object`,
      );
    }
    return FeeCollector.fromFieldsWithTypes(content);
  }

  static fromSuiObjectData(data: SuiObjectData): FeeCollector {
    if (data.bcs) {
      if (
        data.bcs.dataType !== "moveObject" ||
        !isFeeCollector(data.bcs.type)
      ) {
        throw new Error(`object at is not a FeeCollector object`);
      }

      return FeeCollector.fromBcs(fromB64(data.bcs.bcsBytes));
    }
    if (data.content) {
      return FeeCollector.fromSuiParsedData(data.content);
    }
    throw new Error(
      "Both `bcs` and `content` fields are missing from the data. Include `showBcs` or `showContent` in the request.",
    );
  }

  static async fetch(client: SuiClient, id: string): Promise<FeeCollector> {
    const res = await client.getObject({ id, options: { showBcs: true } });
    if (res.error) {
      throw new Error(
        `error fetching FeeCollector object at id ${id}: ${res.error.code}`,
      );
    }
    if (
      res.data?.bcs?.dataType !== "moveObject" ||
      !isFeeCollector(res.data.bcs.type)
    ) {
      throw new Error(`object at id ${id} is not a FeeCollector object`);
    }

    return FeeCollector.fromSuiObjectData(res.data);
  }
}
