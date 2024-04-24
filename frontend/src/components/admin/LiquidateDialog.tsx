import { useState } from "react";

import { SuiClient } from "@mysten/sui.js/client";
import {
  TransactionBlock,
  TransactionResult,
} from "@mysten/sui.js/transactions";
import * as Sentry from "@sentry/nextjs";
import { ColumnDef } from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

import { phantom } from "@suilend/sdk/_generated/_framework/reified";
import { LendingMarket } from "@suilend/sdk/_generated/suilend/lending-market/structs";
import { Obligation } from "@suilend/sdk/_generated/suilend/obligation/structs";
import { Reserve } from "@suilend/sdk/_generated/suilend/reserve/structs";
import {
  LENDING_MARKET_ID,
  LENDING_MARKET_TYPE,
  SuilendClient,
} from "@suilend/sdk/client";
import {
  ParsedObligation,
  parseObligation,
} from "@suilend/sdk/parsers/obligation";
import { ParsedReserve } from "@suilend/sdk/parsers/reserve";
import {
  formattedObligationHistory,
  getObligationHistoryPage,
  liquidationHistoryEvent,
  nonLiquidationHistoryEvent,
} from "@suilend/sdk/utils/obligation";
import * as simulate from "@suilend/sdk/utils/simulate";

import { SuiPriceServiceConnection } from "@pyth-sdk";

import Input from "@/components/admin/Input";
import UtilizationBar from "@/components/dashboard/account/UtilizationBar";
import DataTable, {
  decimalSortingFn,
  tableHeader,
} from "@/components/dashboard/DataTable";
import Button from "@/components/shared/Button";
import Grid from "@/components/shared/Grid";
import LabelWithValue from "@/components/shared/LabelWithValue";
import { TBody } from "@/components/shared/Typography";
import { AppData, useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { getAllCoins } from "@/lib/coinBalance";
import { isSui } from "@/lib/coinType";

interface RowData {
  symbol: string;
  quantity: BigNumber;
  value: BigNumber;
  selected: boolean;
}

interface LiquidateDialogProps {
  fixedObligation?: ParsedObligation;
}

export default function LiquidateDialog({
  fixedObligation,
}: LiquidateDialogProps) {
  const { address } = useWalletContext();
  const { signExecuteAndWaitTransactionBlock, ...restAppContext } =
    useAppContext();
  const suiClient = restAppContext.suiClient as SuiClient;
  const suilendClient = restAppContext.suilendClient as SuilendClient<string>;
  const data = restAppContext.data as AppData;

  const [refreshedObligation, setRefreshedObligation] =
    useState<Obligation<string> | null>(null);
  const [obligationId, setObligationId] = useState<string>("");
  const [selectedWithdrawAsset, setSelectedWithdrawAsset] =
    useState<string>("");
  const [selectedRepayAsset, setSelectedRepayAsset] = useState<string>("");
  const [obligationOwner, setObligationOwner] = useState<string>("");
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);

  const [obligationHistory, setObligationHistory] = useState<
    formattedObligationHistory[]
  >([]);
  const reserveMap = data.lendingMarket.reserves.reduce(
    (acc, reserve) => ({ ...acc, [reserve.coinType]: reserve }),
    {},
  ) as Record<string, ParsedReserve>;

  const fetchObligationOwner = async (obligationId: string) => {
    if (obligationId === "") {
      return;
    }
    const obligationObject = await suiClient.getObject({
      id: obligationId,
      options: {
        showOwner: true,
      },
    });
    if (!obligationObject?.data?.owner) {
      return;
    }
    setObligationOwner(
      (obligationObject.data.owner as { ObjectOwner: string }).ObjectOwner,
    );
  };

  const fetchObligationDetails = async (obligationId: string) => {
    await fetchObligationOwner(obligationId);
    const rawLendingMarket = await LendingMarket.fetch(
      suiClient,
      phantom(LENDING_MARKET_TYPE),
      LENDING_MARKET_ID,
    );
    const rawObligation = await SuilendClient.getObligation(
      obligationId,
      [LENDING_MARKET_TYPE],
      suiClient,
    );
    let refreshedReserves = rawLendingMarket.reserves as Reserve<string>[];
    const connection = new SuiPriceServiceConnection(
      "https://hermes.pyth.network",
    );
    refreshedReserves = await simulate.refreshReservePrice(
      rawLendingMarket.reserves.map((r) =>
        simulate.compoundReserveInterest(r, Math.round(Date.now() / 1000)),
      ),
      connection,
    );
    const refreshedObligation = simulate.refreshObligation(
      rawObligation,
      refreshedReserves,
    );
    setRefreshedObligation(refreshedObligation);
    setObligationHistory([]);
    setHistoryCursor(null);
    await fetchObligationHistory(obligationId);
  };

  const fetchObligationHistory = async (obligationId: string) => {
    const historyPage = await getObligationHistoryPage(
      suiClient,
      obligationId,
      10,
      historyCursor,
    );
    setHistoryCursor(historyPage.cursor || null);
    setObligationHistory([...obligationHistory, ...historyPage.history]);
  };

  async function liquidateObligation(
    obligation: ParsedObligation,
    repayAssetSymbol: string,
    withdrawAssetSymbol: string,
  ) {
    if (!address) throw new Error("Wallet not connected");

    const txb = new TransactionBlock();

    try {
      try {
        const repayCoinType = obligation.borrows.find(
          (b) => b.reserve.symbol === repayAssetSymbol,
        )?.coinType as string;
        const repayCoin = (await getAllCoins(suiClient, address))
          .filter((coin) => {
            return (
              coin.coinType === repayCoinType ||
              (isSui(coin.coinType) && isSui(repayCoinType))
            );
          })
          .sort((a, b) => {
            return parseInt(b.balance) - parseInt(a.balance);
          })[0];
        let repayCoinId: TransactionResult[0] | string = repayCoin.coinObjectId;

        if (isSui(repayCoinType)) {
          const [splitSui] = txb.splitCoins(txb.gas, [
            parseInt(repayCoin.balance) - 1000000000,
          ]);
          repayCoinId = splitSui;
        }
        const [withdrawn] = await suilendClient.liquidateAndRedeem(
          txb,
          obligation.original,
          repayCoinType,
          obligation.deposits.find(
            (d) => d.reserve.symbol === withdrawAssetSymbol,
          )?.coinType as string,
          repayCoinId,
        );
        txb.transferObjects([withdrawn], address);
        if (isSui(repayCoinType)) {
          txb.transferObjects([repayCoinId], address);
        }
      } catch (err) {
        Sentry.captureException(err);
        console.error(err);
        throw err;
      }

      await signExecuteAndWaitTransactionBlock(txb);

      toast.success("Liquidated");
    } catch (err) {
      toast.error("Failed to liquidate", {
        description: ((err as Error)?.message || err) as string,
      });
    }
  }
  let parsedObligation: ParsedObligation | null = null;
  if (fixedObligation) {
    parsedObligation = fixedObligation;
    fetchObligationOwner(parsedObligation.id);
    fetchObligationHistory(parsedObligation.id);
  } else {
    parsedObligation = refreshedObligation
      ? parseObligation(refreshedObligation, reserveMap)
      : null;
  }
  return (
    <Grid>
      {!fixedObligation && (
        <div className="col-span-2 flex flex-row items-end gap-2">
          <div className="w-full">
            <Input
              label="Obligation ID"
              id="obligationId"
              type="text"
              value={obligationId}
              onChange={(value) => {
                setObligationId(value);
              }}
            />
            <br />
            <Button
              tooltip="Search for an Obligation"
              onClick={() => fetchObligationDetails(obligationId)}
            >
              Lookup
            </Button>
          </div>
        </div>
      )}
      {parsedObligation && (
        <>
          <LabelWithValue label="Owner" value={obligationOwner} isId={true} />
          <LabelWithValue
            label="Net Value"
            value={parsedObligation.netValueUsd}
            isUsd={true}
          />
          <LabelWithValue
            label="Total Supply"
            value={parsedObligation.totalSupplyUsd}
            isUsd={true}
          />
          <LabelWithValue
            label="Borrow Limit"
            value={parsedObligation.borrowLimit}
            isUsd={true}
          />
          <LabelWithValue
            label="Unhealthy Borrow Value"
            value={parsedObligation.unhealthyBorrowValueUsd}
            isUsd={true}
          />
          <LabelWithValue
            label="Total Borrow"
            value={parsedObligation.totalBorrowUsd}
            isUsd={true}
          />
          <LabelWithValue
            label="Weighted Borrow"
            value={parsedObligation.totalWeightedBorrowUsd}
            isUsd={true}
          />
          <div className="col-span-2">
            <UtilizationBar obligation={parsedObligation} />
          </div>
          <div className="col-span-2 flex flex-row items-end gap-2">
            <DataTable<RowData>
              columns={getColumnDefinition(false)}
              data={parsedObligation.deposits.map((deposit) => {
                return {
                  symbol: deposit.reserve.symbol,
                  value: deposit.depositedAmountUsd,
                  quantity: deposit.depositedAmount,
                  selected: deposit.reserve.symbol === selectedWithdrawAsset,
                };
              })}
              onRowClick={(x: RowData) => {
                if (selectedWithdrawAsset === x.symbol) {
                  setSelectedWithdrawAsset("");
                } else {
                  setSelectedWithdrawAsset(x.symbol);
                }
              }}
              noDataMessage={"No Deposits"}
              tableClassName="border-y-0"
            />
          </div>
          <div className="col-span-2 flex flex-row items-end gap-2">
            <DataTable<RowData>
              columns={getColumnDefinition(true)}
              data={parsedObligation.borrows.map((borrow) => {
                return {
                  symbol: borrow.reserve.symbol,
                  value: borrow.borrowedAmountUsd,
                  quantity: borrow.borrowedAmount,
                  selected: borrow.reserve.symbol === selectedRepayAsset,
                };
              })}
              onRowClick={(x: RowData) => {
                if (selectedRepayAsset === x.symbol) {
                  setSelectedRepayAsset("");
                } else {
                  setSelectedRepayAsset(x.symbol);
                }
              }}
              noDataMessage={"No Borrows"}
              tableClassName="border-y-0"
            />
          </div>
          <div className="col-span-2 flex flex-row items-end gap-2">
            <Button
              tooltip="Liquidate this obligation"
              onClick={() =>
                liquidateObligation(
                  parsedObligation as ParsedObligation,
                  selectedRepayAsset,
                  selectedWithdrawAsset,
                )
              }
              disabled={
                selectedRepayAsset === "" || selectedWithdrawAsset === ""
              }
            >
              Liquidate
            </Button>
          </div>
          <div className="col-span-2 flex flex-row items-end gap-2">
            <DataTable<formattedObligationHistory>
              columns={historyColumnDefinition(data.lendingMarket.reserves)}
              data={obligationHistory}
              noDataMessage={"Loading obligation history"}
              tableClassName="border-y-0"
              onRowClick={async (x: formattedObligationHistory) => {
                await navigator.clipboard.writeText(x.digest);
                toast.info(`Copied ${x.digest} to clipboard`);
              }}
            />
          </div>
          <div className="col-span-2 flex flex-row items-end gap-2">
            <Button
              tooltip="More"
              onClick={async () => {
                await fetchObligationHistory(obligationId);
              }}
              disabled={historyCursor === null}
            >
              Load More
            </Button>
          </div>
        </>
      )}
    </Grid>
  );
}

function getColumnDefinition(isBorrow: boolean) {
  const columns: ColumnDef<RowData>[] = [
    {
      accessorKey: "asset",
      sortingFn: "text",
      header: ({ column }) =>
        tableHeader(column, isBorrow ? "Borrowed Asset" : "Deposited Asset"),
      cell: ({ row }) => {
        const { symbol } = row.original;
        return <TBody>{symbol}</TBody>;
      },
    },
    {
      accessorKey: "quantity",
      sortingFn: decimalSortingFn("quantity"),
      header: ({ column }) => tableHeader(column, "Quantity"),
      cell: ({ row }) => {
        const { value } = row.original;
        return <TBody>{value.toFormat(4).toString()}</TBody>;
      },
    },
    {
      accessorKey: "value",
      sortingFn: decimalSortingFn("value"),
      header: ({ column }) => tableHeader(column, "Value"),
      cell: ({ row }) => {
        const { value } = row.original;
        return <TBody>${value.toFormat(4).toString()}</TBody>;
      },
    },
    {
      accessorKey: "selected",
      sortingFn: "text",
      header: ({ column }) => tableHeader(column, "Selected"),
      cell: ({ row }) => {
        const { selected } = row.original;
        return selected ? <CheckIcon /> : "";
      },
    },
  ];
  return columns;
}

function historyColumnDefinition(reserves: ParsedReserve[]) {
  const columns: ColumnDef<formattedObligationHistory>[] = [
    {
      accessorKey: "timestampMs",
      header: ({ column }) => tableHeader(column, "Timestamp"),
      cell: ({ row }) => {
        const { timestampMs } = row.original;
        const humanTimestamp = new Date(timestampMs);
        return <TBody>{humanTimestamp.toLocaleString()}</TBody>;
      },
    },
    {
      accessorKey: "action",
      header: ({ column }) => tableHeader(column, "Action"),
      cell: ({ row }) => {
        const { action } = row.original;
        return <TBody>{action}</TBody>;
      },
    },
    {
      accessorKey: "reserveId",
      header: ({ column }) => tableHeader(column, "symbol"),
      cell: ({ row }) => {
        if (row.original.action === "Liquidation") {
          const original = row.original as liquidationHistoryEvent;
          const repayReserve = reserves.find(
            (r) => r.id === original.repayReserveId,
          );
          const withdrawReserve = reserves.find(
            (r) => r.id === original.withdrawReserveId,
          );
          return (
            <TBody>
              {repayReserve?.symbol} | {withdrawReserve?.symbol}
            </TBody>
          );
        } else {
          const original = row.original as nonLiquidationHistoryEvent;
          const reserve = reserves.find((r) => r.id === original.reserveId);
          return <TBody>{reserve?.symbol}</TBody>;
        }
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => tableHeader(column, "Quantity"),
      cell: ({ row }) => {
        if (row.original.action === "Liquidation") {
          const original = row.original as liquidationHistoryEvent;
          const repayReserve = reserves.find(
            (r) => r.id === original.repayReserveId,
          );
          const withdrawReserve = reserves.find(
            (r) => r.id === original.repayReserveId,
          );
          if (!repayReserve || !withdrawReserve) {
            return;
          }
          const repayHumanQuantity = new BigNumber(original.repayQuantity)
            .div(new BigNumber(10 ** repayReserve.mintDecimals))
            .toFormat(repayReserve.mintDecimals);
          const withdrawHumanQuantity = new BigNumber(original.withdrawQuantity)
            .div(new BigNumber(10 ** withdrawReserve.mintDecimals))
            .toFormat(withdrawReserve.mintDecimals);
          return (
            <TBody>
              {repayHumanQuantity} | {withdrawHumanQuantity}
            </TBody>
          );
        } else {
          const original = row.original as nonLiquidationHistoryEvent;
          const reserve = reserves.find((r) => r.id === original.reserveId);
          if (!reserve) {
            return;
          }
          const humanQuantity = new BigNumber(original.quantity)
            .div(new BigNumber(10 ** reserve.mintDecimals))
            .toFormat(reserve.mintDecimals);
          return <TBody>{humanQuantity.toString()}</TBody>;
        }
      },
    },
  ];
  return columns;
}
