import { Fragment, PropsWithChildren } from "react";

import BigNumber from "bignumber.js";

import { SuilendClient } from "@suilend/sdk/client";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import { useActionsModalContext } from "@/components/dashboard/actions-modal/ActionsModalContext";
import AprLineChart from "@/components/shared/AprLineChart";
import Button from "@/components/shared/Button";
import LabelWithValue from "@/components/shared/LabelWithValue";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/contexts/AppContext";
import { formatLtv, formatPercent, formatToken, formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export enum Panel {
  LIMITS = "limits",
  RATES = "rates",
  OBJECTS = "objects",
}

interface PanelProps {
  reserve: ParsedReserve;
}

function ObjectsPanel({ reserve }: PanelProps) {
  const { explorer, obligation, ...restAppContext } = useAppContext();
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;

  return (
    <>
      <LabelWithValue
        label="Coin"
        value={reserve.coinType}
        url={explorer.buildCoinUrl(reserve.coinType)}
        isType
        horizontal
      />
      <LabelWithValue
        label="Lending market"
        value={suilendClient.lendingMarket.id}
        url={explorer.buildObjectUrl(suilendClient.lendingMarket.id)}
        isId
        horizontal
      />
      <LabelWithValue label="Reserve ID" value={reserve.id} isId horizontal />
      <LabelWithValue
        label="Price ID"
        value={reserve.priceIdentifier}
        isId
        horizontal
      />
      {obligation?.id && (
        <LabelWithValue
          label="Obligation"
          value={obligation.id}
          url={explorer.buildObjectUrl(obligation.id)}
          isId
          horizontal
        />
      )}
    </>
  );
}

function LimitsPanel({ reserve }: PanelProps) {
  return (
    <>
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
        value={formatLtv(new BigNumber(reserve.config.openLtvPct))}
        horizontal
      />
      <LabelWithValue
        label="Close LTV"
        value={formatLtv(new BigNumber(reserve.config.closeLtvPct))}
        horizontal
      />
      <LabelWithValue
        label="Max close LTV"
        value={formatLtv(new BigNumber(reserve.config.maxCloseLtvPct))}
        horizontal
      />
      <LabelWithValue
        label="Borrow weight"
        value={reserve.config.borrowWeightBps / 10000}
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

function RatesPanel({ reserve }: PanelProps) {
  return (
    <>
      <LabelWithValue
        label="Current asset utilization"
        value={formatPercent(reserve.utilizationPercent)}
        horizontal
      />
      <LabelWithValue
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
            label={`Borrow APR at threshold ${index + 1}`}
            value={formatPercent(new BigNumber(rate.aprPercent))}
            horizontal
          />
        </Fragment>
      ))}
    </>
  );
}

interface PanelButtonProps extends PropsWithChildren {
  isActive: boolean;
  onClick: () => void;
}

function PanelButton({ isActive, onClick, children }: PanelButtonProps) {
  return (
    <Button
      className={cn(
        "h-7 flex-1 py-0 uppercase",
        isActive && "border-secondary bg-secondary/5 text-primary-foreground",
      )}
      labelClassName="text-xs"
      variant="secondaryOutline"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

interface ParametersPanelProps {
  reserve: ParsedReserve;
}

export default function ParametersPanel({ reserve }: ParametersPanelProps) {
  const { activePanel, setActivePanel } = useActionsModalContext();

  return (
    <>
      <div className="flex flex-row gap-2">
        <PanelButton
          isActive={activePanel === Panel.LIMITS}
          onClick={() => setActivePanel(Panel.LIMITS)}
        >
          Limits
        </PanelButton>
        <PanelButton
          isActive={activePanel === Panel.RATES}
          onClick={() => setActivePanel(Panel.RATES)}
        >
          Rates
        </PanelButton>

        <PanelButton
          isActive={activePanel === Panel.OBJECTS}
          onClick={() => setActivePanel(Panel.OBJECTS)}
        >
          Objects
        </PanelButton>
      </div>
      <div className="flex flex-col gap-3 md:-m-4 md:h-[218px] md:overflow-y-auto md:p-4">
        {activePanel === Panel.LIMITS && <LimitsPanel reserve={reserve} />}
        {activePanel === Panel.RATES && <RatesPanel reserve={reserve} />}
        {activePanel === Panel.OBJECTS && <ObjectsPanel reserve={reserve} />}
      </div>

      <Separator className="hidden md:block" />

      <div className="h-[200px] min-h-[200px]">
        <AprLineChart
          id="apr-chart"
          data={reserve.config.interestRate
            .slice()
            .sort((a, b) => Number(a.utilPercent) - Number(b.utilPercent))
            .map((row) => ({
              x: +row.utilPercent,
              y: Number(row.aprPercent),
            }))}
          reference={{
            x: reserve.utilizationPercent.toNumber(),
            y: reserve.borrowAprPercent.toNumber(),
          }}
          yAxisLabel="Borrow APR"
        />
      </div>
    </>
  );
}
