import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import { Star } from "lucide-react";

import DataTable, { tableHeader } from "@/components/dashboard/DataTable";
import PointsIcon from "@/components/points/PointsIcon";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import Tooltip from "@/components/shared/Tooltip";
import { TBody } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatAddress, formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RowData {
  rank: number;
  address: string;
  pointsPerDay: number;
  totalPoints: number;
}

export default function PointsLeaderboardTable() {
  const { address } = useWalletContext();
  const { explorer } = useAppContext();

  // Columns
  const columns: ColumnDef<RowData>[] = [
    {
      accessorKey: "rank",
      enableSorting: false,
      header: ({ column }) => tableHeader(column, "Rank"),
      cell: ({ row }) => {
        const { rank } = row.original;

        return (
          <TBody
            className={cn(
              "flex flex-row items-center gap-1",
              rank === 1 && "text-gold",
              rank === 2 && "text-silver",
              rank === 3 && "text-bronze",
            )}
          >
            #{rank}
            {[1, 2, 3].includes(rank) && <Star className="h-3 w-3" />}
          </TBody>
        );
      },
    },
    {
      accessorKey: "address",
      enableSorting: false,
      header: ({ column }) => tableHeader(column, "Address"),
      cell: ({ row }) => {
        const { address } = row.original;

        return (
          <div className="flex flex-row items-center gap-1">
            <Tooltip title={address}>
              <TBody>{formatAddress(address)}</TBody>
            </Tooltip>
            <OpenOnExplorerButton url={explorer.buildAddressUrl(address)} />
          </div>
        );
      },
    },
    {
      accessorKey: "pointsPerDay",
      sortingFn: "alphanumeric",
      header: ({ column }) =>
        tableHeader(column, "Points / day", { isNumerical: true }),
      cell: ({ row }) => {
        const { pointsPerDay } = row.original;

        return (
          <div className="flex flex-row items-center justify-end gap-1.5">
            <PointsIcon />
            <TBody>{formatPoints(new BigNumber(pointsPerDay))}</TBody>
          </div>
        );
      },
    },
    {
      accessorKey: "totalPoints",
      sortingFn: "alphanumeric",
      header: ({ column }) =>
        tableHeader(column, "Total Points", { isNumerical: true }),
      cell: ({ row }) => {
        const { totalPoints } = row.original;

        return (
          <div className="flex flex-row items-center justify-end gap-1.5">
            <PointsIcon />
            <TBody>{formatPoints(new BigNumber(totalPoints))}</TBody>
          </div>
        );
      },
    },
  ];

  // Rows
  const rows: RowData[] = [
    {
      rank: 1,
      address:
        "0x98175f9a47c411cc169ee4b0292f08531e4d442d4cb9ec61333016d2e92125",
      pointsPerDay: 21521,
      totalPoints: 3837795,
    },
    {
      rank: 2,
      address:
        "0x6191f9a47c411cc169ee4b0292f08531e4d442d4cb9ec61333016d2e9dee1205",
      pointsPerDay: 18582,
      totalPoints: 2116510,
    },
    {
      rank: 3,
      address:
        "0x9289a47c411cc169ee4b0292f08531e4d442d4cb9ec61333016d2e9dee55551",
      pointsPerDay: 817512,
      totalPoints: 1928582,
    },
    {
      rank: 4,
      address: "0x517c411cc169ee4b0292f08531e4d442d4cb9ec61333016d2e9d52212",
      pointsPerDay: 251,
      totalPoints: 99921,
    },
  ];

  // Sort
  const sortedRows = rows.slice().sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="w-full max-w-[960px]">
      <DataTable<RowData>
        columns={columns}
        data={sortedRows}
        noDataMessage="No data"
        tableContainer={{ className: "overflow-visible" }}
        tableRowClassName={(row) =>
          row.original.address === address &&
          "outline outline-secondary rounded-sm !bg-secondary/5"
        }
      />
    </div>
  );
}
