export const PYTH_PRICE_ID_SYMBOL_MAP: Record<string, string> = {
  "0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744":
    "Crypto.SUI/USD",
  "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a":
    "Crypto.USDC/USD",
  "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b":
    "Crypto.USDT/USD",
  "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace":
    "Crypto.ETH/USD",
  "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d":
    "Crypto.SOL/USD",
};

export const getPythOracleUrl = (priceId: string) => {
  const symbol = PYTH_PRICE_ID_SYMBOL_MAP[priceId];
  if (!symbol) return null;

  return `https://pyth.network/price-feeds/${symbol.toLowerCase().replace(/\.|\//g, "-")}?range=1W`;
};
