import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";

import DataTable, {
  bigNumberSortingFn,
  tableHeader,
} from "@/components/dashboard/DataTable";
import PointsCount from "@/components/points/PointsCount";
import PointsRank from "@/components/points/PointsRank";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import Tooltip from "@/components/shared/Tooltip";
import { TBody } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatAddress } from "@/lib/format";

interface RowData {
  rank: number;
  address: string;
  pointsPerDay: BigNumber;
  totalPoints: BigNumber;
}

export default function PointsLeaderboardTable() {
  const { address } = useWalletContext();
  const { explorer, ...restAppContext } = useAppContext();
  const data = restAppContext.data as AppData;

  const totalPoints = data.pointsStats.totalPoints.total;
  const pointsPerDay = data.pointsStats.pointsPerDay.total;

  // Columns
  const columns: ColumnDef<RowData>[] = [
    {
      accessorKey: "rank",
      enableSorting: false,
      header: ({ column }) => tableHeader(column, "Rank"),
      cell: ({ row }) => {
        const { rank } = row.original;
        return <PointsRank rank={rank} />;
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
      sortingFn: bigNumberSortingFn("pointsPerDay"),
      header: ({ column }) =>
        tableHeader(column, "Points per day", { isNumerical: true }),
      cell: ({ row }) => {
        const { pointsPerDay } = row.original;

        return (
          <div className="flex flex-row justify-end">
            <PointsCount points={pointsPerDay} />
          </div>
        );
      },
    },
    {
      accessorKey: "totalPoints",
      sortingFn: bigNumberSortingFn("totalPoints"),
      header: ({ column }) =>
        tableHeader(column, "Total Points", { isNumerical: true }),
      cell: ({ row }) => {
        const { totalPoints } = row.original;

        return (
          <div className="flex flex-row justify-end">
            <PointsCount points={totalPoints} />
          </div>
        );
      },
    },
  ];

  // Rows
  const rawRows = [
    {
      address:
        "0x98175f9a47c411cc169ee4b0292f08531e4d442d4cb9ec61333016d2e92125",
      totalPoints: new BigNumber(3837795),
      pointsPerDay: new BigNumber(21521),
    },
    {
      address:
        "0x9289a47c411cc169ee4b0292f08531e4d442d4cb9ec61333016d2e9dee55551",
      totalPoints: new BigNumber(1928582),
      pointsPerDay: new BigNumber(817512),
    },
    {
      address: "0x517c411cc169ee4b0292f08531e4d442d4cb9ec61333016d2e9d52212",
      totalPoints: new BigNumber(99921),
      pointsPerDay: new BigNumber(251),
    },
  ];
  if (address)
    rawRows.push({
      address,
      totalPoints,
      pointsPerDay,
    });

  // Sort
  const sortedRawRows = rawRows
    .slice()
    .sort((a, b) => (b.totalPoints.gt(a.totalPoints) ? 1 : -1));

  const rows: RowData[] = sortedRawRows.map((row, index) => ({
    ...row,
    rank: index + 1,
  }));

  return (
    <div className="w-full max-w-[960px]">
      <DataTable<RowData>
        columns={columns}
        data={rows}
        noDataMessage="No data"
        tableRowClassName={(row) =>
          row.original.address === address &&
          "shadow-[inset_0_0_0_2px_hsl(var(--secondary))] !bg-secondary/5"
        }
      />
    </div>
  );
}
