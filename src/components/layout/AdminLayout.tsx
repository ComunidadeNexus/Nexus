import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminRoute from "@/components/AdminRoute";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content Area */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-screen transition-all duration-300",
            !isMobile && (collapsed ? "ml-16" : "ml-64"),
          )}
        >
          {/* Mobile Header for hamburger menu */}
          {isMobile && (
            <div className="sticky top-0 z-30 flex items-center p-4 border-b border-white/10 bg-background/95 backdrop-blur">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
                <Menu className="w-6 h-6" />
              </Button>
              <h1 className="ml-4 font-bold text-lg gradient-text">Nexus Admin</h1>
            </div>
          )}

          {/* Page Content */}
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
