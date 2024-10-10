import { CSSProperties } from "react";

import { AlertTriangle, Check, Info } from "lucide-react";

import styles from "@/components/shared/Toaster.module.scss";
import { Toaster as ToasterComponent } from "@/components/ui/sonner";
import { TOAST_DURATION } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function Toaster() {
  return (
    <ToasterComponent
      toastOptions={{
        classNames: {
          toast: cn(
            "bg-background text-foreground border-border shadow-lg gap-1 py-3 flex flex-col items-start justify-start rounded-md",
            styles.toast,
          ),
          title: cn(
            "text-foreground font-sans font-normal text-sm",
            styles.title,
          ),
          description: "text-muted-foreground font-sans font-normal text-sm",
          closeButton: cn(
            "px-4 py-3 text-muted-foreground hover:text-foreground transition-colors !bg-transparent !border-none top-0 right-0 transform-none left-auto",
            styles.closeButton,
          ),
          content: "gap-1",
          icon: "absolute top-3 left-4 m-0 w-5 h-5",
        },
        style: {
          "--toast-svg-margin-start": 0,
          "--toast-svg-margin-end": 0,
          pointerEvents: "auto",
        } as CSSProperties,
      }}
      gap={2 * 4}
      icons={{
        success: <Check className="h-5 w-5 text-success" />,
        info: <Info className="h-5 w-5 text-foreground" />,
        warning: <AlertTriangle className="h-5 w-5 text-warning" />,
        error: <AlertTriangle className="h-5 w-5 text-destructive" />,
      }}
      position="bottom-left"
      duration={TOAST_DURATION}
      closeButton
    />
  );
}
