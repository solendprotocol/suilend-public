import { PropsWithChildren, ReactNode } from "react";

import { TBody } from "@/components/shared/Typography";

interface AprRewardsBreakdownRowProps extends PropsWithChildren {
  isLast?: boolean;
  value?: ReactNode;
}

export default function AprRewardsBreakdownRow({
  isLast,
  value,
  children,
}: AprRewardsBreakdownRowProps) {
  return (
    <div className="relative flex flex-row gap-2">
      <div className="-mt-1 h-3 w-3 rounded-bl-md border-b border-l border-muted-foreground" />
      {!isLast && (
        <div className="absolute -bottom-1 left-0 top-0 w-[1px] bg-muted-foreground" />
      )}

      <div className="flex flex-1 flex-row items-start justify-between gap-4">
        <div className="flex flex-row flex-wrap items-center gap-x-1.5 gap-y-0">
          {children}
        </div>
        {value && <TBody className="text-right text-xs">{value}</TBody>}
      </div>
    </div>
  );
}
