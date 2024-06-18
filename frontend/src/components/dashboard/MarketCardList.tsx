import React, { useState } from "react";

import {
  ArrowDown01,
  ArrowDown10,
  ArrowDownAz,
  ArrowDownZa,
  ChevronsUpDown,
  X,
} from "lucide-react";

import { useActionsModalContext } from "@/components/dashboard/actions-modal/ActionsModalContext";
import Card from "@/components/dashboard/Card";
import AssetCell from "@/components/dashboard/market-table/AssetCell";
import BorrowAprCell from "@/components/dashboard/market-table/BorrowAprCell";
import DepositAprCell from "@/components/dashboard/market-table/DepositAprCell";
import OpenLtvBwCell from "@/components/dashboard/market-table/OpenLtvBwCell";
import TotalBorrowsCell from "@/components/dashboard/market-table/TotalBorrowsCell";
import TotalDepositsCell from "@/components/dashboard/market-table/TotalDepositsCell";
import { ReservesRowData } from "@/components/dashboard/MarketTable";
import Button from "@/components/shared/Button";
import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import Select from "@/components/shared/Select";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { SelectTrigger } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { OPEN_LTV_BORROW_WEIGHT_TOOLTIP } from "@/lib/tooltips";
import { cn } from "@/lib/utils";

interface MarketCardProps {
  rowData: ReservesRowData;
  onClick: () => void;
}

function MarketCard({ rowData, onClick }: MarketCardProps) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/10"
      onClick={onClick}
    >
      <div className="flex w-full flex-col items-center gap-2 p-4">
        <div className="mb-2 flex w-full flex-row justify-center">
          <AssetCell {...rowData} />
        </div>

        <div className="mb-2 flex w-full flex-row justify-around">
          <div className="flex w-fit flex-col items-center gap-1">
            <TLabelSans>Deposit APR</TLabelSans>
            <DepositAprCell {...rowData} />
          </div>

          <div className="flex w-fit flex-col items-center gap-1">
            <TLabelSans>Borrow APR</TLabelSans>
            <BorrowAprCell {...rowData} />
          </div>
        </div>

        <div className="flex w-full flex-row items-center justify-between">
          <LabelWithTooltip tooltip={OPEN_LTV_BORROW_WEIGHT_TOOLTIP}>
            LTV / BW
          </LabelWithTooltip>

          <OpenLtvBwCell {...rowData} />
        </div>

        <div className="flex w-full flex-row items-center justify-between">
          <TLabelSans>Deposits</TLabelSans>
          <TotalDepositsCell {...rowData} horizontal />
        </div>

        <div className="flex w-full flex-row items-center justify-between">
          <TLabelSans>Borrows</TLabelSans>
          <TotalBorrowsCell {...rowData} horizontal />
        </div>
      </div>
    </Card>
  );
}

interface MarketCardListProps {
  data: ReservesRowData[];
  noDataMessage: string;
}

export default function MarketCardList({
  data,
  noDataMessage,
}: MarketCardListProps) {
  const { open: openActionsModal } = useActionsModalContext();

  // Sort
  enum SortOption {
    ASSET_NAME_ASC = "assetNameAsc",
    ASSET_NAME_DESC = "assetNameDesc",

    DEPOSIT_APR_ASC = "depositAprAsc",
    DEPOSIT_APR_DESC = "depositAprDesc",

    BORROW_APR_ASC = "borrowAprAsc",
    BORROW_APR_DESC = "borrowAprDesc",

    DEPOSITED_AMOUNT_ASC = "depositedAmountAsc",
    DEPOSITED_AMOUNT_DESC = "depositedAmountDesc",

    BORROWED_AMOUNT_ASC = "borrowedAmountAsc",
    BORROWED_AMOUNT_DESC = "borrowedAmountDesc",
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

    [SortOption.DEPOSITED_AMOUNT_ASC]: {
      icon: ArrowDown01,
      name: "Deposits (asc)",
    },
    [SortOption.DEPOSITED_AMOUNT_DESC]: {
      icon: ArrowDown10,
      name: "Deposits (desc)",
    },

    [SortOption.BORROWED_AMOUNT_ASC]: {
      icon: ArrowDown01,
      name: "Borrows (asc)",
    },
    [SortOption.BORROWED_AMOUNT_DESC]: {
      icon: ArrowDown10,
      name: "Borrows (desc)",
    },
  };

  const [isSortByOpen, setIsSortByOpen] = useState<boolean>(false);
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

        if (sortBy === SortOption.DEPOSITED_AMOUNT_ASC)
          return a.depositedAmountUsd.lt(b.depositedAmountUsd) ? -1 : 1;
        if (sortBy === SortOption.DEPOSITED_AMOUNT_DESC)
          return b.depositedAmountUsd.lt(a.depositedAmountUsd) ? -1 : 1;

        if (sortBy === SortOption.BORROWED_AMOUNT_ASC)
          return a.borrowedAmountUsd.lt(b.borrowedAmountUsd) ? -1 : 1;
        if (sortBy === SortOption.BORROWED_AMOUNT_DESC)
          return b.borrowedAmountUsd.lt(a.borrowedAmountUsd) ? -1 : 1;
        return 0;
      });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between gap-2">
        <TBody className="uppercase text-foreground">All assets</TBody>

        <div className="flex h-5 flex-row items-center gap-1">
          <Select
            rootProps={{ open: isSortByOpen, onOpenChange: setIsSortByOpen }}
            trigger={
              <SelectTrigger
                className={cn(
                  "h-8 w-fit gap-1 border-none bg-transparent p-0 font-sans text-muted-foreground ring-offset-transparent transition-colors hover:text-foreground focus:ring-transparent",
                  isSortByOpen && "text-foreground",
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
        <div className="flex w-full flex-col gap-2">
          {sortedData.map((rowData) => (
            <MarketCard
              key={rowData.coinType}
              rowData={rowData}
              onClick={() =>
                openActionsModal(Number(rowData.reserve.arrayIndex))
              }
            />
          ))}
        </div>
      ) : (
        <TLabelSans text-center>{noDataMessage}</TLabelSans>
      )}
    </div>
  );
}
