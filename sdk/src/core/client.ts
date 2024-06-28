import { fromB64, toHEX } from "@mysten/bcs";
import { SuiClient } from "@mysten/sui/client";
import {
  Transaction,
  TransactionObjectArgument,
  TransactionResult,
} from "@mysten/sui/transactions";
import { SUI_CLOCK_OBJECT_ID, normalizeStructTag } from "@mysten/sui/utils";
import {
  SuiPriceServiceConnection,
  SuiPythClient,
} from "@pythnetwork/pyth-sui-js";

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
    tx: Transaction,
    typeArg: string,
    registry: ObjectArg,
  ) => TransactionResult;
  createReserveConfig: (
    tx: Transaction,
    args: CreateReserveConfigArgs,
  ) => TransactionResult;
  updateReserveConfig: (
    tx: Transaction,
    typeArgs: [string, string],
    args: UpdateReserveConfigArgs,
  ) => TransactionResult;
  addReserve: (
    tx: Transaction,
    typeArgs: [string, string],
    args: AddReserveArgs,
  ) => TransactionResult;
  addPoolReward: (
    tx: Transaction,
    typeArgs: [string, string],
    args: AddPoolRewardArgs,
  ) => TransactionResult;
  cancelPoolReward: (
    tx: Transaction,
    typeArgs: [string, string],
    args: CancelPoolRewardArgs,
  ) => TransactionResult;
  closePoolReward: (
    tx: Transaction,
    typeArgs: [string, string],
    args: ClosePoolRewardArgs,
  ) => TransactionResult;
  claimRewards: (
    tx: Transaction,
    typeArgs: [string, string],
    args: ClaimRewardsArgs,
  ) => TransactionResult;
  claimRewardsAndDeposit: (
    tx: Transaction,
    typeArgs: [string, string],
    args: ClaimRewardsAndDepositArgs,
  ) => TransactionResult;
  createRateLimiterConfig: (
    tx: Transaction,
    args: CreateRateLimiterConfigArgs,
  ) => TransactionResult;
  updateRateLimiterConfig: (
    tx: Transaction,
    typeArg: string,
    args: UpdateRateLimiterConfigArgs,
  ) => TransactionResult;
  refreshReservePrice: (
    tx: Transaction,
    typeArg: string,
    args: RefreshReservePriceArgs,
  ) => TransactionResult;
  depositLiquidityAndMintCtokens: (
    tx: Transaction,
    typeArgs: [string, string],
    args: DepositLiquidityAndMintCtokensArgs,
  ) => TransactionResult;
  depositCtokensIntoObligation: (
    tx: Transaction,
    typeArgs: [string, string],
    args: DepositCtokensIntoObligationArgs,
  ) => TransactionResult;
  withdrawCtokens: (
    tx: Transaction,
    typeArgs: [string, string],
    args: WithdrawCtokensArgs,
  ) => TransactionResult;
  borrow: (
    tx: Transaction,
    typeArgs: [string, string],
    args: BorrowArgs,
  ) => TransactionResult;
  repay: (
    tx: Transaction,
    typeArgs: [string, string],
    args: RepayArgs,
  ) => TransactionResult;
  liquidate: (
    tx: Transaction,
    typeArgs: [string, string, string],
    args: LiquidateArgs,
  ) => TransactionResult;
  migrate: (
    tx: Transaction,
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
    tx: Transaction,
    {
      LendingMarket,
      createLendingMarket,
    }: Pick<Deps, "LendingMarket" | "createLendingMarket">,
  ) {
    const [ownerCap, lendingMarket] = createLendingMarket(
      tx,
      lendingMarketType,
      tx.object(registryId),
    );
    tx.moveCall({
      target: "0x2::transfer::public_share_object",
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
    tx: Transaction,
    pythPriceId: string,
    coinType: string,
    createReserveConfigArgs: CreateReserveConfigArgs,
  ) {
    const [config] = this.createReserveConfigFunction(
      tx,
      createReserveConfigArgs,
    );

    const priceUpdateData = await this.pythConnection.getPriceFeedsUpdateData([
      pythPriceId,
    ]);
    const priceInfoObjectIds = await this.pythClient.updatePriceFeeds(
      tx,
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
      tx,
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
    tx: Transaction,
  ) {
    const isSui =
      normalizeStructTag(rewardCoinType) === normalizeStructTag(SUI_COINTYPE);

    const coins = (
      await this.client.getCoins({
        owner: ownerId,
        coinType: rewardCoinType,
      })
    ).data;

    const mergedCoin = coins[0];
    if (coins.length > 1 && !isSui) {
      tx.mergeCoins(
        tx.object(mergedCoin.coinObjectId),
        coins.map((c) => tx.object(c.coinObjectId)).slice(1),
      );
    }

    const [rewardCoin] = tx.splitCoins(
      isSui ? tx.gas : tx.object(mergedCoin.coinObjectId),
      [rewardValue],
    );

    return this.addPoolRewardFunction(
      tx,
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
    tx: Transaction,
  ) {
    return this.cancelPoolRewardFunction(
      tx,
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
    tx: Transaction,
  ) {
    return this.closePoolRewardFunction(
      tx,
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
    tx: Transaction,
  ) {
    return this.claimRewardsFunction(
      tx,
      [this.lendingMarket.$typeArgs[0], rewardType],
      {
        lendingMarket: tx.object(this.lendingMarket.id),
        cap: tx.object(obligationOwnerCapId),
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
    tx: Transaction,
  ) {
    return this.claimRewardsAndDepositFunction(
      tx,
      [this.lendingMarket.$typeArgs[0], rewardType],
      {
        lendingMarket: tx.object(this.lendingMarket.id),
        obligationId,
        clock: tx.object(SUI_CLOCK_OBJECT_ID),
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
    tx: Transaction,
  ) {
    const claimedCoins = rewards.map((r) => {
      const [claimedCoin] = this.claimReward(
        r.obligationOwnerCapId,
        r.reserveArrayIndex,
        r.rewardIndex,
        r.rewardType,
        r.side,
        tx,
      );
      return claimedCoin;
    });

    const mergedCoin = claimedCoins[0];
    if (claimedCoins.length > 1) {
      tx.mergeCoins(mergedCoin, claimedCoins.slice(1));
    }

    tx.transferObjects([mergedCoin], tx.pure.address(ownerId));
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
    tx: Transaction,
    coinType: string,
    createReserveConfigArgs: CreateReserveConfigArgs,
  ) {
    const [config] = this.createReserveConfigFunction(
      tx,
      createReserveConfigArgs,
    );

    return this.updateReserveConfigFunction(
      tx,
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
    tx: Transaction,
    newRateLimiterConfigArgs: CreateRateLimiterConfigArgs,
  ) {
    const [config] = this.createRateLimiterConfigFunction(
      tx,
      newRateLimiterConfigArgs,
    );

    return this.updateRateLimiterConfigFunction(
      tx,
      this.lendingMarket.$typeArgs[0],
      {
        lendingMarketOwnerCap: lendingMarketOwnerCapId,
        lendingMarket: this.lendingMarket.id,
        clock: SUI_CLOCK_OBJECT_ID,
        config,
      },
    );
  }

  createObligation(tx: Transaction) {
    return tx.moveCall({
      target: `${this.PUBLISHED_AT}::lending_market::create_obligation`,
      arguments: [tx.object(this.lendingMarket.id)],
      typeArguments: this.lendingMarket.$typeArgs,
    });
  }

  async refreshAll(
    tx: Transaction,
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
      tx,
      priceUpdateData,
      priceIds,
    );

    for (let i = 0; i < tuples.length; i++) {
      this.refreshReservePrices(tx, priceInfoObjectIds[i], tuples[i][0]);
    }
  }

  async refreshReservePrices(
    tx: Transaction,
    priceInfoObjectId: string,
    reserveArrayIndex: bigint,
  ) {
    if (priceInfoObjectId == null) {
      return;
    }

    this.refreshReservePriceFunction(tx, this.lendingMarket.$typeArgs[0], {
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
    tx: Transaction,
  ) {
    const [ctokens] = this.depositLiquidityAndMintCtokensFunction(
      tx,
      [this.lendingMarket.$typeArgs[0], coinType],
      {
        lendingMarket: this.lendingMarket.id,
        clock: SUI_CLOCK_OBJECT_ID,
        deposit: sendCoin,
        reserveArrayIndex: this.findReserveArrayIndex(coinType),
      },
    );

    this.depositCtokensIntoObligationFunction(
      tx,
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
    tx: Transaction,
    obligationOwnerCapId?: string,
  ) {
    let createdObligationOwnerCap;
    if (!obligationOwnerCapId) {
      createdObligationOwnerCap = this.createObligation(tx)[0];
    }

    this.deposit(
      sendCoin,
      coinType,
      (obligationOwnerCapId ?? createdObligationOwnerCap) as ObjectArg,
      tx,
    );

    if (createdObligationOwnerCap) {
      tx.transferObjects([createdObligationOwnerCap], tx.pure.address(ownerId));
    }
  }

  async depositIntoObligation(
    ownerId: string,
    coinType: string,
    value: string,
    tx: Transaction,
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

    const mergedCoin = coins[0];
    if (coins.length > 1 && !isSui) {
      tx.mergeCoins(
        tx.object(mergedCoin.coinObjectId),
        coins.map((c) => tx.object(c.coinObjectId)).slice(1),
      );
    }

    const [sendCoin] = tx.splitCoins(
      isSui ? tx.gas : tx.object(mergedCoin.coinObjectId),
      [value],
    );

    this.depositCoin(ownerId, sendCoin, coinType, tx, obligationOwnerCapId);
  }

  async withdraw(
    obligationOwnerCapId: string,
    obligationId: string,
    coinType: string,
    value: string,
    tx: Transaction,
  ) {
    const obligation = await this.getObligation(obligationId);
    if (!obligation) throw new Error("Error: no obligation");

    await this.refreshAll(tx, obligation);
    const [ctokens] = this.withdrawCtokensFunction(
      tx,
      [this.lendingMarket.$typeArgs[0], coinType],
      {
        lendingMarket: this.lendingMarket.id,
        obligationOwnerCap: obligationOwnerCapId,
        clock: SUI_CLOCK_OBJECT_ID,
        amount: BigInt(value),
        reserveArrayIndex: this.findReserveArrayIndex(coinType),
      },
    );

    const [exemption] = tx.moveCall({
      target: `0x1::option::none`,
      typeArguments: [
        `${this.PACKAGE_ID}::lending_market::RateLimiterExemption<${this.lendingMarket.$typeArgs[0]}, ${coinType}>`,
      ],
      arguments: [],
    });

    return tx.moveCall({
      target: `${this.PUBLISHED_AT}::lending_market::redeem_ctokens_and_withdraw_liquidity`,
      typeArguments: [this.lendingMarket.$typeArgs[0], coinType],
      arguments: [
        tx.object(this.lendingMarket.id),
        tx.pure.u64(this.findReserveArrayIndex(coinType)),
        tx.object(SUI_CLOCK_OBJECT_ID),
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
    tx: Transaction,
  ) {
    const [withdrawCoin] = await this.withdraw(
      obligationOwnerCapId,
      obligationId,
      coinType,
      value,
      tx,
    );

    tx.transferObjects([withdrawCoin], tx.pure.address(ownerId));
  }

  async borrow(
    obligationOwnerCapId: string,
    obligationId: string,
    coinType: string,
    value: string,
    tx: Transaction,
  ) {
    const obligation = await this.getObligation(obligationId);
    if (!obligation) throw new Error("Error: no obligation");

    await this.refreshAll(tx, obligation, this.findReserveArrayIndex(coinType));
    const result = this.borrowFunction(
      tx,
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
    tx: Transaction,
  ) {
    const [borrowCoin] = await this.borrow(
      obligationOwnerCapId,
      obligationId,
      coinType,
      value,
      tx,
    );

    tx.transferObjects([borrowCoin], tx.pure.address(ownerId));
  }

  repay(
    obligationId: string,
    coinType: string,
    coin: TransactionObjectArgument,
    tx: Transaction,
  ) {
    return this.repayFunction(tx, [this.lendingMarket.$typeArgs[0], coinType], {
      lendingMarket: this.lendingMarket.id,
      obligationId: obligationId,
      clock: SUI_CLOCK_OBJECT_ID,
      maxRepayCoins: coin,
      reserveArrayIndex: this.findReserveArrayIndex(coinType),
    });
  }

  async repayIntoObligation(
    ownerId: string,
    obligationId: string,
    coinType: string,
    value: string,
    tx: Transaction,
  ) {
    const isSui =
      normalizeStructTag(coinType) === normalizeStructTag(SUI_COINTYPE);

    const coins = (
      await this.client.getCoins({
        owner: ownerId,
        coinType,
      })
    ).data;

    const mergedCoin = coins[0];
    if (coins.length > 1 && !isSui) {
      tx.mergeCoins(
        tx.object(mergedCoin.coinObjectId),
        coins.map((c) => tx.object(c.coinObjectId)).slice(1),
      );
    }

    const [sendCoin] = tx.splitCoins(
      isSui ? tx.gas : tx.object(mergedCoin.coinObjectId),
      [value],
    );

    const result = this.repay(obligationId, coinType, sendCoin, tx);
    tx.transferObjects([sendCoin], ownerId);
    return result;
  }

  async liquidateAndRedeem(
    tx: Transaction,
    obligation: typeof this.Obligation,
    repayCoinType: string,
    withdrawCoinType: string,
    repayCoinId: any,
  ) {
    const [ctokens, exemption] = await this.liquidate(
      tx,
      obligation,
      repayCoinType,
      withdrawCoinType,
      repayCoinId,
    );

    const [optionalExemption] = tx.moveCall({
      target: `0x1::option::some`,
      typeArguments: [
        `${this.PUBLISHED_AT}::lending_market::RateLimiterExemption<${this.lendingMarket.$typeArgs[0]}, ${withdrawCoinType}>`,
      ],
      arguments: [exemption],
    });

    return tx.moveCall({
      target: `${this.PUBLISHED_AT}::lending_market::redeem_ctokens_and_withdraw_liquidity`,
      typeArguments: [this.lendingMarket.$typeArgs[0], withdrawCoinType],
      arguments: [
        tx.object(this.lendingMarket.id),
        tx.pure.u64(this.findReserveArrayIndex(withdrawCoinType)),
        tx.object(SUI_CLOCK_OBJECT_ID),
        ctokens,
        optionalExemption,
      ],
    });
  }

  async liquidate(
    tx: Transaction,
    obligation: typeof this.Obligation,
    repayCoinType: string,
    withdrawCoinType: string,
    repayCoinId: any,
  ) {
    await this.refreshAll(tx, obligation);
    return this.liquidateFunction(
      tx,
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

  async migrate(tx: Transaction, lendingMarketOwnerCapId: string) {
    return this.migrateFunction(tx, this.lendingMarket.$typeArgs[0], {
      lendingMarket: this.lendingMarket.id,
      lendingMarketOwnerCap: lendingMarketOwnerCapId,
    });
  }
}
