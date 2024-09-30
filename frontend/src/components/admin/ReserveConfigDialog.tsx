import { useRef } from "react";

import { TransactionBlock } from "@mysten/sui.js/transactions";
import * as Sentry from "@sentry/nextjs";
import { cloneDeep } from "lodash";
import { Bolt, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { SuilendClient } from "@suilend/sdk/client";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";

import Dialog from "@/components/admin/Dialog";
import DiffLine, { InterestRateDiffLine } from "@/components/admin/DiffLine";
import ReserveConfig, {
  ConfigState,
  getSortedInterestRate,
  parseConfigState,
  useReserveConfigState,
} from "@/components/admin/ReserveConfig";
import Button from "@/components/shared/Button";
import Grid from "@/components/shared/Grid";
import LabelWithValue from "@/components/shared/LabelWithValue";
import { TBody } from "@/components/shared/Typography";
import Value from "@/components/shared/Value";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";

interface DiffProps {
  initialState: ConfigState;
  currentState: ConfigState;
}

function Diff({ initialState, currentState }: DiffProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      {Object.entries(initialState).map(([key, initialValue]) => {
        const newValue = currentState[key as keyof ConfigState];

        if (key === "interestRate") {
          return (
            <InterestRateDiffLine
              key={key}
              label={key}
              initialValue={initialValue as ConfigState["interestRate"]}
              newValue={getSortedInterestRate(
                newValue as ConfigState["interestRate"],
              )}
            />
          );
        }
        return (
          <DiffLine
            key={key}
            label={key}
            initialValue={initialValue as string | number | boolean}
            newValue={newValue as string | number | boolean}
          />
        );
      })}
    </div>
  );
}

interface ReserveConfigDialogProps {
  reserve: ParsedReserve;
}

export default function ReserveConfigDialog({
  reserve,
}: ReserveConfigDialogProps) {
  const { address } = useWalletContext();
  const {
    refreshData,
    explorer,
    signExecuteAndWaitTransactionBlock,
    ...restAppContext
  } = useAppContext();
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;
  const data = restAppContext.data as AppData;

  const isEditable = !!data.lendingMarketOwnerCapId;

  const getInitialConfigState = (
    config: ParsedReserve["config"],
  ): ConfigState => ({
    openLtvPct: config.openLtvPct.toString(),
    closeLtvPct: config.closeLtvPct.toString(),
    maxCloseLtvPct: config.maxCloseLtvPct.toString(),
    borrowWeightBps: config.borrowWeightBps.toString(),
    depositLimit: config.depositLimit.toString(),
    borrowLimit: config.borrowLimit.toString(),
    liquidationBonusBps: config.liquidationBonusBps.toString(),
    maxLiquidationBonusBps: config.maxLiquidationBonusBps.toString(),
    depositLimitUsd: config.depositLimitUsd.toString(),
    borrowLimitUsd: config.borrowLimitUsd.toString(),
    borrowFeeBps: config.borrowFeeBps.toString(),
    spreadFeeBps: config.spreadFeeBps.toString(),
    protocolLiquidationFeeBps: config.protocolLiquidationFeeBps.toString(),
    isolated: config.isolated,
    openAttributedBorrowLimitUsd:
      config.openAttributedBorrowLimitUsd.toString(),
    closeAttributedBorrowLimitUsd:
      config.closeAttributedBorrowLimitUsd.toString(),
    interestRate: config.interestRate.map((row) => ({
      ...row,
      utilPercent: row.utilPercent.toString(),
      aprPercent: row.aprPercent.toString(),
    })),
  });
  const initialConfigStateRef = useRef<ConfigState>(
    getInitialConfigState(reserve.config),
  );

  const reserveConfigState = useReserveConfigState(
    initialConfigStateRef.current,
  );
  const { configState, resetConfigState } = reserveConfigState;

  // Save
  const saveChanges = async () => {
    if (!address) throw new Error("Wallet not connected");
    if (!data.lendingMarketOwnerCapId)
      throw new Error("Error: No lending market owner cap");

    const txb = new TransactionBlock();
    const newConfig = parseConfigState(configState, reserve.mintDecimals);

    try {
      try {
        await suilendClient.updateReserveConfig(
          address,
          data.lendingMarketOwnerCapId,
          txb,
          reserve.coinType,
          newConfig,
        );
      } catch (err) {
        Sentry.captureException(err);
        console.error(err);
        throw err;
      }

      await signExecuteAndWaitTransactionBlock(txb);

      toast.success("Reserve config updated");
      initialConfigStateRef.current = cloneDeep(configState);
    } catch (err) {
      toast.error("Failed to update reserve config", {
        description: (err as Error)?.message || "An unknown error occurred",
      });
    } finally {
      await refreshData();
    }
  };

  return (
    <Dialog
      trigger={
        <Button
          labelClassName="uppercase text-xs"
          startIcon={<Bolt />}
          variant="secondaryOutline"
        >
          Config
        </Button>
      }
      titleIcon={<Bolt />}
      title="Config"
      description={
        <div className="flex flex-row gap-2">
          <TBody>{reserve.symbol}</TBody>
          <Value
            value={reserve.id}
            isId
            url={explorer.buildObjectUrl(reserve.id)}
            isExplorerUrl
          />
        </div>
      }
      descriptionAsChild
      footer={
        <div className="flex w-full flex-row items-center gap-2">
          <Button
            tooltip="Revert changes"
            icon={<Undo2 />}
            variant="ghost"
            size="icon"
            onClick={resetConfigState}
          >
            Revert changes
          </Button>
          <Button
            className="flex-1"
            labelClassName="uppercase"
            size="lg"
            onClick={saveChanges}
            disabled={!isEditable}
          >
            Save changes
          </Button>
        </div>
      }
    >
      <Grid>
        <div className="md:col-span-2">
          <LabelWithValue
            label="$typeName"
            value={reserve.config.$typeName}
            isType
          />
        </div>

        <ReserveConfig symbol={reserve.symbol} {...reserveConfigState} />
      </Grid>

      <Diff
        initialState={initialConfigStateRef.current}
        currentState={configState}
      />
    </Dialog>
  );
}
