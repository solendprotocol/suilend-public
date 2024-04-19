import { ColumnDef } from "@tanstack/react-table";

import DataTable, {
  bigNumberSortingFn,
  tableHeader,
} from "@/components/dashboard/DataTable";
import LeaderboardDataLastUpdated from "@/components/points/LeaderboardDataLastUpdated";
import LeaderboardDataUsers from "@/components/points/LeaderboardDataUsers";
import PointsCount from "@/components/points/PointsCount";
import PointsRank from "@/components/points/PointsRank";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import Tooltip from "@/components/shared/Tooltip";
import { TBody, TLabelSans } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import { LeaderboardRowData, usePointsContext } from "@/contexts/PointsContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { formatAddress } from "@/lib/format";

export default function PointsLeaderboardTable() {
  const { address } = useWalletContext();
  const { explorer } = useAppContext();
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

  return (
    <div className="flex w-full max-w-[960px] flex-col gap-6">
      <TLabelSans>
        <LeaderboardDataUsers />
        {" • "}
        <LeaderboardDataLastUpdated />
      </TLabelSans>

      <DataTable<LeaderboardRowData>
        columns={columns}
        data={leaderboardRows}
        maxRows={100}
        noDataMessage="No users"
        tableRowClassName={(row) =>
          row.original.address === address &&
          "shadow-[inset_0_0_0_2px_hsl(var(--secondary))] !bg-secondary/5"
        }
      />
    </div>
  );
}
