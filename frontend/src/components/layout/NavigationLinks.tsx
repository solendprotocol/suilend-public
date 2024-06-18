import { useRouter } from "next/router";

import { isBefore } from "date-fns";

import HeaderPointsPopover from "@/components/points/HeaderPointsPopover";
import Link from "@/components/shared/Link";
import { useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import {
  ADMIN_URL,
  BRIDGE_URL,
  DASHBOARD_URL,
  POINTS_URL,
  SWAP_URL,
} from "@/lib/navigation";

export default function NavigationLinks() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { data } = useAppContext();

  const isActive = (href: string) => router.asPath.startsWith(href);

  // Swap
  const isSwapNew = isBefore(new Date(), new Date(2024, 6, 1)); // Show until 1st of July 2024

  return (
    <>
      <Link href={DASHBOARD_URL}>Dashboard</Link>
      <div className="flex h-[20px] flex-shrink-0 flex-row items-center gap-4">
        <Link href={POINTS_URL} className="flex-1">
          Points
        </Link>

        {address && (
          <div className="sm:hidden">
            <HeaderPointsPopover />
          </div>
        )}
      </div>
      <Link href={SWAP_URL} label={isSwapNew ? "New" : undefined}>
        Swap
      </Link>
      <Link href={BRIDGE_URL}>Bridge</Link>
      {data?.lendingMarketOwnerCapId && <Link href={ADMIN_URL}>Admin</Link>}
    </>
  );
}
