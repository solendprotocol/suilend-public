import { PropsWithChildren } from "react";

import { ClassValue } from "clsx";

import { TabsList, Tabs as TabsRoot, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  title: string;
}
interface TabsProps extends PropsWithChildren {
  tabs: Tab[];
  selectedTab: string;
  onTabChange: (tab: string) => void;
  listClassName?: ClassValue;
}

export default function Tabs({
  tabs,
  selectedTab,
  onTabChange,
  listClassName,
  children,
}: TabsProps) {
  return (
    <TabsRoot value={selectedTab as string} onValueChange={onTabChange}>
      <TabsList
        className={cn(
          "mb-4 flex h-fit w-full flex-row border bg-card",
          listClassName,
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            className="h-11 flex-1 px-0 font-normal uppercase text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            value={tab.id}
          >
            {tab.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {children}
    </TabsRoot>
  );
}
