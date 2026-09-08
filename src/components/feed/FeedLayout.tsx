import React from "react";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import FeedHeader from "./FeedHeader";

interface FeedLayoutProps {
  children: React.ReactNode;
  hideRightSidebar?: boolean;
}

const FeedLayout = ({ children, hideRightSidebar = false }: FeedLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#DAE0E6] dark:bg-[#030303] flex flex-col">
      <FeedHeader />

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[1280px] mx-auto flex justify-center pt-6 px-4 gap-6">
        {/* Left Sidebar (Hidden on mobile) */}
        <div className="hidden lg:block w-[270px] shrink-0">
          <LeftSidebar />
        </div>

        {/* Center Feed Content */}
        <main
          className={`flex-1 w-full min-w-0 ${hideRightSidebar ? "max-w-[1000px]" : "max-w-[640px]"}`}
        >
          {children}
        </main>

        {/* Right Sidebar (Hidden on small screens) */}
        {!hideRightSidebar && (
          <div className="hidden xl:block w-[310px] shrink-0">
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedLayout;
