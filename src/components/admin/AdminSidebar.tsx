import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  FileText,
  Tag,
  Hexagon,
  ShoppingBag,
  Trophy,
  Coins,
  Bell,
  CreditCard,
  BarChart3,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Lightbulb,
  MessageSquare,
  ShieldAlert,
  Activity,
  Settings,
  Gamepad2,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/admin/premio", label: "Área Premium", icon: Crown, highlight: true },
  { path: "/admin/assinaturas", label: "Assinaturas", icon: CreditCard },
  { path: "/admin/membros", label: "Membros", icon: Users },
  { path: "/admin/conteudo", label: "Moderação", icon: FileText },
  { path: "/admin/chat", label: "Chat Global", icon: MessageSquare },
  { path: "/admin/categorias", label: "Categorias", icon: Tag },
  { path: "/admin/nucleos", label: "Núcleos", icon: Hexagon },
  { path: "/admin/marketplace", label: "Marketplace", icon: ShoppingBag },
  { path: "/admin/denuncias", label: "Denúncias", icon: ShieldAlert },
  { path: "/admin/gamificacao", label: "Gamificação", icon: Trophy },
  { path: "/admin/jogos", label: "Jogos & Downloads", icon: Gamepad2 },
  { path: "/admin/coins", label: "Nexus Coins", icon: Coins },
  { path: "/admin/notificacoes", label: "Notificações", icon: Bell },
  { path: "/admin/feedback", label: "Feedback & Dicas", icon: Lightbulb },
  { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { path: "/admin/logs", label: "Logs de Auditoria", icon: Activity },
  { path: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const AdminSidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-white/10",
          collapsed && !isMobile && "justify-center",
        )}
      >
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm leading-tight">Nexus Admin</p>
              <p className="text-xs text-muted-foreground">Painel de Controle</p>
            </div>
          </div>
        )}
        {collapsed && !isMobile && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
        )}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-7 w-7 rounded-lg hover:bg-white/10"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          const highlight = "highlight" in item && item.highlight;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              title={collapsed && !isMobile ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                active
                  ? highlight
                    ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/40"
                    : "bg-gradient-to-r from-violet-500/20 to-purple-600/10 text-violet-400 border border-violet-500/30"
                  : highlight
                    ? "text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 border border-yellow-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                collapsed && !isMobile && "justify-center px-2",
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  active
                    ? highlight
                      ? "text-yellow-400"
                      : "text-violet-400"
                    : highlight
                      ? "text-yellow-400"
                      : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              {(!collapsed || isMobile) && <span>{item.label}</span>}
              {(!collapsed || isMobile) && active && (
                <div
                  className={cn(
                    "ml-auto w-1.5 h-1.5 rounded-full",
                    highlight ? "bg-yellow-400" : "bg-violet-400",
                  )}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn("p-3 border-t border-white/10 space-y-2")}>
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-white/5">
            <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.user_metadata?.name || user?.email?.split("@")[0]}
              </p>
              <Badge className="text-[10px] h-4 bg-violet-500/20 text-violet-400 border-violet-500/30 px-1.5">
                Admin
              </Badge>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          className={cn(
            "w-full flex items-center gap-2 px-3 min-h-11 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
            collapsed && !isMobile && "justify-center",
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {(!collapsed || isMobile) && "Sair"}
        </button>
      </div>
    </div>
  );

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed left-0 top-0 h-full w-64 z-50 transition-transform duration-300 bg-background/95 backdrop-blur border-r border-white/10",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarContent />
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full z-40 transition-all duration-300 bg-background/95 backdrop-blur border-r border-white/10",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <SidebarContent />
    </aside>
  );
};

export default AdminSidebar;
