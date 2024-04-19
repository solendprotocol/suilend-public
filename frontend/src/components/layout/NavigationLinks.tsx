import { ClassValue } from "clsx";

import Link from "@/components/shared/Link";
import { useAppContext } from "@/contexts/AppContext";
import { ADMIN_URL, BRIDGE_URL, DASHBOARD_URL } from "@/lib/navigation";

interface NavigationLinksProps {
  className?: ClassValue;
}

export default function NavigationLinks({ className }: NavigationLinksProps) {
  const { data } = useAppContext();

  return (
    <>
      <Link href={DASHBOARD_URL} className={className}>
        Dashboard
      </Link>
      <Link href={BRIDGE_URL} className={className}>
        Bridge
      </Link>
      {data?.lendingMarketOwnerCapId && (
        <Link href={ADMIN_URL} className={className}>
          Admin
        </Link>
      )}
    </>
  );
}
