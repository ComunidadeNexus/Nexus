import React from "react";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import FeedHeader from "./FeedHeader";
import BottomNavigation from "@/components/BottomNavigation";

interface FeedLayoutProps {
  children: React.ReactNode;
  hideRightSidebar?: boolean;
  flushMobile?: boolean;
}

const FeedLayout = ({
  children,
  hideRightSidebar = false,
  flushMobile = false,
}: FeedLayoutProps) => {
  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#DAE0E6] dark:bg-[#030303] flex flex-col">
      <FeedHeader />

      <div
        className={`flex-1 w-full max-w-[1280px] mx-auto flex justify-center gap-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-8 min-w-0 ${
          flushMobile ? "pt-0 md:pt-6 px-0 md:px-4" : "pt-4 md:pt-6 px-3 sm:px-4"
        }`}
      >
        <div className="hidden md:block w-[270px] shrink-0">
          <LeftSidebar />
        </div>

        <main
          className={`flex-1 w-full min-w-0 ${hideRightSidebar ? "max-w-[1000px]" : "max-w-[640px]"}`}
        >
          {children}
        </main>

        {!hideRightSidebar && (
          <div className="hidden xl:block w-[310px] shrink-0">
            <RightSidebar />
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default FeedLayout;
