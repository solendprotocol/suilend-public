import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";

import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import { useActionsModalContext } from "@/components/dashboard/actions-modal/ActionsModalContext";
import DataTable, {
  decimalSortingFn,
  tableHeader,
} from "@/components/dashboard/DataTable";
import TokenIcon from "@/components/shared/TokenIcon";
import { TBody, TLabel } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { formatPrice, formatToken, formatUsd } from "@/lib/format";
import { sortInReserveOrder } from "@/lib/utils";

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
  const appContext = useAppContext();
  const data = appContext.data as AppData;
  const { open: openActionsModal } = useActionsModalContext();

  // Columns
  const columns: ColumnDef<RowData>[] = [
    {
      accessorKey: "symbol",
      sortingFn: "text",
      header: ({ column }) => tableHeader(column, "Asset name"),
      cell: ({ row }) => {
        const { coinType, price, symbol, iconUrl } = row.original;

        return (
          <div className="flex flex-row items-center gap-4">
            <TokenIcon coinType={coinType} symbol={symbol} url={iconUrl} />

            <div className="flex flex-col gap-1">
              <TBody>{symbol}</TBody>
              <TLabel>{formatPrice(price)}</TLabel>
            </div>
          </div>
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
  ];

  // Sort
  const sortedAssets = assets
    .slice()
    .sort(sortInReserveOrder(data.lendingMarket.reserves));

  return (
    <div className="w-full">
      <DataTable<RowData>
        columns={columns}
        data={sortedAssets}
        noDataMessage={noAssetsMessage}
        tableClassName="border-y-0"
        onRowClick={(row) => () =>
          openActionsModal(row.original.reserve.arrayIndex)
        }
      />
    </div>
  );
}
