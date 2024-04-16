import Button from "@/components/shared/Button";
import { useWalletContext } from "@/contexts/WalletContext";

export default function PointsSplash() {
  const { setIsConnectWalletDropdownOpen } = useWalletContext();

  return (
    <div
      className="relative flex h-[100px] w-full flex-col items-center justify-center gap-4 rounded-sm border sm:h-[120px]"
      style={{
        backgroundImage: "url('/assets/points-splash.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="text-primary-foreground text-center font-mono text-sm font-normal uppercase sm:text-[16px]">
        Start earning points
      </div>

      <Button
        labelClassName="uppercase"
        variant="outline"
        onClick={() => setIsConnectWalletDropdownOpen(true)}
      >
        Deposit
      </Button>
    </div>
  );
}
