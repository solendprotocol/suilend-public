import React from "react";

import { ClassNameValue } from "tailwind-merge";

import { cn } from "@/lib/utils";

const Lava = ({
  filtered,
  className,
}: {
  filtered?: boolean;
  className?: ClassNameValue;
}) => {
  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-[-1] h-full w-full overflow-hidden",
        className,
      )}
    >
      <div className={cn("z-[-1]", filtered ? "lampScaled" : "lamp")}>
        <div className="lava">
          <div className={cn("blob", filtered && "blobFiltered")}></div>
          <div className={cn("blob", filtered && "blobFiltered")}></div>
          <div className={cn("blob", filtered && "blobFiltered")}></div>
          <div className={cn("blob", filtered && "blobFiltered")}></div>
          <div className={cn("blob", filtered && "blobFiltered")}></div>
          <div className={cn("blob", filtered && "blobFiltered")}></div>
          <div className={cn("blob", filtered && "blobFiltered")}></div>
          <div className={cn("blob", filtered && "blobFiltered")}></div>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default Lava;
