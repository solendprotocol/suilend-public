import { useEffect, useRef, useState } from "react";

import { Settings } from "lucide-react";
import { toast } from "sonner";

import Dialog from "@/components/dashboard/Dialog";
import ExplorerSelect from "@/components/layout/ExplorerSelect";
import RpcSelect from "@/components/layout/RpcSelect";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { TLabelSans } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/contexts/AppContext";
import { EXPLORERS, Explorer, RPCS, Rpc } from "@/lib/constants";

export default function SettingsDialog() {
  const { rpc, customRpcUrl, setRpc, explorer, setExplorerId } =
    useAppContext();

  // State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const onOpenChange = (_isOpen: boolean) => {
    setIsOpen(_isOpen);
  };

  // Rpc
  type RpcState = {
    id: Rpc;
    customUrl: string;
  };

  const [rpcState, setRpcState] = useState<RpcState>({
    id: rpc.id,
    customUrl: customRpcUrl,
  });
  const initialRpcStateRef = useRef<RpcState>(rpcState);

  useEffect(() => {
    if (!isOpen) return;

    const newRpcState = { id: rpc.id, customUrl: customRpcUrl };
    setRpcState(newRpcState);
    initialRpcStateRef.current = newRpcState;
  }, [isOpen, rpc, customRpcUrl]);

  const onRpcIdChange = (id: Rpc) => {
    const newRpc = RPCS.find((r) => r.id === id);
    if (!newRpc) return;

    setRpcState((s) => ({ ...s, id: newRpc.id as Rpc }));

    if (newRpc.id !== Rpc.CUSTOM) {
      setRpc(newRpc.id, "");
      toast.info(`Switched to ${newRpc.name}`);
    }
  };

  const onCustomRpcUrlChange = (customUrl: string) => {
    setRpcState((s) => ({ ...s, customUrl }));
  };

  const saveCustomRpc = () => {
    setRpc(Rpc.CUSTOM, rpcState.customUrl);

    toast.info("Switched to custom RPC", {
      description: rpcState.customUrl,
    });
  };

  // Explorer
  const onExplorerIdChange = (id: Explorer) => {
    const newExplorer = EXPLORERS.find((e) => e.id === id);
    if (!newExplorer) return;

    setExplorerId(newExplorer.id as Explorer);
    toast.info(`Switched to ${newExplorer.name}`);
  };

  return (
    <Dialog
      rootProps={{ open: isOpen, onOpenChange }}
      trigger={
        <Button icon={<Settings />} variant="ghost" size="icon">
          Settings
        </Button>
      }
      dialogContentProps={{
        className: "max-w-md",
      }}
      isAutoHeight
      title="Settings"
    >
      <div className="flex w-full flex-col gap-4 overflow-y-auto p-4 pt-0">
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-row items-center gap-4">
            <TLabelSans className="flex-1">RPC</TLabelSans>

            <div className="flex-1">
              <RpcSelect
                value={rpcState.id}
                onChange={(id) => onRpcIdChange(id as Rpc)}
              />
            </div>
          </div>

          {rpcState.id === Rpc.CUSTOM && (
            <>
              <div className="flex flex-row items-center gap-4">
                <TLabelSans>Custom RPC</TLabelSans>

                <div className="flex-1">
                  <Input
                    id="customRpcUrl"
                    value={rpcState.customUrl}
                    onChange={onCustomRpcUrlChange}
                    inputProps={{
                      className: "h-8 rounded-sm bg-card font-sans",
                      autoFocus: initialRpcStateRef.current.customUrl === "",
                    }}
                  />
                </div>
              </div>

              <div className="flex w-full flex-row justify-end gap-2">
                <Button
                  className=""
                  labelClassName="uppercase"
                  disabled={!rpcState.customUrl}
                  onClick={saveCustomRpc}
                >
                  Save
                </Button>
              </div>

              <Separator />
            </>
          )}
        </div>

        <div className="flex flex-row items-center gap-4">
          <TLabelSans className="flex-1">Explorer</TLabelSans>
          <div className="flex-1">
            <ExplorerSelect
              value={explorer.id}
              onChange={(id) => onExplorerIdChange(id as Explorer)}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
