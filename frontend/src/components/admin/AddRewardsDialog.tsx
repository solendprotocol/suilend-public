import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { CoinMetadata, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import BigNumber from "bignumber.js";
import { isEqual } from "lodash";
import { Eraser, Sparkle } from "lucide-react";
import { toast } from "sonner";

import { SuilendClient } from "@suilend/sdk/client";
import { Side } from "@suilend/sdk/types";

import CoinPopover from "@/components/admin/CoinPopover";
import Dialog from "@/components/admin/Dialog";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import TokenLogo from "@/components/shared/TokenLogo";
import { TBody } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { parseCoinBalances } from "@/lib/coinBalance";
import { getCoinMetadataMap } from "@/lib/coinMetadata";
import { cn } from "@/lib/utils";

export default function AddRewardsDialog() {
  const { address } = useWalletContext();
  const { refreshData, signExecuteAndWaitTransaction, ...restAppContext } =
    useAppContext();
  const suiClient = restAppContext.suiClient as SuiClient;
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;
  const data = restAppContext.data as AppData;

  const isEditable = !!data.lendingMarketOwnerCapId;

  // Coin metadata
  const uniqueCoinTypes = useMemo(() => {
    const coinTypes = data.coinBalancesRaw.map((cb) => cb.coinType);

    return Array.from(new Set(coinTypes));
  }, [data.coinBalancesRaw]);

  const fetchingCoinTypesRef = useRef<string[] | undefined>(undefined);
  const [coinMetadataMap, setCoinMetadataMap] = useState<
    Record<string, CoinMetadata>
  >({});
  useEffect(() => {
    (async () => {
      const filteredCoinTypes = uniqueCoinTypes.filter(
        (coinType) => !coinMetadataMap[coinType],
      );
      if (filteredCoinTypes.length === 0) return;

      if (
        fetchingCoinTypesRef.current !== undefined &&
        !isEqual(filteredCoinTypes, fetchingCoinTypesRef.current)
      )
        return;

      fetchingCoinTypesRef.current = filteredCoinTypes;
      const result = await getCoinMetadataMap(suiClient, filteredCoinTypes);
      setCoinMetadataMap(result);
    })();
  }, [uniqueCoinTypes, coinMetadataMap, suiClient]);

  const coinBalancesMap = parseCoinBalances(
    data.coinBalancesRaw,
    uniqueCoinTypes,
    undefined,
    coinMetadataMap,
  );

  // State
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [coinIndex, setCoinIndex] = useState<number | null>(null);
  const coin =
    coinIndex !== null ? Object.values(coinBalancesMap)[coinIndex] : undefined;

  const [startTimeMs, setStartTimeMs] = useState<string>("");
  const [endTimeMs, setEndTimeMs] = useState<string>("");

  const [rewardsMap, setRewardsMap] = useState<
    Record<string, Record<string, string>>
  >({});
  const setRewardsValue =
    (coinType: string, rewardType: string) => (value: string) =>
      setRewardsMap((prev) => ({
        ...prev,
        [coinType]: { ...prev[coinType], [rewardType]: value },
      }));

  const reset = () => {
    setCoinIndex(null);

    setStartTimeMs("");
    setEndTimeMs("");

    setRewardsMap({});
  };

  // Submit
  const submit = async () => {
    if (!address) throw new Error("Wallet not connected");
    if (!data.lendingMarketOwnerCapId)
      throw new Error("Error: No lending market owner cap");

    if (coinIndex === null) {
      toast.error("Select a coin");
      return;
    }
    if (!coin) {
      toast.error("Invalid coin selected");
      return;
    }
    if (startTimeMs === "") {
      toast.error("Enter a start time");
      return;
    }
    if (endTimeMs === "") {
      toast.error("Enter an end time");
      return;
    }
    if (!(Number(startTimeMs) < Number(endTimeMs))) {
      toast.error("Start time must be before end time");
      return;
    }
    if (Number(endTimeMs) < Date.now()) {
      toast.error("End time must be in the future");
      return;
    }

    const rewardCoinType = coin.coinType;

    const transaction = new Transaction();

    for (const side of Object.values(Side)) {
      for (const reserve of data.lendingMarket.reserves) {
        const reserveArrayIndex = reserve.arrayIndex;

        const rewardValue = new BigNumber(
          rewardsMap?.[reserve.coinType]?.[side] || 0,
        )
          .times(10 ** coin.mintDecimals)
          .toString();

        if (rewardValue !== "0") {
          await suilendClient.addReward(
            address,
            data.lendingMarketOwnerCapId,
            reserveArrayIndex,
            side === Side.DEPOSIT,
            rewardCoinType,
            rewardValue,
            BigInt(startTimeMs),
            BigInt(endTimeMs),
            transaction,
          );
        }
      }
    }

    try {
      await signExecuteAndWaitTransaction(transaction);

      toast.success("Added rewards");
      setIsDialogOpen(false);
      reset();
    } catch (err) {
      toast.error("Failed to add rewards", {
        description: (err as Error)?.message || "An unknown error occurred",
      });
    } finally {
      await refreshData();
    }
  };

  return (
    <Dialog
      rootProps={{ open: isDialogOpen, onOpenChange: setIsDialogOpen }}
      trigger={
        <Button
          className="w-fit"
          labelClassName="uppercase"
          startIcon={<Sparkle />}
          variant="secondary"
        >
          Add rewards
        </Button>
      }
      titleIcon={<Sparkle />}
      title="Add Rewards"
      footer={
        <div className="flex w-full flex-row items-center gap-2">
          <Button
            tooltip="Clear"
            icon={<Eraser />}
            variant="ghost"
            size="icon"
            onClick={reset}
          >
            Clear
          </Button>
          <Button
            className="flex-1"
            labelClassName="uppercase"
            size="lg"
            onClick={submit}
            disabled={!isEditable}
          >
            Add
          </Button>
        </div>
      }
    >
      <div className="grid w-full grid-cols-1 grid-cols-3 gap-x-4 gap-y-6">
        <CoinPopover
          coinBalancesMap={coinBalancesMap}
          index={coinIndex}
          onIndexChange={setCoinIndex}
        />
        <Input
          label="startTimeMs"
          id="startTimeMs"
          type="number"
          value={startTimeMs}
          onChange={setStartTimeMs}
          endDecorator="ms"
        />
        <Input
          label="endTimeMs"
          id="endTimeMs"
          type="number"
          value={endTimeMs}
          onChange={setEndTimeMs}
          endDecorator="ms"
        />

        {data.lendingMarket.reserves.map((reserve, index) => (
          <Fragment key={reserve.coinType}>
            <div
              className={cn(
                "flex flex-row items-center gap-2",
                index === 0 && "pt-6",
              )}
            >
              <TokenLogo
                className="h-4 w-4"
                token={{
                  coinType: reserve.coinType,
                  symbol: reserve.symbol,
                  iconUrl: reserve.iconUrl,
                }}
              />
              <TBody>{reserve.symbol}</TBody>
            </div>

            <Input
              label={index === 0 ? "depositRewards" : undefined}
              id={`depositRewards-${reserve.coinType}`}
              type="number"
              value={rewardsMap?.[reserve.coinType]?.deposit || ""}
              onChange={setRewardsValue(reserve.coinType, Side.DEPOSIT)}
              endDecorator={coin ? coin.symbol : undefined}
            />
            <Input
              label={index === 0 ? "borrowRewards" : undefined}
              id={`borrowRewards-${reserve.coinType}`}
              type="number"
              value={rewardsMap?.[reserve.coinType]?.borrow || ""}
              onChange={setRewardsValue(reserve.coinType, Side.BORROW)}
              endDecorator={coin ? coin.symbol : undefined}
            />
          </Fragment>
        ))}
      </div>
    </Dialog>
  );
}
