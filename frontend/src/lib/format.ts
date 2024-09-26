import BigNumber from "bignumber.js";

const shorten = (value: string, start: number, end: number) => {
  return value.length > start + end
    ? `${value.slice(0, start)}...${value.slice(-end)}`
    : value;
};

export const replace0x = (value: string) => value.replace("0x", "0×");

export const formatAddress = (value: string, length = 4) => {
  if (length === 0) return replace0x(value);

  return shorten(
    replace0x(value),
    length + (value.startsWith("0x") ? 2 : 0),
    length,
  );
};

export const formatId = (value: string, length = 4) => {
  return shorten(
    replace0x(value),
    length + (value.startsWith("0x") ? 2 : 0),
    length,
  );
};

export const formatType = (value: string, length = 4) => {
  const [id, module, type] = value.split("::");

  return [
    shorten(replace0x(id), length + (id.startsWith("0x") ? 2 : 0), length),
    module,
    type,
  ].join("::");
};

export const formatList = (array: string[]) => {
  if (array.length === 1) return array[0];
  if (array.length === 2) return array.join(" and ");
  return `${array.slice(0, -1).join(", ")}, and ${array.slice(-1)}`;
};

export const formatInteger = (value: number, useGrouping?: boolean) =>
  Intl.NumberFormat(undefined, { useGrouping }).format(value);

export const formatRank = (rank: number) => `#${formatInteger(rank)}`;

export const formatNumber = (
  value: BigNumber,
  options?: {
    prefix?: string;
    dp?: number;
    minDp?: number;
    roundingMode?: BigNumber.RoundingMode;
    exact?: boolean;
    useGrouping?: boolean;
  },
) => {
  const prefix = options?.prefix ?? "";
  const dp = options?.dp ?? 2;
  const minDp = options?.minDp ?? 0;
  const roundingMode = options?.roundingMode ?? BigNumber.ROUND_HALF_UP;
  const exact = options?.exact ?? false;

  // Zero
  if (value.eq(0)) return `${prefix}0${dp > 0 ? `.${"0".repeat(dp)}` : ""}`;

  // <Min
  const minValue = new BigNumber(10).pow(-dp);
  if (value.lt(minValue)) return `<${prefix}${minValue.toFixed(dp)}`;

  // <1
  if (value.lt(1)) return `${prefix}${value.toFixed(dp, roundingMode)}`;

  if (!exact) {
    let _value = value;
    let suffix = "";
    if (_value.lt(1000 ** 1)) {
      _value = _value.div(1000 ** 0);
      suffix = "";
    } else if (_value.lt(1000 ** 2)) {
      _value = _value.div(1000 ** 1);
      suffix = "k";
    } else if (_value.lt(1000 ** 3)) {
      _value = _value.div(1000 ** 2);
      suffix = "m";
    } else if (_value.lt(1000 ** 4)) {
      _value = _value.div(1000 ** 3);
      suffix = "b";
    } else {
      _value = _value.div(1000 ** 4);
      suffix = "t";
    }

    const maxDigits = 4;
    const digitsCount = _value
      .integerValue(BigNumber.ROUND_DOWN)
      .toString().length; // 1 <= _value < 1000, so digitsCount is in {1,2,3}
    const newDp = Math.max(minDp, Math.min(dp, maxDigits - digitsCount));

    let [integers, decimals] = _value.toFixed(newDp, roundingMode).split(".");
    if (integers.length > digitsCount) {
      // Rounded up from 999.9xx to 1000
      [integers, decimals] = _value
        .toFixed(newDp, BigNumber.ROUND_DOWN)
        .split(".");
    }

    const integersFormatted = formatInteger(
      parseInt(integers),
      options?.useGrouping,
    );
    const decimalsFormatted = decimals !== undefined ? `.${decimals}` : "";
    return `${prefix}${integersFormatted}${decimalsFormatted}${suffix}`;
  } else {
    const [integers, decimals] = value.toFixed(dp, roundingMode).split(".");
    const integersFormatted = formatInteger(
      parseInt(integers),
      options?.useGrouping,
    );
    const decimalsFormatted = decimals !== undefined ? `.${decimals}` : "";
    return `${prefix}${integersFormatted}${decimalsFormatted}`;
  }
};

export const formatUsd = (
  value: BigNumber,
  options?: { dp?: number; exact?: boolean },
) => {
  const dp = options?.dp ?? 2;
  const minDp = dp;
  const exact = options?.exact ?? false;

  return formatNumber(value, {
    prefix: "$",
    dp,
    minDp,
    roundingMode: BigNumber.ROUND_HALF_UP,
    exact,
  });
};

export const formatPrice = (
  value: BigNumber,
  options?: { dp?: number; exact?: boolean },
) => {
  const dp = options?.dp ?? 2;

  return formatNumber(value, {
    prefix: "$",
    dp,
    roundingMode: BigNumber.ROUND_HALF_UP,
    exact: true,
  });
};

export const formatPoints = (value: BigNumber, options?: { dp?: number }) => {
  const dp = options?.dp ?? 0;

  return formatNumber(value, {
    dp,
    roundingMode: BigNumber.ROUND_HALF_UP,
    exact: true,
  });
};

export const formatPercent = (
  value: BigNumber,
  options?: { dp?: number; useAccountingSign?: boolean },
) => {
  const dp = options?.dp ?? 2;
  const useAccountingSign = options?.useAccountingSign ?? false;

  const formattedValue = Intl.NumberFormat(undefined, {
    style: "percent",
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(+value.div(100));

  return !useAccountingSign || value.gte(0)
    ? formattedValue
    : `(${formattedValue[0] === "-" ? formattedValue.slice(1) : formattedValue})`;
};

export const formatDuration = (seconds: BigNumber) => {
  if (seconds.lt(1)) return "<1s";
  if (seconds.lt(60)) return `${seconds}s`;
  if (seconds.lt(60 * 60)) return `${seconds.div(60).toFixed(0)}m`;
  if (seconds.lt(60 * 60 * 24)) return `${seconds.div(60 * 60).toFixed(1)}h`;
  return `${seconds.div(60 * 60 * 24).toFixed(1)}d`;
};

export const formatToken = (
  value: BigNumber,
  options?: { dp?: number; exact?: boolean; useGrouping?: boolean },
) => {
  const dp = options?.dp ?? 4;
  const exact = options?.exact ?? true;
  const useGrouping = options?.useGrouping ?? true;

  return formatNumber(value, {
    dp,
    roundingMode: BigNumber.ROUND_DOWN,
    exact,
    useGrouping,
  });
};

export const formatLtvPercent = (value: BigNumber) =>
  formatPercent(value, { dp: 0 });

export const formatBorrowWeight = (value: BigNumber) => {
  const [integers, decimals] = value.toFixed(1).split(".");
  const integersFormatted = formatInteger(parseInt(integers));
  const decimalsFormatted = ![undefined, "0"].includes(decimals)
    ? `.${decimals}`
    : "";
  return `${integersFormatted}${decimalsFormatted}`;
};
