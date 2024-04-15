import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Secp256k1Keypair } from "@mysten/sui.js/keypairs/secp256k1";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  Borrow,
  Obligation,
} from "@suilend/sdk/_generated/suilend/obligation/structs";
import { Reserve } from "@suilend/sdk/_generated/suilend/reserve/structs";
import { SuilendClient } from "@suilend/sdk/client";
import { getRedeemEvent } from "@suilend/sdk/utils/events";
import { fetchAllObligationsForMarket } from "@suilend/sdk/utils/obligation";
import * as simulate from "@suilend/sdk/utils/simulate";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import { StatsD } from "hot-shots";
import { Logger } from "tslog";

import { SuiPriceServiceConnection } from "../../pyth-sdk/src";

import { Swapper } from "./swappers/interface";
import { COIN_TYPES } from "./utils/constants";
import {
  getLendingMarket,
  getWalletHoldings,
  mergeAllCoins,
  sleep,
} from "./utils/utils";

const logger = new Logger({ name: "Suilend Liquidator" });

export type LiquidatorConfig = {
  liquidateSleepSeconds: number;
  updatePositionsSleepSeconds: number;
  rpcURL: string;
  marketAddress: string;
  lendingMarketType: string;
  numLiquidationLoops: number;
  liquidationAttemptDurationSeconds: number;
  statsd?: StatsD;
};

export class Liquidator {
  client: SuiClient;
  suilend?: SuilendClient<string>;
  config: LiquidatorConfig;
  keypair: Secp256k1Keypair | Ed25519Keypair;
  liquidationTasks: {
    [key: string]: {
      obligation: Obligation<string>;
      addedAt: number;
      liquidating: boolean;
    };
  };
  swapper: Swapper;
  pythConnection: SuiPriceServiceConnection;
  statsd?: StatsD;

  constructor(
    keypair: Secp256k1Keypair | Ed25519Keypair,
    swapper: Swapper,
    config: LiquidatorConfig,
  ) {
    this.keypair = keypair;
    this.config = config;
    this.swapper = swapper;
    this.client = new SuiClient({ url: this.config.rpcURL });
    this.pythConnection = new SuiPriceServiceConnection(
      "https://hermes.pyth.network",
    );
    this.liquidationTasks = {};
    this.statsd = config.statsd;
  }

  async run() {
    logger.info("Initializing Suilend Liquidator");
    this.statsd && this.statsd.increment("restart", 1);
    this.suilend = await SuilendClient.initialize(
      this.config.marketAddress,
      this.config.lendingMarketType,
      this.client,
    );
    const loops = [this.updateLiquidatablePositions()];
    for (let i = 0; i < this.config.numLiquidationLoops; i++) {
      loops.push(this.liquidationWorker());
    }
    await Promise.all(loops);
  }

  async updateLiquidatablePositions() {
    while (true) {
      this.statsd &&
        this.statsd.increment("heartbeat", { task: "update_positions" });
      try {
        const start = Date.now();
        const obligations = await fetchAllObligationsForMarket(
          this.client,
          this.config.marketAddress,
        );
        this.statsd &&
          this.statsd.gauge("fetch_obligations_duration", Date.now() - start);
        this.statsd &&
          this.statsd.gauge("obligation_count", obligations.length);
        logger.info(`Fetched ${obligations.length} obligations`);
        let liquidationsQueued = 0;
        const now = Math.round(Date.now() / 1000);
        const lendingMarket = await this.getLendingMarket();
        const refreshedReserves = await simulate.refreshReservePrice(
          lendingMarket.reserves.map((r) =>
            simulate.compoundReserveInterest(r, now),
          ),
          this.pythConnection,
        );
        try {
          await this.rebalanceWallet();
        } catch (e: any) {
          logger.error("Error rebalancing:", e);
          this.statsd &&
            this.statsd.increment("liquidate_error", { type: "rebalance" });
        }
        for (const obligation of obligations) {
          if (obligation.borrows.length === 0) {
            continue;
          }
          if (this.liquidationTasks[obligation.id]) {
            continue;
          }
          const refreshedObligation = await this.simulateRefreshObligation(
            obligation,
            refreshedReserves,
          );
          if (this.shouldAttemptLiquidations(refreshedObligation)) {
            liquidationsQueued += 1;
            this.statsd && this.statsd.increment("enqueue_liquidation", 1);
            logger.info(`Enqueueing ${obligation.id} for liquidation`);
            this.liquidationTasks[refreshedObligation.id] = {
              obligation: refreshedObligation,
              addedAt: Math.round(Date.now() / 1000),
              liquidating: false,
            };
          }
        }
        logger.info(`${liquidationsQueued} obligations marked for liquidation`);
        await sleep(this.config.updatePositionsSleepSeconds * 1000);
      } catch (e: any) {
        logger.error(e);
        this.statsd &&
          this.statsd.increment("liquidate_error", 1, {
            type: "update_positions",
          });
        await sleep(this.config.updatePositionsSleepSeconds * 1000);
        continue;
      }
    }
  }

  async liquidationWorker() {
    while (true) {
      this.statsd &&
        this.statsd.increment("heartbeat", { task: "liquidation_worker" });
      if (
        Object.values(this.liquidationTasks).filter(
          (x) => x.liquidating === false,
        ).length == 0
      ) {
        await sleep(this.config.liquidateSleepSeconds * 1000);
        continue;
      }
      // Sort by the debt amount
      const details = Object.values(this.liquidationTasks)
        .filter((x) => x.liquidating === false)
        .sort((x, y) => 0)[0];
      this.statsd && this.statsd.increment("started_liquidation_task", 1);
      this.statsd &&
        this.statsd.gauge(
          "task_delay",
          Math.round(Date.now() / 1000) - details.addedAt,
        );
      this.liquidationTasks[details.obligation.id].liquidating = true;
      try {
        await this.tryLiquidatePosition(details.obligation);
      } catch (e: any) {
        this.statsd &&
          this.statsd.increment("liquidate_error", {
            type: "try_liquidate_error",
          });
        logger.error(e);
      }
      delete this.liquidationTasks[details.obligation.id];
    }
  }

  async tryLiquidatePosition(obligation: Obligation<string>) {
    logger.info(`Beginning liquidation of ${obligation.id}`);
    let liquidationDigest;
    const startTime = Date.now() / 1000;
    const withdrawCoinType = this.selectWithdrawAsset(obligation);
    let attemptCount = 0;
    while (true) {
      attemptCount += 1;
      try {
        const lendingMarket = await this.getLendingMarket();
        const { repayCoinType, repayAmount } = this.selectRepayAssetAndAmount(
          obligation,
          lendingMarket.reserves,
        );

        let txb = new TransactionBlock();
        let repayCoin;
        if (repayCoinType === COIN_TYPES.USDC) {
          // TODO: Would better to merge here.
          logger.info("Repay is USDC. No need to swap.");
          const holding = (
            await getWalletHoldings(this.client, this.keypair)
          ).find((h) => h.coinType === COIN_TYPES.USDC);
          repayCoin = holding?.coinObjectId;
        } else {
          logger.info(`Buying ${repayAmount} ${repayCoinType} for liquidation`);
          const swapResult = await this.swapper.swap({
            fromCoinType: COIN_TYPES.USDC,
            toCoinType: repayCoinType,
            toAmount: repayAmount,
            maxSlippage: 0.05,
            txb: txb,
          });
          txb = swapResult!.txb;
          txb.transferObjects(
            [swapResult!.fromCoin],
            this.keypair.toSuiAddress(),
          );
          repayCoin = swapResult?.toCoin;
        }
        if (!repayCoin) {
          this.statsd &&
            this.statsd.increment("liquidate_error", {
              type: "no_repay_found",
            });
          logger.error("No repay coin found");
          return;
        }
        const [withdrawAsset] = await this.suilend!.liquidateAndRedeem(
          txb,
          obligation,
          repayCoinType,
          withdrawCoinType,
          repayCoin,
        );
        txb.transferObjects(
          [withdrawAsset, repayCoin],
          this.keypair.toSuiAddress(),
        );
        const liquidateResult =
          await this.client.signAndExecuteTransactionBlock({
            transactionBlock: txb,
            signer: this.keypair,
          });
        await this.client.waitForTransactionBlock({
          digest: liquidateResult.digest,
          timeout: 30,
          pollInterval: 1,
        });
        liquidationDigest = liquidateResult.digest;
        logger.info("Liquidated", obligation.id, liquidateResult.digest);
        this.statsd &&
          this.statsd.increment("liquidate_success", 1, {
            repayAsset: repayCoinType,
            withdrawAsset: withdrawCoinType,
          });
        break;
      } catch (e: any) {
        logger.error(`Error liquidating ${obligation.id} ${e}`);
        this.statsd &&
          this.statsd.increment("liquidate_error", 1, {
            type: "error_liquidating",
          });
        if (
          Date.now() / 1000 - startTime >
          this.config.liquidationAttemptDurationSeconds
        ) {
          logger.info(`Unable to liquidate ${obligation.id}. Giving up.`);
          this.statsd && this.statsd.increment("liquidate_giveup", 1);
          break;
        }
      }
    }
    if (liquidationDigest) {
      logger.info("Dumping withdrawn assets.");
      const redeemEvent = await getRedeemEvent(this.client, liquidationDigest);
      if (!redeemEvent) {
        logger.error(
          `Could not find redeem event in liquidation ${liquidationDigest}`,
        );
        this.statsd &&
          this.statsd.increment("liquidate_error", 1, { type: "no_redeem" });
        return;
      }
      await this.swapAndConfirm({
        fromCoinType: withdrawCoinType,
        toCoinType: COIN_TYPES.USDC,
        fromAmount: parseInt(redeemEvent.params().liquidity_amount),
      });
      logger.info(`Succesfully dumped withdrawn assets`);
    }
  }

  async rebalanceWallet() {
    if (Object.keys(this.liquidationTasks).length > 0) {
      logger.info("Not rebalancing wallet: Liquidations ongoing.");
      return;
    }
    const SUI_HOLDINGS_TARGET = 5 * 1000000000;
    await mergeAllCoins(this.client, this.keypair, { waitForCommitment: true });
    const holdings = await getWalletHoldings(this.client, this.keypair);
    for (const holding of holdings) {
      this.statsd &&
        holding.symbol &&
        this.statsd.gauge(
          "wallet_balance",
          holding.balance.div(new BN(10 ** holding.decimals)).toNumber(),
          {
            symbol: holding.symbol,
          },
        );
      if (
        holding.coinType === COIN_TYPES.SUI ||
        holding.coinType === COIN_TYPES.USDC
      ) {
        continue;
      }
      // TODO: Only balance the assets that are listed in the market
      // If we have a ctoken, then we should probably try to redeem it.
      if (holding.coinType.includes("CToken")) {
        continue;
      }
      try {
        logger.info(`Swapping ${holding.coinType} for USDC`);
        await this.swapAndConfirm({
          fromCoinType: holding.coinType,
          toCoinType: COIN_TYPES.USDC,
          fromAmount: holding.balance.toNumber(),
        });
      } catch (e: any) {
        logger.error(`Failed to dump ${holding.coinType}. Moving on...`);
      }
    }
    const updatedHoldings = await getWalletHoldings(this.client, this.keypair);
    const suiHoldings = updatedHoldings.find(
      (x) => x.coinType === COIN_TYPES.SUI,
    );
    if (suiHoldings!.balance.toNumber() > SUI_HOLDINGS_TARGET * 1.1) {
      logger.info(`Holding too much SUI. Selling to rebalance.`);
      await this.swapAndConfirm({
        fromCoinType: COIN_TYPES.SUI,
        toCoinType: COIN_TYPES.USDC,
        fromAmount: suiHoldings?.balance
          .sub(new BN(SUI_HOLDINGS_TARGET))
          .toNumber(),
      });
    } else if (suiHoldings!.balance.toNumber() < SUI_HOLDINGS_TARGET * 0.9) {
      // TODO: Handle the case where we don't have enough USDC for this
      logger.info(`Holding not enough SUI. Buying to rebalance.`);
      await this.swapAndConfirm({
        fromCoinType: COIN_TYPES.USDC,
        toCoinType: COIN_TYPES.SUI,
        toAmount: new BN(SUI_HOLDINGS_TARGET)
          .sub(suiHoldings!.balance)
          .toNumber(),
      });
    }
  }

  async simulateRefreshObligation(
    obligation: Obligation<string>,
    refreshedReserves: Reserve<string>[],
  ): Promise<Obligation<string>> {
    return await simulate.refreshObligation(obligation, refreshedReserves);
  }
  shouldAttemptLiquidations(obligation: Obligation<string>): boolean {
    if (Math.floor(Math.random() * 1000) == 0) {
      console.log({
        obligationId: obligation.id,
        wbv: obligation.weightedBorrowedValueUsd,
        uhbv: obligation.unhealthyBorrowValueUsd,
      });
    }

    return simulate
      .decimalToBigNumber(obligation.weightedBorrowedValueUsd)
      .gt(simulate.decimalToBigNumber(obligation.unhealthyBorrowValueUsd));
  }

  selectRepay(
    obligation: Obligation<string>,
    reserves: Reserve<string>[],
  ): Borrow {
    const coinTypeToBorrowWeight: { [key: string]: number } = {};
    for (const reserve of reserves) {
      const borrowWeight = new BigNumber(
        (reserve.config.element!.borrowWeightBps / BigInt(10000)).toString(),
      );
      coinTypeToBorrowWeight[reserve.coinType.name] = borrowWeight.toNumber();
    }
    const borrowedCoinTypes = obligation.borrows.sort((x, y) =>
      simulate
        .decimalToBigNumber(y.marketValue)
        .multipliedBy(coinTypeToBorrowWeight[y.coinType.name])
        .minus(
          simulate
            .decimalToBigNumber(x.marketValue)
            .multipliedBy(coinTypeToBorrowWeight[x.coinType.name]),
        )
        .toNumber(),
    );
    return borrowedCoinTypes[0];
  }

  selectRepayAssetAndAmount(
    obligation: Obligation<string>,
    reserves: Reserve<string>[],
  ) {
    const deficitUsd = simulate
      .decimalToBigNumber(obligation.weightedBorrowedValueUsd)
      .minus(simulate.decimalToBigNumber(obligation.unhealthyBorrowValueUsd));
    const repay = this.selectRepay(obligation, reserves);
    const assetValue = simulate
      .decimalToBigNumber(repay.marketValue)
      .dividedBy(simulate.decimalToBigNumber(repay.borrowedAmount));
    const repayAmount = BigNumber.min(
      deficitUsd.dividedBy(assetValue),
      simulate.decimalToBigNumber(repay.borrowedAmount),
    );
    return {
      repayCoinType: "0x" + repay.coinType.name,
      repayAmount: Math.ceil(repayAmount.toNumber()),
    };
  }

  selectWithdrawAsset(obligation: Obligation<string>) {
    const depositedCoinTypes = obligation.deposits.sort((x, y) =>
      simulate
        .decimalToBigNumber(y.marketValue)
        .minus(simulate.decimalToBigNumber(x.marketValue))
        .toNumber(),
    );
    return "0x" + depositedCoinTypes[0].coinType.name;
  }

  async getLendingMarket() {
    return await getLendingMarket(this.client, this.config.marketAddress);
  }

  async swapAndConfirm(params: {
    fromCoinType: string;
    toCoinType: string;
    fromAmount?: number;
    toAmount?: number;
  }) {
    const txb = new TransactionBlock();
    const result = await this.swapper.swap({
      fromCoinType: params.fromCoinType,
      toCoinType: params.toCoinType,
      fromAmount: params.fromAmount,
      toAmount: params.toAmount,
      maxSlippage: 0.1,
      txb: txb,
    });
    if (!result) {
      return;
    }
    result.txb.transferObjects(
      [result?.fromCoin, result?.toCoin],
      this.keypair.toSuiAddress(),
    );
    const txResult = await this.client.signAndExecuteTransactionBlock({
      transactionBlock: result.txb,
      signer: this.keypair,
    });
    return await this.client.waitForTransactionBlock({
      digest: txResult.digest,
      timeout: 60,
      pollInterval: 1,
    });
  }
}
