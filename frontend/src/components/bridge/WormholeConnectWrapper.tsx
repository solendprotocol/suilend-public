import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";

import * as Sentry from "@sentry/nextjs";
import WormholeConnect, {
  WormholeConnectConfig,
  dark,
} from "@wormhole-foundation/wormhole-connect";

import styles from "@/components/bridge/WormholeConnectWrapper.module.scss";
import { RPCS } from "@/lib/constants";
import track from "@/lib/track";

export default function WormholeConnectWrapper() {
  // RPCs
  const solanaRpc = `https://solendf-solendf-67c7.rpcpool.com/${process.env.NEXT_PUBLIC_SOL_TRITON_DEV_API_KEY ?? ""}`;
  const suiRpc = RPCS.find((rpc) => rpc.id === "triton")?.url;

  // Theme
  const customized = dark;
  // customized.primary
  // customized.secondary
  customized.divider = "hsl(var(--border))";
  customized.background.default = "hsl(var(--background))";
  customized.text.primary = "hsl(var(--foreground))";
  customized.text.secondary = "hsl(var(--muted-foreground))";
  // customized.error
  // customized.info
  // customized.success
  // customized.warning
  customized.button.primary = "hsl(var(--primary))";
  // customized.button.primaryText = "";
  // customized.button.disabled = "";
  // customized.button.disabledText = "";
  customized.button.action = "hsl(var(--primary))";
  customized.button.actionText = "hsl(var(--foreground))";
  // customized.button.hover = "";
  customized.options.hover = "hsla(var(--muted) / 20%)";
  customized.options.select = "hsla(var(--muted) / 20%)";
  customized.card.secondary = "hsl(var(--popover))";
  customized.card.background = "hsl(var(--card))";
  customized.popover.background = "hsl(var(--popover))";
  customized.popover.secondary = "hsla(var(--muted) / 20%)";
  customized.modal.background = "hsl(var(--popover))";
  customized.font.primary = "var(--font-geist-sans)";
  customized.font.header = "var(--font-geist-sans)";

  // Config
  const config: WormholeConnectConfig = {
    showHamburgerMenu: false,
    env: "mainnet",
    rpcs: {
      // Ankr RPCs from cam's account cam@solend.fi
      solana: solanaRpc,
      ethereum:
        "https://rpc.ankr.com/eth/d57d49c5cc988185579623ea8fc23e7a0fc7005e843939bc29ed460952b381cb",
      polygon:
        "https://rpc.ankr.com/polygon/d57d49c5cc988185579623ea8fc23e7a0fc7005e843939bc29ed460952b381cb",
      avalanche:
        "https://rpc.ankr.com/avalanche/d57d49c5cc988185579623ea8fc23e7a0fc7005e843939bc29ed460952b381cb",
      sui: suiRpc,
      arbitrum:
        "https://rpc.ankr.com/arbitrum/d57d49c5cc988185579623ea8fc23e7a0fc7005e843939bc29ed460952b381cb",
      optimism:
        "https://rpc.ankr.com/optimism/d57d49c5cc988185579623ea8fc23e7a0fc7005e843939bc29ed460952b381cb",
      base: "https://rpc.ankr.com/base/d57d49c5cc988185579623ea8fc23e7a0fc7005e843939bc29ed460952b381cb",
    },
    networks: [
      "solana",
      "ethereum",
      "polygon",
      "avalanche",
      "sui",
      "arbitrum",
      "optimism",
      "base",
    ],
    tokens: [
      "USDCeth",
      // "USDCpolygon",
      // "USDCavax",
      // "USDCsol",
      // "USDCarbitrum",
      // "USDCoptimism",
      // "USDCbase",
      "USDT",
      // "SUI",
    ],
    mode: "dark",
    customTheme: customized,
    bridgeDefaults: {
      toNetwork: "sui",
    },
    pageHeader: "Bridge",
  };

  // Analytics
  const [asset, setAsset] = useState<string | undefined>(undefined);

  const trackSubmitEvent = useCallback(() => {
    track("bridge_submit");

    const appContentElem = document.querySelector("[class$='-appContent']");
    if (!appContentElem) return;

    const chainRowElems = appContentElem.querySelectorAll(
      "[class$='-chainRow']",
    );
    const fromAssetContainer =
      chainRowElems[0]?.querySelector("[class$='-select']");
    let fromAsset = fromAssetContainer?.textContent ?? undefined;
    if (fromAsset?.includes("(")) fromAsset = fromAsset.replace("(", " (");

    setAsset(fromAsset);
  }, []);

  const trackCompleteEvent = useCallback(() => {
    const appContentElem = document.querySelector("[class$='-appContent']");
    if (!appContentElem) return;

    const chainElems = appContentElem.querySelectorAll(
      "[class$='-input'] > div[class$='-row'] > div[class$='-chain'] > div:last-of-type",
    );
    const fromNetwork = chainElems[0]?.textContent ?? undefined;
    const toNetwork = chainElems[1]?.textContent ?? undefined;

    const amountAssetElems = appContentElem.querySelectorAll(
      "div.MuiStack-root > div div[class$='-input'] > div:last-of-type > div:first-of-type > div:first-of-type > div:last-of-type > div:first-of-type",
    );
    const fromAmountAsset = amountAssetElems[0]?.textContent ?? undefined;
    const fromAmount = fromAmountAsset?.split(" ")?.[0] ?? undefined;
    // const fromAsset = fromAmountAsset?.split(" ")?.[1] ?? undefined;

    const toAmountAsset = amountAssetElems[1]?.textContent ?? undefined;
    const toAmount = toAmountAsset?.split(" ")?.[0] ?? undefined;
    // const toAsset = toAmountAsset?.split(" ")?.[1] ?? undefined;

    const data: Record<string, string | undefined> = {
      fromNetwork,
      toNetwork,
      fromAmount,
      toAmount,
      asset,
    };
    if (Object.values(data).includes(undefined)) {
      const undefinedKeys = Object.keys(data).filter(
        (key) => data[key] === undefined,
      );

      Sentry.captureException(
        `Unable to retrieve the following properties from the DOM for the bridge_complete event: ${undefinedKeys.join(", ")}`,
      );
    }

    track("bridge_complete", data as Record<string, string>);
  }, [asset]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const appContentElem = document.querySelector("[class$='-appContent']");
      if (!appContentElem) return;

      let isComplete = false;
      const inputDivElems = appContentElem.querySelectorAll(
        "[class$='input'] > div",
      );
      for (const elem of inputDivElems) {
        if (elem.textContent === "The bridge is now complete.") {
          isComplete = true;
          break;
        }
      }

      if (isComplete) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        trackCompleteEvent();
      }
    }, 1000);
  }, [trackCompleteEvent]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startInterval]);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    if (
      target.tagName.toLowerCase() === "div" &&
      target.getAttribute("class")?.includes("-button") &&
      target.getAttribute("class")?.includes("-action")
    ) {
      // Submit
      if (target.innerHTML === "Approve and proceed with transaction") {
        trackSubmitEvent();
        startInterval();
      }

      // Bridge again (back)
      if (target.innerHTML === "Bridge more assets") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setAsset(undefined);
      }

      // Back
    } else if (
      (target.tagName.toLowerCase() === "svg" &&
        target.getAttribute("class")?.includes("-arrowBack")) ||
      (target.tagName.toLowerCase() === "path" &&
        target.parentElement &&
        target.parentElement.tagName.toLowerCase() === "svg" &&
        target.parentElement.getAttribute("class")?.includes("-arrowBack"))
    ) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setAsset(undefined);
    }
  };

  return (
    <div className={styles.root} onMouseDown={onMouseDown}>
      <WormholeConnect config={config} />
    </div>
  );
}
