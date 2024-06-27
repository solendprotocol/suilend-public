import NextLink from "next/link";
import { PropsWithChildren } from "react";

import { ClassValue } from "clsx";
import { ExternalLink, MoveRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface TextLinkProps extends PropsWithChildren {
  className?: ClassValue;
  href: string;
  isRelative?: boolean;
  noIcon?: boolean;
}

export default function TextLink({
  className,
  href,
  isRelative,
  noIcon,
  children,
}: TextLinkProps) {
  const LinkIcon = isRelative ? MoveRight : ExternalLink;

  return (
    <NextLink
      target={isRelative ? undefined : "_blank"}
      href={href}
      className={cn(
        "inline font-medium text-foreground underline decoration-foreground/50 hover:text-primary-foreground hover:decoration-primary-foreground",
        className,
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      {!noIcon && <LinkIcon className="mb-0.5 ml-1 inline h-3 w-3" />}
    </NextLink>
  );
}
