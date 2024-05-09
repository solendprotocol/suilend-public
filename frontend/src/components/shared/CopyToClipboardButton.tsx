import { useEffect, useRef, useState } from "react";

import * as Sentry from "@sentry/nextjs";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/shared/Button";

interface CopyToClipboardButtonProps {
  tooltip?: string;
  value: string;
}

export default function CopyToClipboardButton({
  tooltip,
  value,
}: CopyToClipboardButtonProps) {
  // State
  const [justCopied, setJustCopied] = useState<boolean>(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const timeout = timeoutRef.current;

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [justCopied]);

  // Copy
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value.toString());
      toast.info(`Copied ${value} to clipboard`);
      setJustCopied(true);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setJustCopied(false);
      }, 2500);
    } catch (err) {
      toast.error(`Failed to copy ${value} to clipboard`, {
        description: ((err as Error)?.message || err) as string,
      });
      Sentry.captureException(err);
      console.error(err);
    }
  };

  return (
    <Button
      className="!bg-transparent text-muted-foreground"
      tooltip={tooltip ?? "Copy to clipboard"}
      icon={
        justCopied ? <Check className="text-primary-foreground" /> : <Copy />
      }
      variant="ghost"
      size="icon"
      onClick={copyToClipboard}
    >
      {justCopied ? "Copied" : "Copy"}
    </Button>
  );
}
