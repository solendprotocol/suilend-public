import { Fragment, FunctionComponent, ReactNode, useState } from "react";

import {
  Cell,
  Column,
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  Header,
  Row,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import BigNumber from "bignumber.js";
import { ClassValue } from "clsx";
import {
  ArrowDown01,
  ArrowDown10,
  ArrowDownAz,
  ArrowDownZa,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";

import Button from "@/components/shared/Button";
import LabelWithTooltip from "@/components/shared/LabelWithTooltip";
import { TLabelSans } from "@/components/shared/Typography";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableContainerProps,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function decimalSortingFn<T>(key: string) {
  return (rowA: Row<T>, rowB: Row<T>) => {
    const a = rowA.original as { [key: string]: BigNumber };
    const b = rowB.original as { [key: string]: BigNumber };

    return a[key].lt(b[key]) ? -1 : 1;
  };
}

enum SortState {
  NOT_SORTED = "not_sorted",
  ASC = "asc",
  DESC = "desc",
}

function getSortState<T>(
  column: Column<T>,
  { isNumerical, isDate }: { isNumerical?: boolean; isDate?: boolean } = {},
) {
  let state: SortState;
  let action;
  if (!column.getIsSorted()) {
    state = SortState.NOT_SORTED;
    action = () => column.toggleSorting(false);
  } else if (column.getIsSorted() === "asc") {
    state = SortState.ASC;
    action = () => column.toggleSorting(true);
  } else {
    state = SortState.DESC;
    action = () => column.clearSorting();
  }

  let icon, tooltip;
  if (state === SortState.NOT_SORTED) {
    if (isNumerical) {
      icon = <ChevronsUpDown />;
      tooltip = "Click to sort smallest to biggest";
    } else if (isDate) {
      icon = <ChevronsUpDown />;
      tooltip = "Click to sort oldest to newest";
    } else {
      icon = <ChevronsUpDown />;
      tooltip = "Click to sort A-Z";
    }
  } else if (state === SortState.ASC) {
    if (isNumerical) {
      icon = <ArrowDown01 />;
      tooltip = "Click to sort biggest to smallest";
    } else if (isDate) {
      icon = <ChevronDown />;
      tooltip = "Click to sort newest to oldest";
    } else {
      icon = <ArrowDownAz />;
      tooltip = "Click to sort Z-A";
    }
  } else {
    if (isNumerical) {
      icon = <ArrowDown10 />;
      tooltip = "Click to cancel sorting";
    } else if (isDate) {
      icon = <ChevronUp />;
      tooltip = "Click to cancel sorting";
    } else {
      icon = <ArrowDownZa />;
      tooltip = "Click to cancel sorting";
    }
  }

  return { action, icon, tooltip };
}

export function tableHeader<T>(
  column: Column<T>,
  title: string,
  {
    isNumerical,
    isDate,
    tooltip,
    borderBottom,
  }: {
    isNumerical?: boolean;
    isDate?: boolean;
    tooltip?: string | ReactNode;
    borderBottom?: boolean;
  } = {},
) {
  const sortState = column.getCanSort()
    ? getSortState(column, { isNumerical, isDate })
    : undefined;

  if (!sortState)
    return (
      <LabelWithTooltip
        className={cn(
          "flex h-full w-full min-w-max flex-col justify-center px-4",
          isNumerical ? "items-end" : "items-start",
          borderBottom && "border-b",
        )}
        tooltip={tooltip}
      >
        {title}
      </LabelWithTooltip>
    );
  return (
    <Button
      className={cn(
        "h-full w-full rounded-none px-4 py-0 hover:bg-transparent",
        isNumerical ? "justify-end" : "justify-start",
        borderBottom && "border-b",
        column.getIsSorted() && "!text-primary-foreground",
      )}
      labelClassName="font-sans text-xs min-w-max"
      tooltip={sortState.tooltip}
      tooltipAlign={isNumerical ? "end" : "start"}
      endIcon={sortState.icon}
      variant="ghost"
      onClick={sortState.action}
    >
      {title}
    </Button>
  );
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data?: T[];
  noDataMessage: string;
  columnFilters?: ColumnFiltersState;
  skeletonRows?: number;
  maxRows?: number;
  container?: TableContainerProps;
  tableClassName?: ClassValue;
  tableHeaderRowClassName?: ClassValue;
  tableHeadClassName?: (header: Header<T, unknown>) => ClassValue;
  tableRowClassName?: (row?: Row<T>) => ClassValue;
  tableCellClassName?: (cell?: Cell<T, unknown>) => ClassValue;
  RowModal?: FunctionComponent<{
    row: T;
    children: ReactNode;
  }>;
  onRowClick?: (row: Row<T>, index: number) => (() => void) | undefined;
}

export default function DataTable<T>({
  columns,
  data,
  noDataMessage,
  columnFilters,
  skeletonRows,
  maxRows,
  container,
  tableClassName,
  tableHeaderRowClassName,
  tableHeadClassName,
  tableRowClassName,
  tableCellClassName,
  RowModal,
  onRowClick,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  type TWithSubRows = T & { subRows?: T[] };

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row: T) =>
      "subRows" in (row as TWithSubRows)
        ? (row as TWithSubRows).subRows
        : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      expanded,
      columnFilters,
    },
  });

  return (
    <Table container={container} className={cn("border-y", tableClassName)}>
      <TableHeader className="relative z-[2]">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            key={headerGroup.id}
            className={cn("hover:bg-transparent", tableHeaderRowClassName)}
          >
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    "h-9 px-0 py-0",
                    tableHeadClassName && tableHeadClassName(header),
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="relative z-[1]">
        {data === undefined ? (
          <>
            {Array.from({ length: skeletonRows ?? 5 }).map((_, index) => (
              <TableRow
                key={index}
                className={cn(
                  "hover:bg-transparent",
                  tableRowClassName && tableRowClassName(),
                )}
              >
                <TableCell
                  colSpan={columns.length}
                  className={cn(
                    "h-16 px-0 py-0",
                    tableCellClassName && tableCellClassName(),
                  )}
                >
                  <Skeleton className="h-full w-full bg-muted/10" />
                </TableCell>
              </TableRow>
            ))}
          </>
        ) : (
          <>
            {table.getRowModel().rows.length ? (
              table
                .getRowModel()
                .rows.slice(0, maxRows)
                .map((row, index) => {
                  const children = (
                    <TableRow
                      className={cn(
                        "hover:bg-transparent",
                        (RowModal ||
                          (onRowClick &&
                            onRowClick(row, index) !== undefined)) &&
                          "cursor-pointer hover:bg-muted/10",
                        tableRowClassName && tableRowClassName(row),
                      )}
                      style={{ appearance: "inherit" }}
                      onClick={
                        !RowModal && onRowClick
                          ? onRowClick(row, index)
                          : undefined
                      }
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "h-16",
                            tableCellClassName && tableCellClassName(cell),
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );

                  return (
                    <Fragment key={row.id}>
                      {RowModal ? (
                        <RowModal row={row.original}>{children}</RowModal>
                      ) : (
                        children
                      )}
                    </Fragment>
                  );
                })
            ) : (
              <TableRow
                className={cn(
                  "hover:bg-transparent",
                  tableRowClassName && tableRowClassName(),
                )}
              >
                <TableCell
                  colSpan={columns.length}
                  className={cn(
                    "h-16 py-0 text-center",
                    tableCellClassName && tableCellClassName(),
                  )}
                >
                  <TLabelSans>{noDataMessage}</TLabelSans>
                </TableCell>
              </TableRow>
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
}
