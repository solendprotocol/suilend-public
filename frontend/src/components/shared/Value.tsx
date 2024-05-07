import { CSSProperties } from "react";

import BigNumber from "bignumber.js";

import CopyToClipboardButton from "@/components/shared/CopyToClipboardButton";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import Tooltip from "@/components/shared/Tooltip";
import { TBody } from "@/components/shared/Typography";
import { formatId, formatType, formatUsd } from "@/lib/format";

interface ValueProps {
  value: string | number | BigNumber;
  url?: string;
  isId?: boolean;
  isType?: boolean;
  isUsd?: boolean;
}

export default function Value({ value, url, isId, isType, isUsd }: ValueProps) {
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

        {url && <OpenOnExplorerButton url={url} />}
      </div>
    </div>
  ) : isUsd ? (
    <TBody className="break-all">{formatUsd(value as BigNumber)}</TBody>
  ) : (
    <TBody className="break-all">{value as string | number}</TBody>
  );
}
