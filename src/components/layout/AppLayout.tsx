import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import FeedLayout from "@/components/feed/FeedLayout";
import { FloatingHelpButtons } from "./FloatingHelpButtons";

const AppLayout = () => {
  const location = useLocation();
  // Mostra o sidebar direito apenas no feed e no popular
  const hideRightSidebar =
    location.pathname !== "/feed" &&
    location.pathname !== "/comunidade" &&
    location.pathname !== "/popular";

  return (
    <>
      <FeedLayout hideRightSidebar={hideRightSidebar}>
        <Outlet />
      </FeedLayout>
      <FloatingHelpButtons />
    </>
  );
};

export default AppLayout;
