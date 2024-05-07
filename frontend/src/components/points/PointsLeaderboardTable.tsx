import { ColumnDef } from "@tanstack/react-table";

import DataTable, {
  decimalSortingFn,
  tableHeader,
} from "@/components/dashboard/DataTable";
import LeaderboardDataLastUpdated from "@/components/points/LeaderboardDataLastUpdated";
import LeaderboardDataUsers from "@/components/points/LeaderboardDataUsers";
import PointsCount from "@/components/points/PointsCount";
import PointsRank from "@/components/points/PointsRank";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import { LeaderboardRowData, usePointsContext } from "@/contexts/PointsContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function PointsLeaderboardTable() {
  const { address } = useWalletContext();
  const { leaderboardRows } = usePointsContext();

  // Columns
  const columns: ColumnDef<LeaderboardRowData>[] = [
    {
      accessorKey: "rank",
      enableSorting: false,
      header: ({ column }) => tableHeader(column, "Rank"),
      cell: ({ row }) => {
        const { rank } = row.original;
        return <PointsRank rank={rank} noTooltip />;
      },
    },
    {
      accessorKey: "address",
      enableSorting: false,
      header: ({ column }) => tableHeader(column, "Address"),
      cell: ({ row }) => {
        const { address } = row.original;

        return (
          <Tooltip title={address}>
            <TBody className="w-max uppercase">{formatAddress(address)}</TBody>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "pointsPerDay",
      sortingFn: decimalSortingFn("pointsPerDay"),
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
      sortingFn: decimalSortingFn("totalPoints"),
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

  return (
    <div className="flex w-full max-w-[960px] flex-col gap-6">
      {leaderboardRows ? (
        <TLabelSans>
          <LeaderboardDataUsers />
          {" • "}
          <LeaderboardDataLastUpdated />
        </TLabelSans>
      ) : (
        <Skeleton className="h-4 w-40" />
      )}

      <DataTable<LeaderboardRowData>
        columns={columns}
        data={leaderboardRows}
        noDataMessage="No users"
        maxRows={100}
        container={{
          className: cn(!leaderboardRows && "-mb-6"),
        }}
        tableClassName="border-b-0"
        tableRowClassName={(row) =>
          row?.original.address === address &&
          "shadow-[inset_0_0_0_2px_hsl(var(--secondary))] !bg-secondary/5"
        }
      />
    </div>
  );
}
