import React, { Fragment, FunctionComponent, ReactNode, useState } from "react";

import {
  ArrowDown01,
  ArrowDown10,
  ArrowDownAz,
  ArrowDownZa,
  ChevronsUpDown,
  X,
} from "lucide-react";

import BorrowAprCell from "@/components/dashboard/market-table/BorrowAprCell";
import DepositAprCell from "@/components/dashboard/market-table/DepositAprCell";
import { ReservesRowData } from "@/components/dashboard/market-table/MarketTable";
import OpenLtvBwCell from "@/components/dashboard/market-table/OpenLtvBwCell";
import TotalBorrowsCell from "@/components/dashboard/market-table/TotalBorrowsCell";
import TotalDepositsCell from "@/components/dashboard/market-table/TotalDepositsCell";
import Button from "@/components/shared/Button";
import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import Select from "@/components/shared/Select";
import TokenIcon from "@/components/shared/TokenIcon";
import { TBody, TLabel, TLabelSans } from "@/components/shared/Typography";
import { Card } from "@/components/ui/card";
import { SelectTrigger } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { OPEN_LTV_BW_TOOLTIP } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  rowData: ReservesRowData;
}

function MarketCard({ rowData }: MarketCardProps) {
  return (
    <Card className="w-full cursor-pointer rounded-md">
      <div className="flex w-full flex-col items-center gap-4 p-4">
        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex flex-row items-center gap-2">
            <TokenIcon
              coinType={rowData.coinType}
              symbol={rowData.symbol}
              url={rowData.iconUrl}
            />
            <TBody>{rowData.symbol}</TBody>
          </div>
          <TLabel>{formatPrice(rowData.price)}</TLabel>
        </div>

        <div className="flex w-full flex-row justify-center gap-6">
          <div className="flex w-fit flex-col items-center gap-1">
            <TLabel className="uppercase">Deposit APR</TLabel>
            <DepositAprCell {...rowData} />
          </div>

          <div className="flex w-fit flex-col items-center gap-1">
            <TLabel className="uppercase">Borrow APR</TLabel>
            <BorrowAprCell {...rowData} />
          </div>
        </div>

        <div className="flex w-full flex-row items-center justify-between">
          <LabelWithTooltip
            className="uppercase"
            tooltip={OPEN_LTV_BW_TOOLTIP}
            isMono
          >
            LTV / BW
          </LabelWithTooltip>

          <OpenLtvBwCell {...rowData} />
        </div>

        <div className="flex w-full flex-row items-center justify-between">
          <TLabel className="uppercase">Total deposits</TLabel>
          <TotalDepositsCell {...rowData} horizontal />
        </div>

        <div className="flex w-full flex-row items-center justify-between">
          <TLabel className="uppercase">Total borrows</TLabel>
          <TotalBorrowsCell {...rowData} horizontal />
        </div>
      </div>
    </Card>
  );
}

interface MarketCardListProps {
  data: ReservesRowData[];
  noDataMessage: string;
  RowModal?: FunctionComponent<{
    row: ReservesRowData;
    children: ReactNode;
  }>;
}

export default function MarketCardList({
  data,
  noDataMessage,
  RowModal,
}: MarketCardListProps) {
  // Sort
  enum SortOption {
    ASSET_NAME_ASC = "assetNameAsc",
    ASSET_NAME_DESC = "assetNameDesc",

    DEPOSIT_APR_ASC = "depositAprAsc",
    DEPOSIT_APR_DESC = "depositAprDesc",

    BORROW_APR_ASC = "borrowAprAsc",
    BORROW_APR_DESC = "borrowAprDesc",

    TOTAL_DEPOSITS_ASC = "totalDepositsAsc",
    TOTAL_DEPOSITS_DESC = "totalDepositsDesc",

    TOTAL_BORROWS_ASC = "totalBorrowsAsc",
    TOTAL_BORROWS_DESC = "totalBorrowsDesc",
  }

  const sortOptions = {
    [SortOption.ASSET_NAME_ASC]: {
      icon: ArrowDownAz,
      name: "Asset name (asc)",
    },
    [SortOption.ASSET_NAME_DESC]: {
      icon: ArrowDownZa,
      name: "Asset name (desc)",
    },

    [SortOption.DEPOSIT_APR_ASC]: {
      icon: ArrowDown01,
      name: "Deposit APR (asc)",
    },
    [SortOption.DEPOSIT_APR_DESC]: {
      icon: ArrowDown10,
      name: "Deposit APR (desc)",
    },

    [SortOption.BORROW_APR_ASC]: {
      icon: ArrowDown01,
      name: "Borrow APR (asc)",
    },
    [SortOption.BORROW_APR_DESC]: {
      icon: ArrowDown10,
      name: "Borrow APR (desc)",
    },

    [SortOption.TOTAL_DEPOSITS_ASC]: {
      icon: ArrowDown01,
      name: "Total deposits (asc)",
    },
    [SortOption.TOTAL_DEPOSITS_DESC]: {
      icon: ArrowDown10,
      name: "Total deposits (desc)",
    },

    [SortOption.TOTAL_BORROWS_ASC]: {
      icon: ArrowDown01,
      name: "Total borrows (asc)",
    },
    [SortOption.TOTAL_BORROWS_DESC]: {
      icon: ArrowDown10,
      name: "Total borrows (desc)",
    },
  };

  const [sortBy, setSortBy] = useState<SortOption | undefined>(undefined);
  const onSortChange = (value: string) => setSortBy(value as SortOption);

  const SortByIcon = !sortBy ? ChevronsUpDown : sortOptions[sortBy].icon;

  const sortedData = !sortBy
    ? data
    : data.slice().sort((a, b) => {
        if (sortBy === SortOption.ASSET_NAME_ASC)
          return a.symbol < b.symbol ? -1 : 1;
        if (sortBy === SortOption.ASSET_NAME_DESC)
          return b.symbol < a.symbol ? -1 : 1;

        if (sortBy === SortOption.DEPOSIT_APR_ASC)
          return a.totalDepositAprPercent.lt(b.totalDepositAprPercent) ? -1 : 1;
        if (sortBy === SortOption.DEPOSIT_APR_DESC)
          return b.totalDepositAprPercent.lt(a.totalDepositAprPercent) ? -1 : 1;

        if (sortBy === SortOption.BORROW_APR_ASC)
          return a.totalBorrowAprPercent.lt(b.totalBorrowAprPercent) ? -1 : 1;
        if (sortBy === SortOption.BORROW_APR_DESC)
          return b.totalBorrowAprPercent.lt(a.totalBorrowAprPercent) ? -1 : 1;

        if (sortBy === SortOption.TOTAL_DEPOSITS_ASC)
          return a.totalDepositsUsd.lt(b.totalDepositsUsd) ? -1 : 1;
        if (sortBy === SortOption.TOTAL_DEPOSITS_DESC)
          return b.totalDepositsUsd.lt(a.totalDepositsUsd) ? -1 : 1;

        if (sortBy === SortOption.TOTAL_BORROWS_ASC)
          return a.totalBorrowsUsd.lt(b.totalBorrowsUsd) ? -1 : 1;
        if (sortBy === SortOption.TOTAL_BORROWS_DESC)
          return b.totalBorrowsUsd.lt(a.totalBorrowsUsd) ? -1 : 1;
        return 0;
      });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-2">
        <TBody className="uppercase text-foreground">All assets</TBody>

        <div className="flex h-5 flex-row items-center gap-1">
          <Select
            trigger={
              <SelectTrigger
                className={cn(
                  "h-8 w-fit gap-1 border-none p-0 uppercase text-muted-foreground ring-offset-transparent transition-colors hover:text-foreground focus:ring-transparent",
                  sortBy && "!text-primary-foreground",
                )}
                icon={<SortByIcon className="h-3 w-3" />}
              >
                {!sortBy
                  ? "Sort by"
                  : sortOptions[sortBy].name.substring(
                      0,
                      sortOptions[sortBy].name.indexOf("("),
                    )}
              </SelectTrigger>
            }
            items={Object.entries(sortOptions).map(([key, value]) => ({
              id: key,
              name: value.name,
            }))}
            selectedItemId={sortBy}
            setValue={onSortChange}
            title="Sort by"
          />

          {sortBy && (
            <Button
              icon={<X />}
              variant="ghost"
              size="icon"
              onClick={() => setSortBy(undefined)}
            >
              Clear sort
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {sortedData.length > 0 ? (
        <div className="flex w-full flex-col gap-4">
          {sortedData.map((rowData) => (
            <Fragment key={rowData.coinType}>
              {RowModal ? (
                <RowModal row={rowData}>
                  <div>
                    <MarketCard rowData={rowData} />
                  </div>
                </RowModal>
              ) : (
                <MarketCard rowData={rowData} />
              )}
            </Fragment>
          ))}
        </div>
      ) : (
        <TLabelSans text-center>{noDataMessage}</TLabelSans>
      )}
    </div>
  );
}
