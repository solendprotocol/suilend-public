import ExplorerSelect from "@/components/layout/ExplorerSelect";
import ExternalLinks from "@/components/layout/ExternalLinks";
import NavigationLinks from "@/components/layout/NavigationLinks";
import RpcSelect from "@/components/layout/RpcSelect";
import { TLabelSans } from "@/components/shared/Typography";
import { Separator } from "@/components/ui/separator";

export default function HeaderMenu() {
  return (
    <div
      className="absolute right-0 top-[65px] z-[3] flex h-[calc(100dvh-65px)] w-full flex-col overflow-y-auto bg-background sm:w-[360px] sm:border-l"
      style={{
        overscrollBehavior: "auto contain",
      }}
    >
      <div className="flex w-full flex-1 flex-col gap-8 px-6 py-6 md:pr-10">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6">
            <NavigationLinks className="lg:hidden" />
          </div>

          <Separator className="my-8 md:hidden" />
          <div className="flex flex-col gap-6 md:hidden">
            <ExternalLinks />
          </div>

          <Separator className="my-8 lg:hidden" />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 md:hidden">
              <TLabelSans>RPC</TLabelSans>
              <RpcSelect />
            </div>

            <div className="flex flex-col gap-2">
              <TLabelSans>Explorer</TLabelSans>
              <ExplorerSelect />
            </div>
          </div>
        </div>

        {/* <div className="flex flex-row" /> */}
      </div>
    </div>
  );
}
