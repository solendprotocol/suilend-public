import BigNumber from "bignumber.js";

const PREFIX_SUFFIX_LENGTH = 6;
const shorten = (value: string, prefixSuffixLength: number) => {
  return value.length > prefixSuffixLength
    ? `${value.slice(0, prefixSuffixLength)}...${value.slice(
        -prefixSuffixLength,
      )}`
    : value;
};

export const formatAddress = (
  value: string,
  length: number = PREFIX_SUFFIX_LENGTH,
) => shorten(value, length);

export const formatId = (
  value: string,
  length: number = PREFIX_SUFFIX_LENGTH,
) => shorten(value, length);

export const formatType = (
  value: string,
  length: number = PREFIX_SUFFIX_LENGTH,
) => {
  const [id, module, type] = value.split("::");
  return `${shorten(id, length)}::${module}::${type}`;
};

export const formatInteger = (value: number) =>
  Intl.NumberFormat().format(value);

export const formatRank = (rank: number) => `#${formatInteger(rank)}`;

export const formatNumber = (
  value: BigNumber,
  options?: {
    prefix?: string;
    dp?: number;
    roundingMode?: BigNumber.RoundingMode;
    exact?: boolean;
  },
) => {
  const prefix = options?.prefix ?? "";
  const dp = options?.dp ?? 2;
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
    const newDp = Math.max(0, Math.min(dp, maxDigits - digitsCount));

    let [integers, decimals] = _value.toFixed(newDp, roundingMode).split(".");
    if (integers.length > digitsCount) {
      // Rounded up from 999.9xx to 1000
      [integers, decimals] = _value
        .toFixed(newDp, BigNumber.ROUND_DOWN)
        .split(".");
    }

    const integersFormatted = formatInteger(parseInt(integers));
    const decimalsFormatted = decimals !== undefined ? `.${decimals}` : "";
    return `${prefix}${integersFormatted}${decimalsFormatted}${suffix}`;
  } else {
    const [integers, decimals] = value.toFixed(dp, roundingMode).split(".");
    const integersFormatted = formatInteger(parseInt(integers));
    const decimalsFormatted = decimals !== undefined ? `.${decimals}` : "";
    return `${prefix}${integersFormatted}${decimalsFormatted}`;
  }
};

export const formatUsd = (
  value: BigNumber,
  options?: { dp?: number; exact?: boolean },
) => {
  const dp = options?.dp ?? 2;
  const exact = options?.exact ?? false;

  return formatNumber(value, {
    prefix: "$",
    dp,
    roundingMode: BigNumber.ROUND_HALF_UP,
    exact,
  });
};

export const formatPrice = (value: BigNumber) => {
  return formatNumber(value, {
    prefix: "$",
    dp: 2,
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

export const formatPercent = (value: BigNumber, options?: { dp?: number }) => {
  const dp = options?.dp ?? 2;

  return Intl.NumberFormat(undefined, {
    style: "percent",
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(value.div(100).toNumber());
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
  options?: { dp?: number; exact?: boolean },
) => {
  const dp = options?.dp ?? 4;
  const exact = options?.exact ?? true;

  return formatNumber(value, {
    dp,
    roundingMode: BigNumber.ROUND_DOWN,
    exact,
  });
};

export const formatLtv = (value: BigNumber) => formatPercent(value, { dp: 0 });
