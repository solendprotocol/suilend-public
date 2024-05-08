import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <span
      className={cn("display animate-pulse bg-muted/25", className)}
      {...props}
    />
  );
}

export { Skeleton };
