import { Fragment, PropsWithChildren } from "react";

import BigNumber from "bignumber.js";
import { capitalize } from "lodash";

import { SuilendClient } from "@suilend/sdk/client";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { Side } from "@suilend/sdk/types";

import { useActionsModalContext } from "@/components/dashboard/actions-modal/ActionsModalContext";
import HistoricalAprLineChart from "@/components/dashboard/actions-modal/HistoricalAprLineChart";
import PythLogo from "@/components/dashboard/actions-modal/PythLogo";
import AprLineChart from "@/components/shared/AprLineChart";
import Button from "@/components/shared/Button";
import LabelWithValue from "@/components/shared/LabelWithValue";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/contexts/AppContext";
import {
  formatBorrowWeight,
  formatLtvPercent,
  formatPercent,
  formatToken,
  formatUsd,
} from "@/lib/format";
import { PYTH_PRICE_ID_SYMBOL_MAP, getPythOracleUrl } from "@/lib/pyth";
import {
  BORROW_WEIGHT_TOOLTIP,
  CLOSE_LTV_TOOLTIP,
  OPEN_LTV_TOOLTIP,
} from "@/lib/tooltips";
import { cn } from "@/lib/utils";

export enum ParametersPanelTab {
  ADVANCED = "advanced",
  RATES = "rates",
  OBJECTS = "objects",
}

interface TabContentProps {
  side: Side;
  reserve: ParsedReserve;
}

function AdvancedTabContent({ side, reserve }: TabContentProps) {
  return (
    <>
      <div className="mb-1 flex w-full flex-col gap-4">
        <HistoricalAprLineChart reserve={reserve} side={side} />
        <Separator />
      </div>

      <LabelWithValue
        label="Deposit limit"
        value={`${formatToken(reserve.config.depositLimit, { dp: 0 })} ${reserve.symbol}`}
        horizontal
      />
      <LabelWithValue
        label="Deposit limit (USD)"
        value={formatUsd(reserve.config.depositLimitUsd, {
          dp: 0,
          exact: true,
        })}
        horizontal
      />
      <LabelWithValue
        label="Borrow limit"
        value={`${formatToken(reserve.config.borrowLimit, { dp: 0 })} ${reserve.symbol}`}
        horizontal
      />
      <LabelWithValue
        label="Borrow limit (USD)"
        value={formatUsd(reserve.config.borrowLimitUsd, {
          dp: 0,
          exact: true,
        })}
        horizontal
      />
      <LabelWithValue
        label="Open LTV"
        labelTooltip={OPEN_LTV_TOOLTIP}
        value={formatLtvPercent(new BigNumber(reserve.config.openLtvPct))}
        horizontal
      />
      <LabelWithValue
        label="Close LTV"
        labelTooltip={CLOSE_LTV_TOOLTIP}
        value={formatLtvPercent(new BigNumber(reserve.config.closeLtvPct))}
        horizontal
      />
      <LabelWithValue
        label="Max close LTV"
        value={formatLtvPercent(new BigNumber(reserve.config.maxCloseLtvPct))}
        horizontal
      />
      <LabelWithValue
        label="Borrow weight"
        labelTooltip={BORROW_WEIGHT_TOOLTIP}
        value={formatBorrowWeight(
          new BigNumber(reserve.config.borrowWeightBps / 10000),
        )}
        horizontal
      />
      <LabelWithValue
        label="Open attributed borrow limit (USD)"
        value={formatUsd(
          new BigNumber(reserve.config.openAttributedBorrowLimitUsd),
        )}
        horizontal
      />
      <LabelWithValue
        label="Close attributed borrow limit (USD)"
        value={formatUsd(
          new BigNumber(reserve.config.closeAttributedBorrowLimitUsd),
        )}
        horizontal
      />
      <LabelWithValue
        label="Liquidation penalty"
        value={formatPercent(
          new BigNumber(reserve.config.liquidationBonusBps / 100),
        )}
        horizontal
      />
      <LabelWithValue
        label="Max liquidation penalty"
        value={formatPercent(
          new BigNumber(reserve.config.maxLiquidationBonusBps / 100),
        )}
        horizontal
      />
      <LabelWithValue
        label="Protocol liquidation fee"
        value={formatPercent(
          new BigNumber(reserve.config.protocolLiquidationFeeBps / 100),
        )}
        horizontal
      />
      <LabelWithValue
        label="Borrow fee"
        value={formatPercent(new BigNumber(reserve.config.borrowFeeBps / 100))}
        horizontal
      />
      <LabelWithValue
        label="Interest rate spread"
        value={formatPercent(new BigNumber(reserve.config.spreadFeeBps / 100))}
        horizontal
      />
      <LabelWithValue
        label="Isolated"
        value={reserve.config.isolated ? "Yes" : "No"}
        horizontal
      />
    </>
  );
}

function RatesTabContent({ side, reserve }: TabContentProps) {
  return (
    <>
      <div className="mb-1 flex w-full flex-col gap-4">
        <AprLineChart
          data={reserve.config.interestRate
            .slice()
            .sort((a, b) => +a.utilPercent - +b.utilPercent)
            .map((row) => ({
              utilPercent: +row.utilPercent,
              aprPercent: +row.aprPercent,
            }))}
          reference={{
            utilPercent: +reserve.utilizationPercent,
            aprPercent: +reserve.borrowAprPercent,
          }}
        />
        <Separator />
      </div>

      <LabelWithValue
        label="Current utilization"
        value={formatPercent(reserve.utilizationPercent)}
        horizontal
      />
      <LabelWithValue
        className="-mt-1.5"
        label="Current borrow APR"
        value={formatPercent(reserve.borrowAprPercent)}
        horizontal
      />
      {reserve.config.interestRate.map((rate, index) => (
        <Fragment key={index}>
          <LabelWithValue
            label={`Utilization threshold ${index + 1}`}
            value={formatPercent(new BigNumber(rate.utilPercent))}
            horizontal
          />
          <LabelWithValue
            className="-mt-1.5"
            label={`Borrow APR at ${formatPercent(new BigNumber(rate.utilPercent))} util.`}
            value={formatPercent(new BigNumber(rate.aprPercent))}
            horizontal
          />
        </Fragment>
      ))}
    </>
  );
}

function ObjectsTabContent({ side, reserve }: TabContentProps) {
  const { explorer, obligation, ...restAppContext } = useAppContext();
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;

  const pythOracleUrl = getPythOracleUrl(reserve.priceIdentifier);

  return (
    <>
      <LabelWithValue
        label="Coin"
        value={reserve.coinType}
        isType
        url={explorer.buildCoinUrl(reserve.coinType)}
        isExplorerUrl
        horizontal
      />
      <LabelWithValue
        label="Lending market"
        value={suilendClient.lendingMarket.id}
        isId
        url={explorer.buildObjectUrl(suilendClient.lendingMarket.id)}
        isExplorerUrl
        horizontal
      />
      <LabelWithValue label="Reserve ID" value={reserve.id} isId horizontal />
      {pythOracleUrl && (
        <LabelWithValue
          label="Oracle"
          value={PYTH_PRICE_ID_SYMBOL_MAP[reserve.priceIdentifier]}
          valueEndDecorator={<PythLogo className="my-0.5" />}
          url={pythOracleUrl}
          urlTooltip="View price feed"
          horizontal
        />
      )}
      <LabelWithValue
        label="Price ID"
        value={reserve.priceIdentifier}
        valueEndDecorator={<PythLogo className="my-0.5" />}
        isId
        horizontal
      />
      {obligation?.id && (
        <LabelWithValue
          label="Obligation"
          value={obligation.id}
          isId
          url={explorer.buildObjectUrl(obligation.id)}
          isExplorerUrl
          horizontal
        />
      )}
    </>
  );
}

interface TabButtonProps extends PropsWithChildren {
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ isActive, onClick, children }: TabButtonProps) {
  return (
    <Button
      className={cn(
        "h-7 flex-1 py-0 uppercase",
        isActive && "border border-secondary disabled:opacity-100",
      )}
      labelClassName="text-xs"
      variant={isActive ? "secondary" : "secondaryOutline"}
      onClick={onClick}
      disabled={isActive}
    >
      {children}
    </Button>
  );
}

interface ParametersTabContentProps {
  side: Side;
  reserve: ParsedReserve;
}

export default function ParametersPanel({
  side,
  reserve,
}: ParametersTabContentProps) {
  const { selectedParametersPanelTab, onSelectedParametersPanelTabChange } =
    useActionsModalContext();

  const TabContent = {
    [ParametersPanelTab.ADVANCED]: AdvancedTabContent,
    [ParametersPanelTab.RATES]: RatesTabContent,
    [ParametersPanelTab.OBJECTS]: ObjectsTabContent,
  }[selectedParametersPanelTab];

  return (
    <>
      <div className="flex flex-row gap-2">
        {Object.values(ParametersPanelTab).map((tab) => (
          <TabButton
            key={tab}
            isActive={selectedParametersPanelTab === tab}
            onClick={() => onSelectedParametersPanelTabChange(tab)}
          >
            {capitalize(tab)}
          </TabButton>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:-m-4 md:overflow-y-auto md:p-4">
        <TabContent side={side} reserve={reserve} />
      </div>
    </>
  );
}
