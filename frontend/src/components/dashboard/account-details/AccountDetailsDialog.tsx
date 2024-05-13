import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

import { normalizeStructTag } from "@mysten/sui.js/utils";
import BigNumber from "bignumber.js";
import { FileClock, HandCoins, RotateCw, TableProperties } from "lucide-react";

import { WAD } from "@suilend/sdk/constants";

import EarningsTabContent from "@/components/dashboard/account-details/EarningsTabContent";
import HistoryTabContent from "@/components/dashboard/account-details/HistoryTabContent";
import Dialog from "@/components/dashboard/Dialog";
import ObligationSwitcherPopover from "@/components/dashboard/ObligationSwitcherPopover";
import Button from "@/components/shared/Button";
import Tabs from "@/components/shared/Tabs";
import TokenLogo from "@/components/shared/TokenLogo";
import Tooltip from "@/components/shared/Tooltip";
import { TBody } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { isSuilendPoints } from "@/lib/coinType";
import {
  BorrowEvent,
  ClaimRewardEvent,
  DepositEvent,
  EventType,
  LiquidateEvent,
  RepayEvent,
  ReserveAssetDataEvent,
  WithdrawEvent,
  eventSortAsc,
  eventSortDesc,
} from "@/lib/events";
import { formatPoints, formatToken } from "@/lib/format";
import { API_URL } from "@/lib/navigation";

export const getCtokenExchangeRate = (event: ReserveAssetDataEvent) =>
  new BigNumber(new BigNumber(event.supplyAmount).div(WAD.toString())).div(
    event.ctokenSupply,
  );

export type EventsData = {
  reserveAssetData: ReserveAssetDataEvent[];

  deposit: DepositEvent[];
  borrow: BorrowEvent[];
  withdraw: WithdrawEvent[];
  repay: RepayEvent[];
  liquidate: LiquidateEvent[];
  claimReward: ClaimRewardEvent[];
};

interface TokenAmountProps {
  amount?: BigNumber;
  coinType: string;
  symbol: string;
  src?: string | null;
  decimals: number;
}

export function TokenAmount({
  amount,
  coinType,
  symbol,
  src,
  decimals,
}: TokenAmountProps) {
  return (
    <div className="flex w-max flex-row items-center gap-2">
      <TokenLogo
        className="h-4 w-4"
        coinType={coinType}
        symbol={symbol}
        src={src}
      />

      <Tooltip
        title={
          amount !== undefined && isSuilendPoints(coinType) ? (
            <>
              {formatPoints(amount, { dp: decimals })} {symbol}
            </>
          ) : undefined
        }
      >
        <TBody className="uppercase">
          {amount === undefined
            ? "N/A"
            : isSuilendPoints(coinType)
              ? formatPoints(amount)
              : formatToken(amount, { dp: decimals })}{" "}
          {symbol}
        </TBody>
      </Tooltip>
    </div>
  );
}

export default function AccountDetailsDialog() {
  const router = useRouter();
  const accountDetailsTab = router.query.accountDetailsTab as
    | string
    | undefined;
  const { refreshData, obligation, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  // Tabs
  enum Tab {
    HISTORY = "history",
    EARNINGS = "earnings",
  }

  const tabs = [
    { id: Tab.HISTORY, icon: <FileClock />, title: "History" },
    { id: Tab.EARNINGS, icon: <HandCoins />, title: "Earnings" },
  ];

  const selectedTab =
    accountDetailsTab && Object.values(Tab).includes(accountDetailsTab as Tab)
      ? (accountDetailsTab as Tab)
      : Object.values(Tab)[0];
  const onSelectedTabChange = (tab: Tab) => {
    router.push({ query: { ...router.query, accountDetailsTab: tab } });
  };

  // Events
  const [eventsData, setEventsData] = useState<EventsData | undefined>(
    undefined,
  );

  const clearEventsData = useCallback(() => {
    setEventsData(undefined);
  }, []);

  const fetchEventsData = useCallback(
    async (_obligationId?: string) => {
      const obligationId = _obligationId ?? obligation?.id;
      if (!obligationId) return;

      clearEventsData();

      try {
        const url1 = `${API_URL}/events?${new URLSearchParams({
          eventTypes: [
            EventType.DEPOSIT,
            EventType.WITHDRAW,
            EventType.LIQUIDATE,
          ].join(","),
          obligationId,
          joinEventTypes: EventType.RESERVE_ASSET_DATA,
        })}`;
        const res1 = await fetch(url1);
        const json1 = await res1.json();

        const url2 = `${API_URL}/events?${new URLSearchParams({
          eventTypes: [
            EventType.BORROW,
            EventType.REPAY,
            EventType.CLAIM_REWARD,
          ].join(","),
          obligationId,
        })}`;
        const res2 = await fetch(url2);
        const json2 = await res2.json();

        // Parse
        const data = { ...json1, ...json2 } as EventsData;
        for (const event of [
          ...data.deposit,
          ...data.borrow,
          ...data.withdraw,
          ...data.repay,
          ...data.claimReward,
        ]) {
          event.coinType = normalizeStructTag(event.coinType);
        }

        setEventsData({
          reserveAssetData: (data.reserveAssetData ?? [])
            .slice()
            .sort(eventSortAsc),

          deposit: (data.deposit ?? []).slice().sort(eventSortDesc),
          borrow: (data.borrow ?? []).slice().sort(eventSortDesc),
          withdraw: (data.withdraw ?? []).slice().sort(eventSortDesc),
          repay: (data.repay ?? []).slice().sort(eventSortDesc),
          liquidate: (data.liquidate ?? []).slice().sort(eventSortDesc),
          claimReward: (data.claimReward ?? []).slice().sort(eventSortDesc),
        });
      } catch (err) {
        console.error(err);
      }
    },
    [obligation?.id, clearEventsData],
  );

  // Refresh
  const refresh = () => {
    if (selectedTab === Tab.EARNINGS) refreshData();
    fetchEventsData();
  };

  // State
  const isOpen = router.query.accountDetails !== undefined;

  const onOpenChange = (_isOpen: boolean) => {
    const { accountDetails, accountDetailsTab, ...restQuery } = router.query;

    router.push({
      query: _isOpen ? { ...restQuery, accountDetails: true } : restQuery,
    });
  };

  const isFetchingRef = useRef<boolean>(false);
  useEffect(() => {
    if (isOpen) {
      if (isFetchingRef.current) return;

      fetchEventsData();
      isFetchingRef.current = true;
    } else {
      clearEventsData();
      isFetchingRef.current = false;
    }
  }, [isOpen, fetchEventsData, clearEventsData]);

  if (!obligation) return null;
  return (
    <Dialog
      rootProps={{ open: isOpen, onOpenChange }}
      trigger={
        <Button
          className="text-muted-foreground"
          tooltip="View account details (history, earnings)"
          icon={<TableProperties />}
          size="icon"
          variant="ghost"
        >
          View account details (history, earnings)
        </Button>
      }
      headerClassName="border-b-0"
      titleIcon={<TableProperties />}
      title="Account"
      headerEndContent={
        <>
          {data.obligations && data.obligations.length > 1 && (
            <ObligationSwitcherPopover onSelect={refresh} />
          )}

          <Button
            className="text-muted-foreground"
            tooltip="Refresh"
            icon={<RotateCw />}
            variant="ghost"
            size="icon"
            onClick={refresh}
          >
            Refresh
          </Button>
        </>
      }
    >
      <div className="px-4">
        <Tabs
          tabs={tabs}
          selectedTab={selectedTab}
          onTabChange={(tab) => onSelectedTabChange(tab as Tab)}
        />
      </div>
      {![Tab.EARNINGS].includes(selectedTab) && <Separator />}

      {selectedTab === Tab.HISTORY && (
        <HistoryTabContent eventsData={eventsData} />
      )}
      {selectedTab === Tab.EARNINGS && (
        <EarningsTabContent eventsData={eventsData} />
      )}
    </Dialog>
  );
}
