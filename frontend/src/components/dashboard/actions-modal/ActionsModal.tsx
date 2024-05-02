import ActionsModalContainer from "@/components/dashboard/actions-modal/ActionsModalContainer";
import {
  Tab,
  useActionsModalContext,
} from "@/components/dashboard/actions-modal/ActionsModalContext";
import BorrowTabContent from "@/components/dashboard/actions-modal/BorrowTabContent";
import DepositTabContent from "@/components/dashboard/actions-modal/DepositTabContent";
import ParametersPanel from "@/components/dashboard/actions-modal/ParametersPanel";
import RepayTabContent from "@/components/dashboard/actions-modal/RepayTabContent";
import WithdrawTabContent from "@/components/dashboard/actions-modal/WithdrawTabContent";
import Tabs from "@/components/shared/Tabs";
import { AppData, useAppContext } from "@/contexts/AppContext";
import useBreakpoint from "@/hooks/useBreakpoint";

export default function ActionsModal() {
  const appContext = useAppContext();
  const data = appContext.data as AppData;
  const { reserveIndex, selectedTab, setSelectedTab, isMoreParametersOpen } =
    useActionsModalContext();

  const { md } = useBreakpoint();

  // Reserve
  const reserve =
    reserveIndex !== undefined
      ? data.lendingMarket.reserves[reserveIndex]
      : undefined;

  // Tabs
  const tabs = [
    { id: Tab.DEPOSIT, title: "Deposit" },
    { id: Tab.BORROW, title: "Borrow" },
    { id: Tab.WITHDRAW, title: "Withdraw" },
    { id: Tab.REPAY, title: "Repay" },
  ];

  return (
    <ActionsModalContainer>
      <Tabs
        tabs={tabs}
        selectedTab={selectedTab}
        onTabChange={(tab) => setSelectedTab(tab as Tab)}
      >
        <div
          className="flex flex-col gap-4 md:!h-auto md:flex-row md:items-stretch"
          style={{
            height: isMoreParametersOpen
              ? `calc(100dvh - ${0 /* Drawer margin-top */}px - ${1 /* Drawer border-top */}px - ${16 /* Drawer padding-top */}px - ${70 /* Tabs */}px - ${16 /* Drawer padding-bottom */}px - ${1 /* Drawer border-bottom */}px)`
              : "auto",
          }}
        >
          {reserve && (
            <>
              <div className="flex h-full w-full flex-col gap-4 md:h-auto md:w-[400px]">
                {selectedTab === Tab.DEPOSIT && (
                  <DepositTabContent reserve={reserve} />
                )}
                {selectedTab === Tab.BORROW && (
                  <BorrowTabContent reserve={reserve} />
                )}
                {selectedTab === Tab.WITHDRAW && (
                  <WithdrawTabContent reserve={reserve} />
                )}
                {selectedTab === Tab.REPAY && (
                  <RepayTabContent reserve={reserve} />
                )}
              </div>

              {md && isMoreParametersOpen && (
                <div className="flex w-[500px] flex-col gap-4 rounded-md border p-4 pb-2">
                  <ParametersPanel reserve={reserve} />
                </div>
              )}
            </>
          )}
        </div>
      </Tabs>
    </ActionsModalContainer>
  );
}
