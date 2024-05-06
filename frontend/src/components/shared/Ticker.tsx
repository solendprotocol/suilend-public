import { Fragment, ReactNode } from "react";

import { ClassValue } from "clsx";

import { cn } from "@/lib/utils";

interface TickerProps {
  className?: ClassValue;
  /** Must be a CSS readable duration
   * @default 10s
   * @example '15s'
   * @example '1s'
   * @example '200ms'
   */
  items: ReactNode[];
}

export default function Ticker({ className, items }: TickerProps) {
  return (
    <div
      className={cn(
        "flex w-full transform-gpu flex-row flex-nowrap overflow-hidden",
        className,
      )}
    >
      <div className="flex w-max flex-shrink-0 animate-infinite-scroll flex-row items-center gap-20 pr-20 md:gap-40 md:pr-40">
        {items.map((item, index) => (
          <Fragment key={index}>{item}</Fragment>
        ))}
      </div>
      <div className="flex w-max flex-shrink-0 animate-infinite-scroll flex-row items-center gap-20 pr-20 md:gap-40 md:pr-40">
        {items.map((item, index) => (
          <Fragment key={index}>{item}</Fragment>
        ))}
      </div>
    </div>
  );
}
