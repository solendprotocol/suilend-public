import { CSSProperties } from "react";

import { Toaster as ToasterComponent } from "@/components/ui/sonner";
import { TOAST_DURATION } from "@/lib/constants";

export default function Toaster() {
  return (
    <ToasterComponent
      toastOptions={{
        classNames: {
          toast:
            "bg-background text-foreground border-border shadow-lg gap-2 py-3",
          title: "text-foreground font-sans font-normal text-sm",
          description: "text-muted-foreground font-sans font-normal text-xs",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
          closeButton: "text-background bg-foreground border-background",
          icon: "m-0 w-5 h-5",
        },
        style: {
          "--toast-close-button-start": "auto",
          "--toast-close-button-end": "0",
          "--toast-close-button-transform": "translate(35%, -35%)",
          "--toast-svg-margin-start": 0,
          "--toast-svg-margin-end": 0,
          pointerEvents: "auto",
        } as CSSProperties,
      }}
      position="bottom-left"
      duration={TOAST_DURATION}
      closeButton={true}
    />
  );
}
