import { PropsWithChildren, ReactElement, cloneElement } from "react";

import { TTitle } from "@/components/shared/Typography";
import { cn } from "@/lib/utils";

interface TitleWithIconProps extends PropsWithChildren {
  className?: string;
  icon?: ReactElement;
}

export default function TitleWithIcon({
  className,
  icon,
  children,
}: TitleWithIconProps) {
  return (
    <TTitle
      className={cn("flex flex-row items-center gap-2 uppercase", className)}
    >
      {icon &&
        cloneElement(icon, {
          className: "w-4 h-4 flex-shrink-0",
        })}
      {children}
    </TTitle>
  );
}
