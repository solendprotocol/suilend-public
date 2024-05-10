import { ReactNode } from "react";

import BigNumber from "bignumber.js";

import CopyToClipboardButton from "@/components/shared/CopyToClipboardButton";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import OpenURLButton from "@/components/shared/OpenURLButton";
import Tooltip from "@/components/shared/Tooltip";
import { TBody } from "@/components/shared/Typography";
import { formatId, formatType, formatUsd } from "@/lib/format";

interface ValueProps {
  value: string | number | BigNumber | ReactNode;
  isId?: boolean;
  isType?: boolean;
  isUsd?: boolean;
  url?: string;
  urlTooltip?: string;
  isExplorerUrl?: boolean;
}

export default function Value({
  value,
  isId,
  isType,
  isUsd,
  url,
  urlTooltip,
  isExplorerUrl,
}: ValueProps) {
  return (
    <div className="flex flex-row gap-1">
      {isId || isType ? (
        <>
          <Tooltip title={value as string}>
            <TBody className="w-fit break-all">
              {(isId ? formatId : formatType)((value as string).toString())}
            </TBody>
          </Tooltip>

          <CopyToClipboardButton
            className="-my-1.5"
            value={(value as string).toString()}
          />
        </>
      ) : isUsd ? (
        <TBody>{formatUsd(value as BigNumber)}</TBody>
      ) : (
        <TBody>{value as string | number | ReactNode}</TBody>
      )}

      {url && (
        <div className="-my-1.5">
          {isExplorerUrl ? (
            <OpenOnExplorerButton url={url} />
          ) : (
            <OpenURLButton url={url}>{urlTooltip}</OpenURLButton>
          )}
        </div>
      )}
    </div>
  );
}
