import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import FeedLayout from "@/components/feed/FeedLayout";
import { FloatingHelpButtons } from "./FloatingHelpButtons";

const HIDE_FAB_PREFIXES = ["/chat", "/mensagens", "/ao-vivo"];

const AppLayout = () => {
  const location = useLocation();
  const hideRightSidebar =
    location.pathname !== "/feed" &&
    location.pathname !== "/comunidade" &&
    location.pathname !== "/popular";

  const hideFabs = HIDE_FAB_PREFIXES.some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`),
  );

  return (
    <>
      <FeedLayout hideRightSidebar={hideRightSidebar}>
        <Outlet />
      </FeedLayout>
      {!hideFabs && <FloatingHelpButtons />}
    </>
  );
};

export default AppLayout;
