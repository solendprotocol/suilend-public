import { useMemo } from "react";

import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import { reserveSort } from "@suilend/sdk/utils";

import { useActionsModalContext } from "@/components/dashboard/actions-modal/ActionsModalContext";
import DataTable, {
  decimalSortingFn,
  tableHeader,
} from "@/components/dashboard/DataTable";
import AssetCell from "@/components/dashboard/market-table/AssetCell";
import { TBody, TLabel } from "@/components/shared/Typography";
import { formatToken, formatUsd } from "@/lib/format";

interface RowData {
  coinType: string;
  mintDecimals: number;
  price: BigNumber;
  symbol: string;
  iconUrl?: string | null;
  amount: BigNumber;
  amountUsd: BigNumber;
  reserve: ParsedReserve;
}

interface AccountAssetTableProps {
  amountTitle?: string;
  assets: RowData[];
  noAssetsMessage: string;
}

export default function AccountAssetTable({
  amountTitle = "Amount",
  assets,
  noAssetsMessage,
}: AccountAssetTableProps) {
  const { open: openActionsModal } = useActionsModalContext();

  // Columns
  const columns: ColumnDef<RowData>[] = useMemo(
    () => [
      {
        accessorKey: "symbol",
        sortingFn: "text",
        header: ({ column }) => tableHeader(column, "Asset name"),
        cell: ({ row }) => {
          const { coinType, price, symbol, iconUrl } = row.original;

          return (
            <AssetCell
              coinType={coinType}
              price={price}
              symbol={symbol}
              iconUrl={iconUrl}
            />
          );
        },
      },
      {
        accessorKey: "amount",
        sortingFn: decimalSortingFn("amount"),
        header: ({ column }) =>
          tableHeader(column, amountTitle, { isNumerical: true }),
        cell: ({ row }) => {
          const { mintDecimals, amount, amountUsd } = row.original;

          return (
            <div className="flex flex-col items-end gap-1">
              <TBody className="text-right">
                {formatToken(amount, { dp: mintDecimals })}
              </TBody>
              <TLabel className="text-right">{formatUsd(amountUsd)}</TLabel>
            </div>
          );
        },
      },
    ],
    [amountTitle],
  );

  // Sort
  const sortedAssets = assets
    .slice()
    .sort((a, b) => reserveSort(a.reserve, b.reserve));

  return (
    <div className="w-full">
      <DataTable<RowData>
        columns={columns}
        data={sortedAssets}
        noDataMessage={noAssetsMessage}
        tableClassName="border-y-0"
        onRowClick={(row) => () =>
          openActionsModal(Number(row.original.reserve.arrayIndex))
        }
      />
    </div>
  );
}
