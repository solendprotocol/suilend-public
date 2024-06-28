import { PropsWithChildren, ReactElement } from "react";

import { ExternalLink } from "lucide-react";

import Button from "@/components/shared/Button";

interface OpenURLButtonProps extends PropsWithChildren {
  url: string;
  icon?: ReactElement;
}

export default function OpenURLButton({
  url,
  icon,
  children,
}: OpenURLButtonProps) {
  const openUrl = () => {
    window.open(url, "_blank");
  };

  const tooltip = (children as string) ?? "Open URL";

  return (
    <Button
      className="text-muted-foreground"
      tooltip={tooltip}
      icon={icon || <ExternalLink />}
      variant="ghost"
      size="icon"
      onClick={openUrl}
    >
      {tooltip}
    </Button>
  );
}
