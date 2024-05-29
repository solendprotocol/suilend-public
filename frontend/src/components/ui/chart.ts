import { Coordinate } from "recharts/types/util/types";

export type ViewBox = {
  width: number;
  height: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export const getTooltipStyle = (
  width: number,
  viewBox: ViewBox,
  coordinate: Partial<Coordinate>,
) => {
  if (coordinate?.x === undefined) return undefined;

  const MARGIN = 2;

  const top = viewBox.top + MARGIN;
  let left: string | number = "auto";
  let right: string | number = "auto";
  const offset = 10;

  const isAtRightBoundary =
    coordinate.x - viewBox.left > viewBox.width - (offset + width + MARGIN);
  if (isAtRightBoundary) {
    right = Math.min(
      viewBox.left + viewBox.width + viewBox.right - width,
      viewBox.left + viewBox.width + viewBox.right - (coordinate.x - offset),
    );
  } else {
    left = Math.min(
      viewBox.left + viewBox.width + viewBox.right - width,
      coordinate.x + offset,
    );
  }

  return { width, top, left, right };
};
