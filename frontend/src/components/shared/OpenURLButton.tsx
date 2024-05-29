import { PropsWithChildren } from "react";

import { ExternalLink } from "lucide-react";

import Button from "@/components/shared/Button";

interface OpenURLButtonProps extends PropsWithChildren {
  url: string;
}

export default function OpenURLButton({ url, children }: OpenURLButtonProps) {
  const openUrl = () => {
    window.open(url, "_blank");
  };

  const tooltip = (children as string) ?? "Open URL";

  return (
    <Button
      className="text-muted-foreground"
      tooltip={tooltip}
      icon={<ExternalLink />}
      variant="ghost"
      size="icon"
      onClick={openUrl}
    >
      {tooltip}
    </Button>
  );
}
