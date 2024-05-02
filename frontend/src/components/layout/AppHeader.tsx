import NextLink from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import { Menu, X } from "lucide-react";

import ConnectWalletButton from "@/components/layout/ConnectWalletButton";
import HeaderBase from "@/components/layout/HeaderBase";
import HeaderMenu from "@/components/layout/HeaderMenu";
import Logo from "@/components/layout/Logo";
import NavigationLinks from "@/components/layout/NavigationLinks";
import RefreshDataButton from "@/components/layout/RefreshDataButton";
import RpcSelect from "@/components/layout/RpcSelect";
import HeaderPointsPopover from "@/components/points/HeaderPointsPopover";
import Button from "@/components/shared/Button";
import { useAppContext } from "@/contexts/AppContext";
import { useWalletContext } from "@/contexts/WalletContext";
import { ROOT_URL } from "@/lib/navigation";

export default function AppHeader() {
  const router = useRouter();
  const { address } = useWalletContext();
  const { data } = useAppContext();

  // Menu
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const openMenu = () => {
    setIsMenuOpen(true);
  };
  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const onMenuToggle = () => {
    if (isMenuOpen) closeMenu();
    else openMenu();
  };

  useEffect(() => {
    router.events.on("routeChangeComplete", closeMenu);
    return () => {
      router.events.off("routeChangeComplete", closeMenu);
    };
  }, [router, closeMenu]);

  return (
    <HeaderBase>
      {/* Start */}
      <div className="flex flex-row items-center gap-12">
        {/* Logo */}
        <NextLink href={ROOT_URL}>
          <Logo />
        </NextLink>

        {/* Links */}
        <div className="hidden flex-row gap-8 lg:flex">
          <NavigationLinks />
        </div>
      </div>

      {/* End */}
      <div className="flex flex-row items-center gap-4">
        <RefreshDataButton />

        <div className="flex flex-row items-center gap-2">
          <div className="hidden md:flex">
            <RpcSelect />
          </div>

          {address && data && (
            <div className="hidden sm:flex">
              <HeaderPointsPopover />
            </div>
          )}

          <ConnectWalletButton />

          <Button
            icon={!isMenuOpen ? <Menu /> : <X />}
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
          >
            Menu
          </Button>
          {isMenuOpen && <HeaderMenu />}
        </div>
      </div>
    </HeaderBase>
  );
}
