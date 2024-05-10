import { ReactNode } from "react";

import BigNumber from "bignumber.js";

import CopyToClipboardButton from "@/components/shared/CopyToClipboardButton";
import OpenOnExplorerButton from "@/components/shared/OpenOnExplorerButton";
import OpenURLButton from "@/components/shared/OpenURLButton";
import Tooltip from "@/components/shared/Tooltip";
import { TBody } from "@/components/shared/Typography";
import { formatId, formatType, formatUsd } from "@/lib/format";

interface ValueProps {
  valueStartDecorator?: ReactNode;
  value: string | number | BigNumber;
  valueEndDecorator?: ReactNode;
  isId?: boolean;
  isType?: boolean;
  isUsd?: boolean;
  url?: string;
  urlTooltip?: string;
  isExplorerUrl?: boolean;
}

export default function Value({
  valueStartDecorator,
  value,
  valueEndDecorator,
  isId,
  isType,
  isUsd,
  url,
  urlTooltip,
  isExplorerUrl,
}: ValueProps) {
  return (
    <div className="flex flex-row gap-1">
      {valueStartDecorator}
      {isId || isType ? (
        <>
          <Tooltip title={value as string}>
            <TBody className="w-fit break-all uppercase">
              {(isId ? formatId : formatType)(value.toString())}
            </TBody>
          </Tooltip>
        </>
      ) : isUsd ? (
        <TBody>{formatUsd(value as BigNumber)}</TBody>
      ) : (
        <TBody>{value as string | number}</TBody>
      )}
      {valueEndDecorator}

      {(isId || isType || url) && (
        <div className="-mt-1.5 flex flex-row">
          {(isId || isType) && (
            <CopyToClipboardButton value={value.toString()} />
          )}

          {url &&
            (isExplorerUrl ? (
              <OpenOnExplorerButton url={url} />
            ) : (
              <OpenURLButton url={url}>{urlTooltip}</OpenURLButton>
            ))}
        </div>
      )}
    </div>
  );
}
