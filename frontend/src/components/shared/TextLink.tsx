import NextLink from "next/link";
import { PropsWithChildren } from "react";

import { ClassValue } from "clsx";
import { ExternalLink } from "lucide-react";

import { cn } from "@/lib/utils";

interface TextLinkProps extends PropsWithChildren {
  className?: ClassValue;
  href: string;
}

export default function TextLink({ className, href, children }: TextLinkProps) {
  return (
    <NextLink
      target="_blank"
      href={href}
      className={cn(
        "inline font-medium text-foreground underline decoration-foreground/50 hover:text-primary-foreground hover:decoration-primary-foreground",
        className,
      )}
    >
      {children}
      <ExternalLink className="mb-0.5 ml-1 inline h-3 w-3" />
    </NextLink>
  );
}
