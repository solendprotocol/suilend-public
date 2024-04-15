import React from "react";

import clsx from "clsx";

import StandardSelect from "@/components/shared/StandardSelect";
import { useAppContext } from "@/contexts/AppContext";
import { RPCS } from "@/lib/constants";

interface RpcSelectProps {
  className?: clsx.ClassValue;
}

export default function RpcSelect({ className }: RpcSelectProps) {
  const { rpc, onRpcIdChange } = useAppContext();

  return (
    <StandardSelect
      className={className}
      items={RPCS}
      selectedItemId={rpc.id}
      setValue={onRpcIdChange}
      title="Select RPC"
    />
  );
}
