import { CSSProperties } from "react";

import { TLabel } from "@/components/shared/Typography";
import { Badge } from "@/components/ui/badge";

export default function EditableBadge() {
  return (
    <Badge
      variant="outline"
      className="-my-[var(--my)]"
      style={{ "--my": `${(24 - 20) / 2}px` } as CSSProperties}
    >
      <TLabel>Editable</TLabel>
    </Badge>
  );
}
