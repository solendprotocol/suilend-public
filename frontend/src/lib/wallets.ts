import { useWallet } from "@suiet/wallet-kit";
import { merge } from "lodash";

import elli from "@/public/assets/elli.png";
import suiet from "@/public/assets/suiet.png";

const PRIORITY_WALLET_IDS = ["Sui Wallet", "Nightly", "Suiet"];

export type Wallet = {
  id: string;
  name: string;
  isInstalled: boolean;
  logoUrl?: string;
  downloadUrls: {
    browserExtension?: string;
    iOS?: string;
    android?: string;
  };
};

export const useListWallets = () => {
  // Wallets
  const { configuredWallets, detectedWallets } = useWallet();

  const walletKitOverrides = {
    Suiet: {
      logoUrl: suiet, // From https://suiet.app/press-kit, Chrome Web Store logo doesn't have a transparent background
    },
    "Sui Wallet": {
      logoUrl:
        "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/05/7c/f1/057cf17e-109e-72cd-eed7-2d539cf3d1f9/AppIcon-0-0-1x_U007ephone-0-85-220.png/460x0w.webp", // Chrome Web Store logo isn't full size
      downloadUrls: {
        iOS: "https://apps.apple.com/us/app/sui-wallet-mobile/id6476572140",
        android:
          "https://play.google.com/store/apps/details?id=com.mystenlabs.suiwallet",
      },
    },
    Elli: {
      logoUrl: elli, // From https://elliwallet.com/, Chrome Web Store link is not available
      downloadUrls: {
        iOS: "https://apps.apple.com/tw/app/elli-sui-wallet/id6447304928",
        android:
          "https://play.google.com/store/apps/details?id=com.elliwallet.mobile",
      },
    },
    "Ethos Wallet": {
      logoUrl:
        "https://lh3.googleusercontent.com/0_mgW4wlHfVNEin17NONBPIi5ZeZB-P5fMSR2HOorMat7ITi8-mNqrDI6yZ0-2GRZN8laJY3L8Qjr5rNzvIZGD9I=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/ethos-sui-wallet/mcbigmjiafegjnnogedioegffbooigli",
        iOS: "https://apps.apple.com/us/app/ethos-sui-wallet/id6450018653",
        android:
          "https://play.google.com/store/apps/details?id=com.ethoswallet.ethosmobile",
      },
    },
    "Frontier Wallet": {
      logoUrl:
        "https://lh3.googleusercontent.com/buEza_jrGHEeH2sn-wUM6jpdQdnvSOr4DbmUVQ3rtTn7oRV7uXjLj8KqiWxISji9jf681OZLM0PL0y7jDGz-i4Bqyw=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/frontier-wallet/kppfdiipphfccemcignhifpjkapfbihd",
        iOS: "https://apps.apple.com/us/app/frontier-crypto-defi-wallet/id1482380988",
        android:
          "https://play.google.com/store/apps/details?id=com.frontierwallet",
      },
    },
    GlassWallet: {
      logoUrl:
        "https://lh3.googleusercontent.com/Ls41pzLke2rSVbBeGX_24_Enbos40lsOoWEmjsCJow4-hxpzLTdLfVF2u3y5M_H106vyyuYyV4XasX54LHJ71BUHpg=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/glass-wallet-sui-wallet/loinekcabhlmhjjbocijdoimmejangoa",
        iOS: "https://apps.apple.com/app/glass-wallet/id6443949035",
        android:
          "https://play.google.com/store/apps/details?id=app.glasswallet",
      },
    },
    "Martian Sui Wallet": {
      logoUrl:
        "https://lh3.googleusercontent.com/5Nza0dQHga1_Z1RAKh-9cPV3N0KxsB3hy2Z31E73qMzxHA7u-7mF8AENMngX7fl5fEdKRcZ67d-f0S-3sZr6n0SsgQ=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/martian-aptos-sui-wallet/efbglgofoippbgcjepnhiblaibcnclgk",
      },
    },
    "Morphis Wallet": {
      logoUrl:
        "https://lh3.googleusercontent.com/m5RWqvhbVo9VWyfLLa6HSnR4t1b6aWzbgFdVwIIFA_RWQDk6CaZurfw8emoXu3XoeFl3TWTkEAE1gFroGpgFiMNrAA=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/morphis-wallet/heefohaffomkkkphnlpohglngmbcclhi",
      },
    },
    Nightly: {
      logoUrl:
        "https://lh3.googleusercontent.com/_feXM9qulMM5w9BYMLzMpZrxW2WlBmdyg3SbETIoRsHdAD9PANnLCEPabC7lzEK0N8fOyyvFkY3746jk8l73zUErxhU=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/nightly/fiikommddbeccaoicoejoniammnalkfa",
        iOS: "https://apps.apple.com/pl/app/nightly-multichain-wallet/id6444768157",
        android:
          "https://play.google.com/store/apps/details?id=com.nightlymobile",
      },
    },
    "OneKey Wallet": {
      logoUrl:
        "https://lh3.googleusercontent.com/ShuZB3y27bt9B-Gqz-hZTcJfw7Q-AX32pz2BD7KUpdy4d7zl7i39iGftpur_Sz9a5-r1NeznELzmewvzKZEaWQFLBg=s120",
      downloadUrls: {
        iOS: "https://apps.apple.com/us/app/onekey-blockchain-defi-wallet/id1609559473",
        android:
          "https://play.google.com/store/apps/details?id=so.onekey.app.wallet",
      },
    },
    "Sensui Wallet": {
      downloadUrls: {
        android: "https://play.google.com/store/apps/details?id=com.gilwallet",
      },
    },
    "Spacecy Sui Wallet": {
      logoUrl:
        "https://lh3.googleusercontent.com/moj1XrxBNJuZKyhL_Gql68Ah0I5WFXFc7WawYg0njOtOt7abPqNr9PFzR_BTu9-71NN3zz8CZ-mE7hLFqIFvsYxUlA=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/spacecy-wallet/mkchoaaiifodcflmbaphdgeidocajadp",
      },
    },
    "Surf Wallet": {
      logoUrl:
        "https://lh3.googleusercontent.com/sWQuDAnkwGqxzocmB8x8vDQWR7D1L6Of7GXFz7UNJ8TDb4UP9oE2iCjXZyT7tAjHCtZxjNhJjABzyHf5l3JgWIEn=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/surf-wallet/emeeapjkbcbpbpgaagfchmcgglmebnen",
        iOS: "https://apps.apple.com/us/app/surf-wallet/id6467386034",
        android:
          "https://play.google.com/store/apps/details?id=com.surf.suiwallet",
      },
    },
    "TokenPocket Wallet": {
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/tokenpocket-web3-nostr-wa/mfgccjchihfkkindfppnaooecgfneiii",
        iOS: "https://apps.apple.com/hk/app/tp-wallet-%E5%8A%A0%E5%AF%86-%E6%AF%94%E7%89%B9%E5%B9%A3%E9%8C%A2%E5%8C%85/id6444625622",
        android:
          "https://play.google.com/store/apps/details?id=vip.mytokenpocket",
      },
    },
  };

  const walletKitWallets = [...configuredWallets, ...detectedWallets]
    .map(
      (w) =>
        merge(
          {
            id: w.name,
            name: w.name,
            isInstalled: w.installed ?? false,
            logoUrl: w.iconUrl,
            downloadUrls: w.downloadUrl,
          },
          walletKitOverrides[w.name as keyof typeof walletKitOverrides] ?? {},
        ) as Wallet,
    )
    .filter((w) => w.id !== "TokenPocket Wallet");

  const customWallets = [
    {
      id: "OKX Wallet",
      name: "OKX Wallet",
      isInstalled: false,
      logoUrl:
        "https://lh3.googleusercontent.com/sO4GPPbgvTCXEFWp-uALYYju9vxVOr5YSr2jqRAclNFSq8FrAIVTQOYmpJV4kMuDM1ZazcgUdjNGLIGKpmMRvR3NzQ=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge",
        iOS: "https://apps.apple.com/us/app/okx-buy-bitcoin-btc-crypto/id1327268470",
        android:
          "https://play.google.com/store/apps/details?id=com.okinc.okex.gp",
      },
    },
    {
      id: "Bitget Wallet",
      name: "Bitget Wallet",
      isInstalled: false,
      logoUrl:
        "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/67/b9/68/67b9681d-9e68-5da3-7c17-badd8db67444/NewAppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/460x0w.webp", // Chrome Web Store logo doesn't have a transparent background
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/bitget-wallet-formerly-bi/jiidiaalihmmhddjgbnbgdfflelocpak",
        iOS: "https://apps.apple.com/us/app/bitget-wallet-ex-bitkeep/id1395301115",
        android:
          "https://play.google.com/store/apps/details?id=com.bitkeep.wallet",
      },
    },
    {
      id: "Coin98",
      name: "Coin98",
      isInstalled: false,
      logoUrl:
        "https://lh3.googleusercontent.com/-9HOHY2oGbRA8KVhPbN-FyIX0RHjvVPLzR3Gw1ESSIPzZk91Pj9riWWsR2IWQrDkcVSGW8OgBOzeMA7_xTF_7xm2=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg",
        iOS: "https://apps.apple.com/us/app/coin98-super-wallet/id1561969966",
        android:
          "https://play.google.com/store/apps/details?id=coin98.crypto.finance.media",
      },
    },
    {
      id: "Gate Wallet",
      name: "Gate Wallet",
      isInstalled: false,
      logoUrl:
        "https://lh3.googleusercontent.com/RjkrXU4ovz77JApt18xbtVzBF414DAtTznrZuSOa5ynqL8CstZlHCeUcPV0hAbj62rKCWwJejIfV8FYfHhCltgsL=s120",
      downloadUrls: {
        browserExtension:
          "https://chromewebstore.google.com/detail/gate-wallet/cpmkedoipcpimgecpmgpldfpohjplkpp",
        iOS: "https://apps.apple.com/gb/app/gate-io-buy-bitcoin-crypto/id1294998195",
        android:
          "https://play.google.com/store/apps/details?id=com.gateio.gateio",
      },
    },
  ] as Wallet[];

  const wallets = [...walletKitWallets];
  for (const wallet of customWallets) {
    if (!wallets.find((w) => w.id === wallet.id)) {
      wallets.push(wallet);
    }
  }

  const installedWallets = wallets.filter((w) => w.isInstalled);
  const priorityWallets = PRIORITY_WALLET_IDS.map((wId) =>
    wallets.find((w) => w.id === wId),
  ).filter(Boolean) as Wallet[];

  // Categorize wallets
  const sortedInstalledWallets = installedWallets.sort((wA, wB) => {
    const wAPriorityIndex = priorityWallets.findIndex((w) => w.id === wA.id);
    const wBPriorityIndex = priorityWallets.findIndex((w) => w.id === wB.id);

    if (wAPriorityIndex > -1 && wBPriorityIndex > -1)
      return wAPriorityIndex - wBPriorityIndex;
    if (wAPriorityIndex === -1 && wBPriorityIndex === -1) return 0;
    if (wAPriorityIndex > -1) return -1;
    return 1;
  });
  const notInstalledPriorityWallets = priorityWallets.filter(
    (w) => !sortedInstalledWallets.find((iw) => iw.id === w.id),
  );

  const mainWallets = [
    ...sortedInstalledWallets,
    ...notInstalledPriorityWallets,
  ];
  const otherWallets = wallets.filter(
    (w) => !mainWallets.find((iw) => iw.id === w.id),
  );

  return {
    mainWallets,
    otherWallets,
    wallets: [...mainWallets, ...otherWallets],
  };
};
