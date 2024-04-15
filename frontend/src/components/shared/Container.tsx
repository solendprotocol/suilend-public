import { PropsWithChildren } from "react";

export default function Container({ children }: PropsWithChildren) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 md:px-10">
      {children}
    </div>
  );
}
