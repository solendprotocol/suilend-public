import BigNumber from "bignumber.js";

import Button from "@/components/shared/Button";
import Tooltip from "@/components/shared/Tooltip";
import {
  AUTO_REFRESH_INTERVAL,
  useRefreshDataContext,
} from "@/contexts/RefreshDataContext";
import { formatDuration } from "@/lib/format";

function CircularProgress() {
  const { autoRefreshCountdown, isRefreshing } = useRefreshDataContext();

  const stroke = isRefreshing ? "hsl(var(--secondary))" : "hsl(var(--primary))";
  const strokeWidth = 3;
  const radius = 10;
  const size = (radius + strokeWidth / 2) * 2;

  const circumference = radius * 2 * Math.PI;

  const completionPercent =
    (1 - autoRefreshCountdown / AUTO_REFRESH_INTERVAL) * 100;
  const offset = (1 - completionPercent / 100) * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        stroke="hsla(var(--primary) / 25%)"
        strokeDasharray={circumference}
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx="50%"
        cy="50%"
      />

      <circle
        stroke={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx="50%"
        cy="50%"
        style={{
          transition: "0.25s stroke-dashoffset linear, 0.1s stroke",
          transformOrigin: "50% 50%",
          transform: "rotate(-90deg)",
        }}
      />
    </svg>
  );
}

export default function RefreshDataButton() {
  const { autoRefreshCountdown, manuallyRefreshData, isRefreshing } =
    useRefreshDataContext();

  return (
    <Tooltip
      title={
        !isRefreshing
          ? `Data on this page will auto-refresh in ${formatDuration(new BigNumber(Math.ceil(autoRefreshCountdown)))}. Click to trigger a manual refresh.`
          : "Refreshing data..."
      }
    >
      <Button
        className="h-auto w-auto hover:bg-transparent"
        size="icon"
        variant="ghost"
        onClick={manuallyRefreshData}
      >
        <CircularProgress />
      </Button>
    </Tooltip>
  );
}
