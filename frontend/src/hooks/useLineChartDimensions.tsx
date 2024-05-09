import { RefObject, useCallback, useEffect, useState } from "react";

import { useResizeObserver } from "usehooks-ts";

const useLineChartDimensions = (containerRef: RefObject<HTMLDivElement>) => {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
  } | null>(null);

  const getDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const dimsElem = containerRef.current.querySelector(
      ".recharts-wrapper .recharts-surface defs clipPath rect",
    );
    if (!dimsElem) return;

    const widthAttr = dimsElem.getAttribute("width");
    const heightAttr = dimsElem.getAttribute("height");
    const xAttr = dimsElem.getAttribute("x");
    const yAttr = dimsElem.getAttribute("y");
    if (!widthAttr || !heightAttr || !xAttr || !yAttr) return; // Return early if any zero or null values

    const width = +widthAttr;
    const height = +heightAttr;
    const left = +xAttr;
    const top = +yAttr;
    const right = containerRect.width - width - left;
    const bottom = containerRect.height - height - top;
    if (right < 0 || bottom < 0) return;

    return { width, height, top, right, bottom, left };
  }, [containerRef]);

  useEffect(() => {
    const interval = setInterval(() => {
      const dims = getDimensions();
      if (!dims) return;

      setDimensions(dims);
      clearInterval(interval);
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [getDimensions]);

  useResizeObserver<HTMLDivElement>({
    ref: containerRef,
    onResize: () => {
      const dims = getDimensions();
      if (!dims) return;

      setDimensions(dims);
    },
  });

  return dimensions;
};

export default useLineChartDimensions;
