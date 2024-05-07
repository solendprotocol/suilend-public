import { useState } from "react";

import { TransactionBlock } from "@mysten/sui.js/transactions";
import * as Sentry from "@sentry/nextjs";
import { formatISO } from "date-fns";
import { Sparkle } from "lucide-react";
import { toast } from "sonner";

import { SuilendClient } from "@suilend/sdk/client";
import { ParsedPoolReward, ParsedReserve } from "@suilend/sdk/parsers/reserve";

import AddRewardDialog from "@/components/admin/AddRewardDialog";
import Dialog from "@/components/admin/Dialog";
import PoolRewardsTable from "@/components/admin/PoolRewardsTable";
import Button from "@/components/shared/Button";
import Grid from "@/components/shared/Grid";
import LabelWithValue from "@/components/shared/LabelWithValue";
import Tabs from "@/components/shared/Tabs";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import Value from "@/components/shared/Value";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";

interface ReserveRewardsDialogProps {
  reserve: ParsedReserve;
}

export default function ReserveRewardsDialog({
  reserve,
}: ReserveRewardsDialogProps) {
  const { address } = useWalletContext();
  const {
    refreshData,
    explorer,
    signExecuteAndWaitTransactionBlock,
    ...restAppContext
  } = useAppContext();
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;
  const data = restAppContext.data as AppData;

  // Tabs
  enum Tab {
    DEPOSITS = "deposits",
    BORROWS = "borrows",
  }

  const tabs = [
    { id: Tab.DEPOSITS, title: "Deposits" },
    { id: Tab.BORROWS, title: "Borrows" },
  ];

  const [selectedTab, setSelectedTab] = useState<Tab>(Tab.DEPOSITS);
  const poolRewardManager =
    selectedTab === Tab.DEPOSITS
      ? reserve.depositsPoolRewardManager
      : reserve.borrowsPoolRewardManager;

  const onCancelReward = async (poolReward: ParsedPoolReward) => {
    if (!address) throw new Error("Wallet not connected");
    if (!data.lendingMarketOwnerCapId)
      throw new Error("Error: No lending market owner cap");

    const txb = new TransactionBlock();

    const reserveArrayIndex = reserve.arrayIndex;
    const isDepositReward = selectedTab === Tab.DEPOSITS;
    const rewardIndex = BigInt(poolReward.rewardIndex);
    const rewardCoinType = poolReward.coinType;

    try {
      try {
        const [unclaimedRewards] = suilendClient.cancelReward(
          data.lendingMarketOwnerCapId,
          reserveArrayIndex,
          isDepositReward,
          rewardIndex,
          rewardCoinType,
          txb,
        );
        txb.transferObjects([unclaimedRewards], address);
      } catch (err) {
        Sentry.captureException(err);
        console.error(err);
        throw err;
      }

      await signExecuteAndWaitTransactionBlock(txb);

      toast.success("Canceled reward");
    } catch (err) {
      toast.error("Failed to cancel reward", {
        description: ((err as Error)?.message || err) as string,
      });
    } finally {
      await refreshData();
    }
  };

  const onCloseReward = async (poolReward: ParsedPoolReward) => {
    if (!address) throw new Error("Wallet not connected");
    if (!data.lendingMarketOwnerCapId)
      throw new Error("Error: No lending market owner cap");

    const txb = new TransactionBlock();

    const reserveArrayIndex = reserve.arrayIndex;
    const isDepositReward = selectedTab === Tab.DEPOSITS;
    const rewardIndex = BigInt(poolReward.rewardIndex);
    const rewardCoinType = poolReward.coinType;

    try {
      try {
        const [unclaimedRewards] = suilendClient.closeReward(
          data.lendingMarketOwnerCapId,
          reserveArrayIndex,
          isDepositReward,
          rewardIndex,
          rewardCoinType,
          txb,
        );
        txb.transferObjects([unclaimedRewards], address);
      } catch (err) {
        Sentry.captureException(err);
        console.error(err);
        throw err;
      }

      await signExecuteAndWaitTransactionBlock(txb);

      toast.success("Closed reward");
    } catch (err) {
      toast.error("Failed to close reward", {
        description: ((err as Error)?.message || err) as string,
      });
    } finally {
      await refreshData();
    }
  };

  return (
    <Dialog
      trigger={
        <Button
          labelClassName="text-xs"
          startIcon={<Sparkle />}
          variant="secondaryOutline"
        >
          Rewards
        </Button>
      }
      contentProps={{ className: "sm:max-w-max" }}
      titleIcon={<Sparkle />}
      title="Rewards"
      description={
        <div className="flex flex-row gap-2">
          <TBody>{reserve.symbol}</TBody>
          <Value
            value={reserve.id}
            url={explorer.buildObjectUrl(reserve.id)}
            isId
          />
        </div>
      }
      descriptionAsChild
    >
      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={(tab) => setSelectedTab(tab as Tab)}
      >
        <Grid>
          <LabelWithValue
            label="$typeName"
            value={poolRewardManager.$typeName}
            isType
          />
          <LabelWithValue label="id" value={poolRewardManager.id} isId />
          <LabelWithValue
            label="totalShares"
            value={poolRewardManager.totalShares.toString()}
          />
          <LabelWithValue
            label="lastUpdateTimeMs"
            value={formatISO(
              new Date(Number(poolRewardManager.lastUpdateTimeMs)),
            )}
          />

          <div className="flex flex-col gap-2 md:col-span-2">
            <TLabelSans>poolRewards</TLabelSans>

            <div className="overflow-hidden rounded-md border">
              <PoolRewardsTable
                poolRewards={poolRewardManager.poolRewards
                  .map((pr) => ({
                    startTime: new Date(pr.startTimeMs),
                    endTime: new Date(pr.endTimeMs),
                    totalRewards: pr.totalRewards,
                    allocatedRewards: pr.allocatedRewards,
                    cumulativeRewardsPerShare: pr.cumulativeRewardsPerShare,
                    mintDecimals: pr.mintDecimals,
                    symbol: pr.symbol,
                    poolReward: pr,
                  }))
                  .sort(
                    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
                  )}
                noPoolRewardsMessage={`No ${selectedTab === Tab.DEPOSITS ? "deposit" : "borrow"} rewards`}
                onCancelReward={onCancelReward}
                onCloseReward={onCloseReward}
              />
            </div>

            <AddRewardDialog
              reserve={reserve}
              isDepositReward={selectedTab === Tab.DEPOSITS}
            />
          </div>
        </Grid>
      </Tabs>
    </Dialog>
  );
}
