import { PropsWithChildren } from "react";

export default function Grid({ children }: PropsWithChildren) {
  return (
    <div className="grid w-full grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 md:gap-y-6">
      {children}
    </div>
  );
}
