import { ExternalLink } from "lucide-react";

import Button from "@/components/shared/Button";
import { useAppContext } from "@/contexts/AppContext";

interface OpenOnExplorerButtonProps {
  url: string;
}

export default function OpenOnExplorerButton({
  url,
}: OpenOnExplorerButtonProps) {
  const { explorer } = useAppContext();

  const openUrl = () => {
    window.open(url, "_blank");
  };

  return (
    <Button
      className="!bg-transparent text-muted-foreground"
      tooltip={`Open on ${explorer.name}`}
      icon={<ExternalLink />}
      variant="ghost"
      size="icon"
      onClick={openUrl}
    >
      Open on {explorer.name}
    </Button>
  );
}
