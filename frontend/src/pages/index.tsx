import { ReactNode } from "react";

import Landing from "@/components/public/Landing";
import LandingMobile from "@/components/public/LandingMobile";

export default function Home() {
  return (
    <>
      <Landing />
      <LandingMobile />
    </>
  );
}
Home.getLayout = function getLayout(page: ReactNode) {
  return <div className="relative flex min-h-dvh flex-col">{page}</div>;
};
