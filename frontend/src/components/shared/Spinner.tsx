import { VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      default: "w-8 h-8",
      md: "w-6 h-6",
      sm: "w-4 h-4",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type SpinnerProps = VariantProps<typeof spinnerVariants>;

export default function Spinner({ size }: SpinnerProps) {
  return <Loader2 className={cn(spinnerVariants({ size }))} />;
}
