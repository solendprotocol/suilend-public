import Image from "next/image";
import React from "react";

import { TBodySans } from "@/components/shared/Typography";
import suilendLogo from "@/public/suilend.svg";

export default function Logo() {
  return (
    <div className="flex flex-row items-center gap-1.5">
      <Image src={suilendLogo} width={24} height={24} alt="Suilend logo" />
      <TBodySans className="text-lg text-primary">Suilend</TBodySans>
    </div>
  );
}
