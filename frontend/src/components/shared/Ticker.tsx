import React, { CSSProperties, useMemo } from "react";

const sharedPositionProps = {
  position: "fixed",
};

export const Ticker = ({ position, items, slideSpeed }: TickerProps) => {
  const positionToApply = useMemo(() => {
    if (!position) return {};
    if (position === "top") {
      return {
        ...sharedPositionProps,
        top: 0,
      };
    }
    return {
      ...sharedPositionProps,
      bottom: 0,
    };
  }, [position]);

  const animationDuration = useMemo(
    () => (slideSpeed ? { animationDuration: slideSpeed } : {}),
    [slideSpeed],
  );

  return (
    <div style={positionToApply} className="ticker">
      <div className="tickerList" style={animationDuration}>
        {items.map(({ id, text }, index) => (
          <div
            className={`$"newsticker $"tickerItem mr-6 lg:mr-0`}
            key={id || index}
          >
            <div className="tickerItem">
              <div className="title">{text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface TickerProps {
  /** Positions the ticker at the top or bottom of the viewport, if left out, will not position at all */
  position?: "top" | "bottom";
  items: TickerItem[];
  /** Must be a CSS readable duration
   * @default 10s
   * @example '15s'
   * @example '1s'
   * @example '200ms'
   */
  slideSpeed?: CSSProperties["animationDuration"];
}

export interface TickerItem {
  text: React.ReactNode;
  /** If present, this will be used as the key, defaults to index */
  id?: string;
}
