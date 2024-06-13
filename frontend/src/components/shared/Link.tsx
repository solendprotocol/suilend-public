import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { useRouter } from "next/router";
import { PropsWithChildren, ReactNode } from "react";

import { ClassValue } from "clsx";

import { labelSansClassNames } from "@/components/shared/Typography";
import { cn } from "@/lib/utils";

interface LinkProps extends PropsWithChildren, NextLinkProps {
  href: string;
  className?: ClassValue;
  isExternal?: boolean;
  icon?: ReactNode;
}

export default function Link({
  href,
  className,
  isExternal,
  icon,
  children,
  ...props
}: LinkProps) {
  const router = useRouter();
  const isActive = router.asPath.startsWith(href);

  const Component = isExternal ? "a" : NextLink;

  return (
    <Component
      href={href}
      target={isExternal ? "_blank" : undefined}
      className={cn(
        labelSansClassNames,
        "flex flex-shrink-0 flex-row items-center gap-1.5 text-sm transition-colors hover:text-foreground",
        isActive && "text-foreground",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </Component>
  );
}
