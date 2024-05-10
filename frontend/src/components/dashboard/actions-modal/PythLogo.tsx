import Image from "next/image";

import Tooltip from "@/components/shared/Tooltip";
import pythLogo from "@/public/assets/pyth.png";

export default function PythLogo() {
  return (
    <Tooltip title="Powered by Pyth">
      <Image
        className="h-4 w-4"
        src={pythLogo}
        alt="Pyth logomark"
        width={16}
        height={16}
      />
    </Tooltip>
  );
}
