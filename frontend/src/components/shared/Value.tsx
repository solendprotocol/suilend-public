import { CSSProperties } from "react";

import BigNumber from "bignumber.js";
import { ExternalLink } from "lucide-react";

import Button from "@/components/shared/Button";
import CopyToClipboardButton from "@/components/shared/CopyToClipboardButton";
import Tooltip from "@/components/shared/Tooltip";
import { TBody } from "@/components/shared/Typography";
import { useAppContext } from "@/contexts/AppContext";
import { formatId, formatType, formatUsd } from "@/lib/format";

interface ValueProps {
  value: string | number | BigNumber;
  url?: string;
  isId?: boolean;
  isType?: boolean;
  isUsd?: boolean;
}

export default function Value({ value, url, isId, isType, isUsd }: ValueProps) {
  const { explorer } = useAppContext();

  // Open
  const openUrl = () => window.open(url, "_blank");

  return isId || isType ? (
    <div className="flex flex-row gap-1">
      <Tooltip title={value as string}>
        <TBody className="w-fit break-all">
          {(isId ? formatId : formatType)(value.toString())}
        </TBody>
      </Tooltip>

      <div
        className="-my-[var(--my)] flex flex-row"
        style={{ "--my": `${(32 - 20) / 2}px` } as CSSProperties}
      >
        <CopyToClipboardButton value={value.toString()} />

        {url && (
          <Button
            className="!bg-transparent text-muted-foreground"
            tooltip={`Open on ${explorer.name}`}
            icon={<ExternalLink />}
            variant="ghost"
            size="icon"
            onClick={openUrl}
          >
            Open link
          </Button>
        )}
      </div>
    </div>
  ) : isUsd ? (
    <TBody className="break-all">{formatUsd(value as BigNumber)}</TBody>
  ) : (
    <TBody className="break-all">{value as string | number}</TBody>
  );
}
