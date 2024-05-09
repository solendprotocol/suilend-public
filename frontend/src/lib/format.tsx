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
    fadeOutTrailingZeros?: boolean;
  },
) => {
  const prefix = options?.prefix ?? "";
  const dp = options?.dp ?? 2;
  const roundingMode = options?.roundingMode ?? BigNumber.ROUND_HALF_UP;
  const exact = options?.exact ?? false;
  const fadeOutTrailingZeros = options?.fadeOutTrailingZeros ?? true;

  // Exact, zero, <min, or <1
  const minValue = new BigNumber(10).pow(-dp);
  const isLtMinValue = !value.eq(0) && value.lt(minValue);
  if (exact || value.eq(0) || isLtMinValue || value.lt(1)) {
    const [integers, decimals] = (isLtMinValue ? minValue : value)
      .toFixed(dp, roundingMode)
      .split(".");
    const integersFormatted = formatInteger(parseInt(integers));
    const decimalsFormatted = decimals !== undefined ? `.${decimals}` : "";
    const minValuePrefix = isLtMinValue ? "<" : "";
    const formattedValue = `${minValuePrefix}${prefix}${integersFormatted}${decimalsFormatted}`;

    if (!fadeOutTrailingZeros) return formattedValue;
    if (decimals === undefined) return formattedValue;

    const lastNonZeroIndex = Math.max(
      decimalsFormatted.lastIndexOf("1"),
      decimalsFormatted.lastIndexOf("2"),
      decimalsFormatted.lastIndexOf("3"),
      decimalsFormatted.lastIndexOf("4"),
      decimalsFormatted.lastIndexOf("5"),
      decimalsFormatted.lastIndexOf("6"),
      decimalsFormatted.lastIndexOf("7"),
      decimalsFormatted.lastIndexOf("8"),
      decimalsFormatted.lastIndexOf("9"),
    );

    if (lastNonZeroIndex === -1)
      return (
        <>
          {prefix}
          {integersFormatted}
          <span className="opacity-30">{decimalsFormatted}</span>
        </>
      );
    if (lastNonZeroIndex === decimalsFormatted.length - 1)
      return formattedValue;
    return (
      <>
        {prefix}
        {integersFormatted}
        {decimalsFormatted.slice(0, lastNonZeroIndex + 1)}
        <span className="opacity-30">
          {"0".repeat(decimalsFormatted.length - (lastNonZeroIndex + 1))}
        </span>
      </>
    );
  } else {
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
    const formattedValue = `${prefix}${integersFormatted}${decimalsFormatted}${suffix}`;

    return formattedValue;
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
    fadeOutTrailingZeros: false,
  }) as string;
};

export const formatPrice = (value: BigNumber) => {
  return formatNumber(value, {
    prefix: "$",
    dp: 2,
    roundingMode: BigNumber.ROUND_HALF_UP,
    exact: true,
    fadeOutTrailingZeros: false,
  }) as string;
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
    fadeOutTrailingZeros: true,
  });
};

export const formatLtv = (value: BigNumber) => formatPercent(value, { dp: 0 });
