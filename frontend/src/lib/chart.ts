import { CSSProperties } from "react";

export const axis = {
  tickMargin: 2,
  tick: {
    fontSize: 11,
    fontFamily: "var(--font-geist-sans)",
    fill: "hsl(var(--muted-foreground))",
  },
  axisLine: {
    stroke: "transparent",
  },
  tickLine: {
    stroke: "transparent",
  },
};

export const axisLabel = {
  style: {
    fontSize: 12,
    fontFamily: "var(--font-geist-sans)",
    fontWeight: 400,
    lineHeight: "12px",
    textAnchor: "middle",
    fill: "hsl(var(--muted-foreground))",
  } as CSSProperties,
};

export const line = {
  dot: {
    stroke: "transparent",
    strokeWidth: 0,
    fill: "transparent",
  },
  strokeWidth: 2,
};

export const tooltip = {
  cursor: {
    stroke: "hsl(var(--foreground))",
    strokeWidth: 2,
  },
  wrapperStyle: {
    transform: undefined,
    position: undefined,
    top: undefined,
    left: undefined,
  },
};

export type ViewBox = {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const getTooltipStyle = (width: number, viewBox: ViewBox, x: number) => {
  const MARGIN = 2;

  const top = viewBox.top + MARGIN;
  let left: string | number = "auto";
  let right: string | number = "auto";
  const offset = 2 / 2 + 2;

  const isAtRightBoundary =
    x - viewBox.left > viewBox.width - (offset + width + MARGIN);
  if (isAtRightBoundary) {
    right = Math.min(
      viewBox.left + viewBox.width + viewBox.right - width,
      viewBox.left + viewBox.width + viewBox.right - (x - offset),
    );
  } else {
    left = Math.min(
      viewBox.left + viewBox.width + viewBox.right - width,
      x + offset,
    );
  }

  return { width, top, left, right };
};
