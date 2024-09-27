import { fromB64, toHEX } from "@mysten/bcs";
import { SuiClient } from "@mysten/sui.js/client";
import {
  TransactionBlock,
  TransactionObjectArgument,
  TransactionResult,
} from "@mysten/sui.js/transactions";
import { SUI_CLOCK_OBJECT_ID, normalizeStructTag } from "@mysten/sui.js/utils";

import {
  SuiPriceServiceConnection,
  SuiPythClient,
} from "../../../pyth-sdk/src";

import {
  AddPoolRewardArgs,
  AddReserveArgs,
  BorrowArgs,
  CancelPoolRewardArgs,
  ClaimRewardsAndDepositArgs,
  ClaimRewardsArgs,
  ClosePoolRewardArgs,
  CreateRateLimiterConfigArgs,
  CreateReserveConfigArgs,
  DepositCtokensIntoObligationArgs,
  DepositLiquidityAndMintCtokensArgs,
  LiquidateArgs,
  MigrateArgs,
  ObjectArg,
  PhantomReified,
  RefreshReservePriceArgs,
  RepayArgs,
  Side,
  UpdateRateLimiterConfigArgs,
  UpdateReserveConfigArgs,
  WithdrawCtokensArgs,
} from "./types";

const WORMHOLE_STATE_ID =
  "0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c";
const PYTH_STATE_ID =
  "0x1f9310238ee9298fb703c3419030b35b22bb1cc37113e3bb5007c99aec79e5b8";

const SUI_COINTYPE = "0x2::sui::SUI";

interface Deps {
  phantom: (phantomType: string) => PhantomReified<string>;
  PACKAGE_ID: string;
  PUBLISHED_AT: string;
  LendingMarket: any;
  Obligation: any;
  ObligationOwnerCap: any;
  createLendingMarket: (
    txb: TransactionBlock,
    typeArg: string,
    registry: ObjectArg,
  ) => TransactionResult;
  createReserveConfig: (
    txb: TransactionBlock,
    args: CreateReserveConfigArgs,
  ) => TransactionResult;
  updateReserveConfig: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: UpdateReserveConfigArgs,
  ) => TransactionResult;
  addReserve: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: AddReserveArgs,
  ) => TransactionResult;
  addPoolReward: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: AddPoolRewardArgs,
  ) => TransactionResult;
  cancelPoolReward: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: CancelPoolRewardArgs,
  ) => TransactionResult;
  closePoolReward: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: ClosePoolRewardArgs,
  ) => TransactionResult;
  claimRewards: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: ClaimRewardsArgs,
  ) => TransactionResult;
  claimRewardsAndDeposit: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: ClaimRewardsAndDepositArgs,
  ) => TransactionResult;
  createRateLimiterConfig: (
    txb: TransactionBlock,
    args: CreateRateLimiterConfigArgs,
  ) => TransactionResult;
  updateRateLimiterConfig: (
    txb: TransactionBlock,
    typeArg: string,
    args: UpdateRateLimiterConfigArgs,
  ) => TransactionResult;
  refreshReservePrice: (
    txb: TransactionBlock,
    typeArg: string,
    args: RefreshReservePriceArgs,
  ) => TransactionResult;
  depositLiquidityAndMintCtokens: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: DepositLiquidityAndMintCtokensArgs,
  ) => TransactionResult;
  depositCtokensIntoObligation: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: DepositCtokensIntoObligationArgs,
  ) => TransactionResult;
  withdrawCtokens: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: WithdrawCtokensArgs,
  ) => TransactionResult;
  borrow: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: BorrowArgs,
  ) => TransactionResult;
  repay: (
    txb: TransactionBlock,
    typeArgs: [string, string],
    args: RepayArgs,
  ) => TransactionResult;
  liquidate: (
    txb: TransactionBlock,
    typeArgs: [string, string, string],
    args: LiquidateArgs,
  ) => TransactionResult;
  migrate: (
    txb: TransactionBlock,
    typeArg: string,
    args: MigrateArgs,
  ) => TransactionResult;
}

export class SuilendClient {
  lendingMarket: any;
  client: SuiClient;
  pythClient: SuiPythClient;
  pythConnection: SuiPriceServiceConnection;

  phantom: Deps["phantom"];
  PACKAGE_ID: Deps["PACKAGE_ID"];
  PUBLISHED_AT: Deps["PUBLISHED_AT"];
  LendingMarket: Deps["LendingMarket"];
  Obligation: Deps["Obligation"];
  ObligationOwnerCap: Deps["ObligationOwnerCap"];
  createLendingMarketFunction: Deps["createLendingMarket"];
  createReserveConfigFunction: Deps["createReserveConfig"];
  updateReserveConfigFunction: Deps["updateReserveConfig"];
  addReserveFunction: Deps["addReserve"];
  addPoolRewardFunction: Deps["addPoolReward"];
  cancelPoolRewardFunction: Deps["cancelPoolReward"];
  closePoolRewardFunction: Deps["closePoolReward"];
  claimRewardsFunction: Deps["claimRewards"];
  claimRewardsAndDepositFunction: Deps["claimRewardsAndDeposit"];
  createRateLimiterConfigFunction: Deps["createRateLimiterConfig"];
  updateRateLimiterConfigFunction: Deps["updateRateLimiterConfig"];
  refreshReservePriceFunction: Deps["refreshReservePrice"];
  depositLiquidityAndMintCtokensFunction: Deps["depositLiquidityAndMintCtokens"];
  depositCtokensIntoObligationFunction: Deps["depositCtokensIntoObligation"];
  withdrawCtokensFunction: Deps["withdrawCtokens"];
  borrowFunction: Deps["borrow"];
  repayFunction: Deps["repay"];
  liquidateFunction: Deps["liquidate"];
  migrateFunction: Deps["migrate"];

  constructor(
    lendingMarket: any,
    client: SuiClient,
    {
      phantom,
      PACKAGE_ID,
      PUBLISHED_AT,
      LendingMarket,
      Obligation,
      ObligationOwnerCap,
      createLendingMarket,
      createReserveConfig,
      updateReserveConfig,
      addReserve,
      addPoolReward,
      cancelPoolReward,
      closePoolReward,
      claimRewards,
      claimRewardsAndDeposit,
      createRateLimiterConfig,
      updateRateLimiterConfig,
      refreshReservePrice,
      depositLiquidityAndMintCtokens,
      depositCtokensIntoObligation,
      withdrawCtokens,
      borrow,
      repay,
      liquidate,
      migrate,
    }: Deps,
  ) {
    this.lendingMarket = lendingMarket;
    this.client = client;
    this.pythClient = new SuiPythClient(
      client,
      PYTH_STATE_ID,
      WORMHOLE_STATE_ID,
    );
    this.pythConnection = new SuiPriceServiceConnection(
      "https://hermes.pyth.network",
    );

    this.phantom = phantom;
    this.PACKAGE_ID = PACKAGE_ID;
    this.PUBLISHED_AT = PUBLISHED_AT;
    this.LendingMarket = LendingMarket;
    this.Obligation = Obligation;
    this.ObligationOwnerCap = ObligationOwnerCap;
    this.createLendingMarketFunction = createLendingMarket;
    this.createReserveConfigFunction = createReserveConfig;
    this.updateReserveConfigFunction = updateReserveConfig;
    this.addReserveFunction = addReserve;
    this.addPoolRewardFunction = addPoolReward;
    this.cancelPoolRewardFunction = cancelPoolReward;
    this.closePoolRewardFunction = closePoolReward;
    this.claimRewardsFunction = claimRewards;
    this.claimRewardsAndDepositFunction = claimRewardsAndDeposit;
    this.createRateLimiterConfigFunction = createRateLimiterConfig;
    this.updateRateLimiterConfigFunction = updateRateLimiterConfig;
    this.refreshReservePriceFunction = refreshReservePrice;
    this.depositLiquidityAndMintCtokensFunction =
      depositLiquidityAndMintCtokens;
    this.depositCtokensIntoObligationFunction = depositCtokensIntoObligation;
    this.withdrawCtokensFunction = withdrawCtokens;
    this.borrowFunction = borrow;
    this.repayFunction = repay;
    this.liquidateFunction = liquidate;
    this.migrateFunction = migrate;
  }

  static async initialize(
    lendingMarketId: string,
    lendingMarketType: string,
    client: SuiClient,
    deps: Deps,
  ) {
    const lendingMarket = await deps.LendingMarket.fetch(
      client,
      deps.phantom(lendingMarketType),
      lendingMarketId,
    );

    return new SuilendClient(lendingMarket, client, deps);
  }

  static async initializeWithLendingMarket(
    lendingMarket: any,
    client: SuiClient,
    deps: Deps,
  ) {
    return new SuilendClient(lendingMarket, client, deps);
  }

  static async hasBetaPass(ownerId: string, client: SuiClient) {
    const objs = await client.getOwnedObjects({
      owner: ownerId,
      filter: {
        StructType:
          "0x02fb1289eb4e9ef987c6e383be4a9b298ef96d10a3f29060aaef39a0f9ecfbe6::suilend_beta_pass::SuilendBetaPass",
      },
    });

    return objs.data.length > 0;
  }

  static async createNewLendingMarket(
    registryId: string,
    lendingMarketType: string,
    txb: TransactionBlock,
    {
      LendingMarket,
      createLendingMarket,
    }: Pick<Deps, "LendingMarket" | "createLendingMarket">,
  ) {
    const [ownerCap, lendingMarket] = createLendingMarket(
      txb,
      lendingMarketType,
      txb.object(registryId),
    );
    txb.moveCall({
      target: `0x2::transfer::public_share_object`,
      typeArguments: [`${LendingMarket.$typeName}<${lendingMarketType}>}`],
      arguments: [lendingMarket],
    });

    return ownerCap;
  }

  static async getObligationOwnerCaps(
    ownerId: string,
    lendingMarketTypeArgs: string[],
    client: SuiClient,
    {
      phantom,
      PACKAGE_ID,
      ObligationOwnerCap,
    }: Pick<Deps, "phantom" | "PACKAGE_ID" | "ObligationOwnerCap">,
  ) {
    const objs = await client.getOwnedObjects({
      owner: ownerId,
      filter: {
        StructType: `${PACKAGE_ID}::lending_market::ObligationOwnerCap<${lendingMarketTypeArgs[0]}>`,
      },
    });

    if (objs.data.length > 0) {
      const obligationOwnerCapObjs = await Promise.all(
        objs.data.map((objData) =>
          client.getObject({
            id: objData.data?.objectId as string,
            options: { showBcs: true },
          }),
        ),
      );

      const obligationOwnerCaps: (typeof ObligationOwnerCap)[] = [];
      obligationOwnerCapObjs.forEach((obj) => {
        if (obj.data?.bcs?.dataType !== "moveObject")
          throw new Error("Error: invalid data type");

        obligationOwnerCaps.push(
          ObligationOwnerCap.fromBcs(
            phantom(lendingMarketTypeArgs[0]),
            fromB64(obj.data?.bcs?.bcsBytes),
          ),
        );
      });

      return obligationOwnerCaps;
    } else {
      return [];
    }
  }

  static async getObligation(
    obligationId: string,
    lendingMarketTypeArgs: string[],
    client: SuiClient,
    { phantom, Obligation }: Pick<Deps, "phantom" | "Obligation">,
  ) {
    const obligationData = await client.getObject({
      id: obligationId,
      options: { showBcs: true },
    });

    if (obligationData.data?.bcs?.dataType !== "moveObject") {
      throw new Error("Error: invalid data type");
    }

    const obligation = Obligation.fromBcs(
      phantom(lendingMarketTypeArgs[0]),
      fromB64(obligationData.data.bcs.bcsBytes),
    );

    return obligation;
  }

  getObligation(obligationId: string) {
    return SuilendClient.getObligation(
      obligationId,
      this.lendingMarket.$typeArgs,
      this.client,
      { phantom: this.phantom, Obligation: this.Obligation },
    );
  }

  static async getLendingMarketOwnerCapId(
    ownerId: string,
    lendingMarketTypeArgs: string[],
    client: SuiClient,
    { PACKAGE_ID }: Pick<Deps, "PACKAGE_ID">,
  ) {
    const objs = await client.getOwnedObjects({
      owner: ownerId,
      filter: {
        StructType: `${PACKAGE_ID}::lending_market::LendingMarketOwnerCap<${lendingMarketTypeArgs[0]}>`,
      },
    });

    if (objs.data.length > 0) return objs.data[0].data?.objectId as string;
    else return null;
  }

  async getLendingMarketOwnerCapId(ownerId: string) {
    return SuilendClient.getLendingMarketOwnerCapId(
      ownerId,
      this.lendingMarket.$typeArgs,
      this.client,
      { PACKAGE_ID: this.PACKAGE_ID },
    );
  }

  async createReserve(
    lendingMarketOwnerCapId: string,
    txb: TransactionBlock,
    pythPriceId: string,
    coinType: string,
    createReserveConfigArgs: CreateReserveConfigArgs,
  ) {
    const [config] = this.createReserveConfigFunction(
      txb,
      createReserveConfigArgs,
    );

    const priceUpdateData = await this.pythConnection.getPriceFeedsUpdateData([
      pythPriceId,
    ]);
    const priceInfoObjectIds = await this.pythClient.updatePriceFeeds(
      txb,
      priceUpdateData,
      [pythPriceId],
    );

    const coin_metadata = await this.client.getCoinMetadata({
      coinType: coinType,
    });
    if (coin_metadata === null) {
      throw new Error("Error: coin metadata not found");
    }

    return this.addReserveFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], coinType],
      {
        lendingMarketOwnerCap: lendingMarketOwnerCapId,
        lendingMarket: this.lendingMarket.id,
        priceInfo: priceInfoObjectIds[0],
        config,
        coinMetadata: coin_metadata.id as string,
        clock: SUI_CLOCK_OBJECT_ID,
      },
    );
  }

  async addReward(
    ownerId: string,
    lendingMarketOwnerCapId: string,
    reserveArrayIndex: bigint,
    isDepositReward: boolean,
    rewardCoinType: string,
    rewardValue: string,
    startTimeMs: bigint,
    endTimeMs: bigint,
    txb: TransactionBlock,
  ) {
    const isSui =
      normalizeStructTag(rewardCoinType) === normalizeStructTag(SUI_COINTYPE);

    const coins = (
      await this.client.getCoins({
        owner: ownerId,
        coinType: rewardCoinType,
      })
    ).data;

    const mergeCoin = coins[0];
    if (coins.length > 1 && !isSui) {
      txb.mergeCoins(
        txb.object(mergeCoin.coinObjectId),
        coins.map((c) => txb.object(c.coinObjectId)).slice(1),
      );
    }

    const [rewardCoin] = txb.splitCoins(
      isSui ? txb.gas : txb.object(mergeCoin.coinObjectId),
      [txb.pure(rewardValue)],
    );

    return this.addPoolRewardFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], rewardCoinType],
      {
        lendingMarketOwnerCap: lendingMarketOwnerCapId,
        lendingMarket: this.lendingMarket.id,
        reserveArrayIndex,
        isDepositReward,
        rewards: rewardCoin,
        startTimeMs,
        endTimeMs,
        clock: SUI_CLOCK_OBJECT_ID,
      },
    );
  }

  cancelReward(
    lendingMarketOwnerCapId: string,
    reserveArrayIndex: bigint,
    isDepositReward: boolean,
    rewardIndex: bigint,
    rewardCoinType: string,
    txb: TransactionBlock,
  ) {
    return this.cancelPoolRewardFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], rewardCoinType],
      {
        lendingMarketOwnerCap: lendingMarketOwnerCapId,
        lendingMarket: this.lendingMarket.id,
        reserveArrayIndex,
        isDepositReward,
        rewardIndex,
        clock: SUI_CLOCK_OBJECT_ID,
      },
    );
  }

  closeReward(
    lendingMarketOwnerCapId: string,
    reserveArrayIndex: bigint,
    isDepositReward: boolean,
    rewardIndex: bigint,
    rewardCoinType: string,
    txb: TransactionBlock,
  ) {
    return this.closePoolRewardFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], rewardCoinType],
      {
        lendingMarketOwnerCap: lendingMarketOwnerCapId,
        lendingMarket: this.lendingMarket.id,
        reserveArrayIndex,
        isDepositReward,
        rewardIndex,
        clock: SUI_CLOCK_OBJECT_ID,
      },
    );
  }

  claimReward(
    obligationOwnerCapId: string,
    reserveArrayIndex: bigint,
    rewardIndex: bigint,
    rewardType: string,
    side: Side,
    txb: TransactionBlock,
  ) {
    return this.claimRewardsFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], rewardType],
      {
        lendingMarket: txb.object(this.lendingMarket.id),
        cap: txb.object(obligationOwnerCapId),
        clock: SUI_CLOCK_OBJECT_ID,
        reserveId: reserveArrayIndex,
        rewardIndex,
        isDepositReward: side === Side.DEPOSIT,
      },
    );
  }

  claimRewardsAndDeposit(
    obligationId: string,
    rewardReserveArrayIndex: bigint,
    rewardIndex: bigint,
    rewardType: string,
    side: Side,
    depositReserveArrayIndex: bigint,
    txb: TransactionBlock,
  ) {
    return this.claimRewardsAndDepositFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], rewardType],
      {
        lendingMarket: txb.object(this.lendingMarket.id),
        obligationId,
        clock: txb.object(SUI_CLOCK_OBJECT_ID),
        rewardReserveId: rewardReserveArrayIndex,
        rewardIndex,
        isDepositReward: side === Side.DEPOSIT,
        depositReserveId: depositReserveArrayIndex,
      },
    );
  }

  async claimRewardsToObligation(
    ownerId: string,
    rewards: Array<{
      obligationOwnerCapId: string;
      reserveArrayIndex: bigint;
      rewardIndex: bigint;
      rewardType: string;
      side: Side;
    }>,
    txb: TransactionBlock,
  ) {
    const mergeCoinsMap: Record<string, any[]> = {};
    for (const reward of rewards) {
      const [claimedCoin] = this.claimReward(
        reward.obligationOwnerCapId,
        reward.reserveArrayIndex,
        reward.rewardIndex,
        reward.rewardType,
        reward.side,
        txb,
      );

      if (mergeCoinsMap[reward.rewardType] === undefined)
        mergeCoinsMap[reward.rewardType] = [];
      mergeCoinsMap[reward.rewardType].push(claimedCoin);
    }

    for (const mergeCoins of Object.values(mergeCoinsMap)) {
      const mergeCoin = mergeCoins[0];
      if (mergeCoins.length > 1) {
        txb.mergeCoins(mergeCoin, mergeCoins.slice(1));
      }

      txb.transferObjects([mergeCoin], txb.pure(ownerId));
    }
  }

  findReserveArrayIndex(coinType: string): bigint {
    const normalizedCoinType = normalizeStructTag(coinType);
    const array_index = this.lendingMarket.reserves.findIndex(
      (r: any) => normalizeStructTag(r.coinType.name) == normalizedCoinType,
    );

    return BigInt(array_index);
  }

  async updateReserveConfig(
    ownerId: string,
    lendingMarketOwnerCapId: string,
    txb: TransactionBlock,
    coinType: string,
    createReserveConfigArgs: CreateReserveConfigArgs,
  ) {
    const [config] = this.createReserveConfigFunction(
      txb,
      createReserveConfigArgs,
    );

    return this.updateReserveConfigFunction(
      txb,
      [...this.lendingMarket.$typeArgs, coinType] as [string, string],
      {
        lendingMarketOwnerCap: lendingMarketOwnerCapId,
        lendingMarket: this.lendingMarket.id,
        config,
        reserveArrayIndex: this.findReserveArrayIndex(coinType),
      },
    );
  }

  async updateRateLimiterConfig(
    lendingMarketOwnerCapId: string,
    txb: TransactionBlock,
    newRateLimiterConfigArgs: CreateRateLimiterConfigArgs,
  ) {
    const [config] = this.createRateLimiterConfigFunction(
      txb,
      newRateLimiterConfigArgs,
    );

    return this.updateRateLimiterConfigFunction(
      txb,
      this.lendingMarket.$typeArgs[0],
      {
        lendingMarketOwnerCap: lendingMarketOwnerCapId,
        lendingMarket: this.lendingMarket.id,
        clock: SUI_CLOCK_OBJECT_ID,
        config,
      },
    );
  }

  createObligation(txb: TransactionBlock) {
    return txb.moveCall({
      target: `${this.PUBLISHED_AT}::lending_market::create_obligation`,
      arguments: [txb.object(this.lendingMarket.id)],
      typeArguments: this.lendingMarket.$typeArgs,
    });
  }

  async refreshAll(
    txb: TransactionBlock,
    obligation: typeof this.Obligation,
    extraReserveArrayIndex?: bigint,
  ) {
    const reserveArrayIndexToPriceId = new Map<bigint, string>();
    obligation.deposits.forEach((deposit: any) => {
      const reserve =
        this.lendingMarket.reserves[
          deposit.reserveArrayIndex as unknown as number
        ];
      reserveArrayIndexToPriceId.set(
        deposit.reserveArrayIndex,
        toHEX(new Uint8Array(reserve.priceIdentifier.bytes)),
      );
    });

    obligation.borrows.forEach((borrow: any) => {
      const reserve =
        this.lendingMarket.reserves[
          borrow.reserveArrayIndex as unknown as number
        ];
      reserveArrayIndexToPriceId.set(
        borrow.reserveArrayIndex,
        toHEX(new Uint8Array(reserve.priceIdentifier.bytes)),
      );
    });

    if (
      extraReserveArrayIndex != undefined &&
      extraReserveArrayIndex >= 0 &&
      extraReserveArrayIndex < this.lendingMarket.reserves.length
    ) {
      const reserve =
        this.lendingMarket.reserves[
          extraReserveArrayIndex as unknown as number
        ];
      reserveArrayIndexToPriceId.set(
        extraReserveArrayIndex,
        toHEX(new Uint8Array(reserve.priceIdentifier.bytes)),
      );
    }

    const tuples = Array.from(reserveArrayIndexToPriceId.entries()).sort();
    const priceIds = Array.from(new Set(tuples.map((tuple) => tuple[1])));

    const priceUpdateData =
      await this.pythConnection.getPriceFeedsUpdateData(priceIds);
    const priceInfoObjectIds = await this.pythClient.updatePriceFeeds(
      txb,
      priceUpdateData,
      priceIds,
    );

    for (let i = 0; i < tuples.length; i++) {
      this.refreshReservePrices(txb, priceInfoObjectIds[i], tuples[i][0]);
    }
  }

  async refreshReservePrices(
    txb: TransactionBlock,
    priceInfoObjectId: string,
    reserveArrayIndex: bigint,
  ) {
    if (priceInfoObjectId == null) {
      return;
    }

    this.refreshReservePriceFunction(txb, this.lendingMarket.$typeArgs[0], {
      lendingMarket: this.lendingMarket.id,
      clock: SUI_CLOCK_OBJECT_ID,
      priceInfo: priceInfoObjectId,
      reserveArrayIndex,
    });
  }

  async deposit(
    sendCoin: ObjectArg,
    coinType: string,
    obligationOwnerCap: ObjectArg,
    txb: TransactionBlock,
  ) {
    const [ctokens] = this.depositLiquidityAndMintCtokensFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], coinType],
      {
        lendingMarket: this.lendingMarket.id,
        clock: SUI_CLOCK_OBJECT_ID,
        deposit: sendCoin,
        reserveArrayIndex: this.findReserveArrayIndex(coinType),
      },
    );

    this.depositCtokensIntoObligationFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], coinType],
      {
        lendingMarket: this.lendingMarket.id,
        obligationOwnerCap,
        deposit: ctokens,
        clock: SUI_CLOCK_OBJECT_ID,
        reserveArrayIndex: this.findReserveArrayIndex(coinType),
      },
    );
  }

  async depositCoin(
    ownerId: string,
    sendCoin: ObjectArg,
    coinType: string,
    txb: TransactionBlock,
    obligationOwnerCapId?: string,
  ) {
    let createdObligationOwnerCap;
    if (!obligationOwnerCapId) {
      createdObligationOwnerCap = this.createObligation(txb)[0];
    }

    this.deposit(
      sendCoin,
      coinType,
      (obligationOwnerCapId ?? createdObligationOwnerCap) as ObjectArg,
      txb,
    );

    if (createdObligationOwnerCap) {
      txb.transferObjects([createdObligationOwnerCap], txb.pure(ownerId));
    }
  }

  async depositIntoObligation(
    ownerId: string,
    coinType: string,
    value: string,
    txb: TransactionBlock,
    obligationOwnerCapId?: string,
  ) {
    const isSui =
      normalizeStructTag(coinType) === normalizeStructTag(SUI_COINTYPE);

    const coins = (
      await this.client.getCoins({
        owner: ownerId,
        coinType,
      })
    ).data;

    const mergeCoin = coins[0];
    if (coins.length > 1 && !isSui) {
      txb.mergeCoins(
        txb.object(mergeCoin.coinObjectId),
        coins.map((c) => txb.object(c.coinObjectId)).slice(1),
      );
    }

    const [sendCoin] = txb.splitCoins(
      isSui ? txb.gas : txb.object(mergeCoin.coinObjectId),
      [txb.pure(value)],
    );

    this.depositCoin(ownerId, sendCoin, coinType, txb, obligationOwnerCapId);
  }

  async withdraw(
    obligationOwnerCapId: string,
    obligationId: string,
    coinType: string,
    value: string,
    txb: TransactionBlock,
  ) {
    const obligation = await this.getObligation(obligationId);
    if (!obligation) throw new Error("Error: no obligation");

    await this.refreshAll(txb, obligation);
    const [ctokens] = this.withdrawCtokensFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], coinType],
      {
        lendingMarket: this.lendingMarket.id,
        obligationOwnerCap: obligationOwnerCapId,
        clock: SUI_CLOCK_OBJECT_ID,
        amount: BigInt(value),
        reserveArrayIndex: this.findReserveArrayIndex(coinType),
      },
    );

    const [exemption] = txb.moveCall({
      target: `0x1::option::none`,
      typeArguments: [
        `${this.PACKAGE_ID}::lending_market::RateLimiterExemption<${this.lendingMarket.$typeArgs[0]}, ${coinType}>`,
      ],
      arguments: [],
    });

    return txb.moveCall({
      target: `${this.PUBLISHED_AT}::lending_market::redeem_ctokens_and_withdraw_liquidity`,
      typeArguments: [this.lendingMarket.$typeArgs[0], coinType],
      arguments: [
        txb.object(this.lendingMarket.id),
        txb.pure(this.findReserveArrayIndex(coinType)),
        txb.object(SUI_CLOCK_OBJECT_ID),
        ctokens,
        exemption,
      ],
    });
  }

  async withdrawFromObligation(
    ownerId: string,
    obligationOwnerCapId: string,
    obligationId: string,
    coinType: string,
    value: string,
    txb: TransactionBlock,
  ) {
    const [withdrawCoin] = await this.withdraw(
      obligationOwnerCapId,
      obligationId,
      coinType,
      value,
      txb,
    );

    txb.transferObjects([withdrawCoin], txb.pure(ownerId));
  }

  async borrow(
    obligationOwnerCapId: string,
    obligationId: string,
    coinType: string,
    value: string,
    txb: TransactionBlock,
  ) {
    const obligation = await this.getObligation(obligationId);
    if (!obligation) throw new Error("Error: no obligation");

    await this.refreshAll(
      txb,
      obligation,
      this.findReserveArrayIndex(coinType),
    );
    const result = this.borrowFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], coinType],
      {
        lendingMarket: this.lendingMarket.id,
        obligationOwnerCap: obligationOwnerCapId,
        clock: SUI_CLOCK_OBJECT_ID,
        amount: BigInt(value),
        reserveArrayIndex: this.findReserveArrayIndex(coinType),
      },
    );

    return result;
  }

  async borrowFromObligation(
    ownerId: string,
    obligationOwnerCapId: string,
    obligationId: string,
    coinType: string,
    value: string,
    txb: TransactionBlock,
  ) {
    const [borrowCoin] = await this.borrow(
      obligationOwnerCapId,
      obligationId,
      coinType,
      value,
      txb,
    );

    txb.transferObjects([borrowCoin], txb.pure(ownerId));
  }

  repay(
    obligationId: string,
    coinType: string,
    coin: TransactionObjectArgument,
    txb: TransactionBlock,
  ) {
    return this.repayFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], coinType],
      {
        lendingMarket: this.lendingMarket.id,
        obligationId: obligationId,
        clock: SUI_CLOCK_OBJECT_ID,
        maxRepayCoins: coin,
        reserveArrayIndex: this.findReserveArrayIndex(coinType),
      },
    );
  }

  async repayIntoObligation(
    ownerId: string,
    obligationId: string,
    coinType: string,
    value: string,
    txb: TransactionBlock,
  ) {
    const isSui =
      normalizeStructTag(coinType) === normalizeStructTag(SUI_COINTYPE);

    const coins = (
      await this.client.getCoins({
        owner: ownerId,
        coinType,
      })
    ).data;

    const mergeCoin = coins[0];
    if (coins.length > 1 && !isSui) {
      txb.mergeCoins(
        txb.object(mergeCoin.coinObjectId),
        coins.map((c) => txb.object(c.coinObjectId)).slice(1),
      );
    }

    const [sendCoin] = txb.splitCoins(
      isSui ? txb.gas : txb.object(mergeCoin.coinObjectId),
      [txb.pure(value)],
    );

    const result = this.repay(obligationId, coinType, sendCoin, txb);
    txb.transferObjects([sendCoin], ownerId);
    return result;
  }

  async liquidateAndRedeem(
    txb: TransactionBlock,
    obligation: typeof this.Obligation,
    repayCoinType: string,
    withdrawCoinType: string,
    repayCoinId: any,
  ) {
    const [ctokens, exemption] = await this.liquidate(
      txb,
      obligation,
      repayCoinType,
      withdrawCoinType,
      repayCoinId,
    );

    const [optionalExemption] = txb.moveCall({
      target: `0x1::option::some`,
      typeArguments: [
        `${this.PUBLISHED_AT}::lending_market::RateLimiterExemption<${this.lendingMarket.$typeArgs[0]}, ${withdrawCoinType}>`,
      ],
      arguments: [exemption],
    });

    return txb.moveCall({
      target: `${this.PUBLISHED_AT}::lending_market::redeem_ctokens_and_withdraw_liquidity`,
      typeArguments: [this.lendingMarket.$typeArgs[0], withdrawCoinType],
      arguments: [
        txb.object(this.lendingMarket.id),
        txb.pure(this.findReserveArrayIndex(withdrawCoinType)),
        txb.object(SUI_CLOCK_OBJECT_ID),
        ctokens,
        optionalExemption,
      ],
    });
  }

  async liquidate(
    txb: TransactionBlock,
    obligation: typeof this.Obligation,
    repayCoinType: string,
    withdrawCoinType: string,
    repayCoinId: any,
  ) {
    await this.refreshAll(txb, obligation);
    return this.liquidateFunction(
      txb,
      [this.lendingMarket.$typeArgs[0], repayCoinType, withdrawCoinType],
      {
        lendingMarket: this.lendingMarket.id,
        obligationId: obligation.id,
        clock: SUI_CLOCK_OBJECT_ID,
        repayCoins: repayCoinId,
        repayReserveArrayIndex: this.findReserveArrayIndex(repayCoinType),
        withdrawReserveArrayIndex: this.findReserveArrayIndex(withdrawCoinType),
      },
    );
  }

  async migrate(txb: TransactionBlock, lendingMarketOwnerCapId: string) {
    return this.migrateFunction(txb, this.lendingMarket.$typeArgs[0], {
      lendingMarket: this.lendingMarket.id,
      lendingMarketOwnerCap: lendingMarketOwnerCapId,
    });
  }
}
