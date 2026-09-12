import React, { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  MessageCircle,
  PlusSquare,
  MoreHorizontal,
  User as UserIcon,
  LogOut,
  Settings,
  Moon,
  Tv,
  Globe,
  Shield,
  Smartphone,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme/ThemeProvider";
import CreatePostModal from "@/components/community/CreatePostModal";
import MobileNavDrawer from "@/components/feed/MobileNavDrawer";
import { usePwaInstall } from "@/hooks/usePwaInstall";

const FeedHeader = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { isInstalled } = usePwaInstall();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState(
    () => new URLSearchParams(window.location.search).get("q") || "",
  );

  const handleLogout = () => {
    void signOut();
  };

  const displayName = profile?.name || profile?.username || "Usuário";
  const avatarUrl = profile?.avatar_url;

  useEffect(() => {
    if (location.pathname === "/busca") {
      setSearchQuery(new URLSearchParams(location.search).get("q") || "");
    }
  }, [location.pathname, location.search]);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = searchQuery.trim();
    navigate(q ? `/busca?q=${encodeURIComponent(q)}` : "/busca");
  };

  return (
    <div className="sticky top-0 z-50 w-full max-w-[100vw] h-14 bg-white dark:bg-[#1A282D] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-1.5 md:gap-2 px-2 sm:px-4 overflow-hidden">
      {/* Left: mobile hamburger + logo */}
      <div className="flex items-center shrink-0 min-w-0">
        <MobileNavDrawer />
        <Link to="/comunidade" className="flex items-center min-w-0">
          <img
            src="/logo-nexus.png"
            alt="Nexus Logo"
            className="h-8 md:h-12 w-auto max-w-[100px] md:max-w-[180px] object-contain object-left"
          />
        </Link>
      </div>

      <form onSubmit={submitSearch} className="flex-1 min-w-0 max-w-2xl px-1 sm:px-4" role="search">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-gray-500 transition-colors" />
          </div>
          <input
            type="search"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar no Nexus"
            autoComplete="off"
            enterKeyHint="search"
            aria-label="Pesquisar no Nexus"
            className="block w-full min-w-0 pl-8 sm:pl-10 pr-3 py-2 h-11 md:h-10 border border-transparent rounded-full leading-5 bg-gray-100 dark:bg-[#2A3B42] text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#1A282D] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
          />
        </div>
      </form>

      {/* Right: Auth & Actions */}
      <div className="flex items-center justify-end gap-0.5 sm:gap-1 shrink-0 min-w-0">
        {!user ? (
          <>
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="hidden sm:block px-4 py-2 text-sm font-bold text-primary bg-transparent hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="min-h-11 px-4 text-sm font-bold text-white bg-gradient-to-r from-[#00C6FF] to-[#FF007F] hover:opacity-90 rounded-full transition-colors shadow-sm"
            >
              Entrar
            </button>
            <button
              type="button"
              className="min-h-11 min-w-11 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => navigate("/mensagens")}
              className="min-h-11 min-w-11 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors"
              title="Mensagens"
              aria-label="Mensagens"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <div className="hidden sm:block">
              <CreatePostModal
                triggerNode={
                  <button
                    type="button"
                    className="flex items-center gap-2 min-h-11 p-2 px-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors text-sm font-semibold hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <PlusSquare className="w-5 h-5 stroke-[1.5]" />
                    Criar
                  </button>
                }
              />
            </div>

            <button
              type="button"
              onClick={() => navigate("/notificacoes")}
              className="min-h-11 min-w-11 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors"
              title="Notificações"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-center min-h-11 min-w-11 p-1 hover:border-gray-200 border border-transparent dark:hover:border-gray-700 rounded-lg transition-colors"
                  aria-label="Menu da conta"
                >
                  <Avatar className="w-7 h-7">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:flex flex-col items-start text-xs text-left w-20 ml-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 truncate w-full">
                      {displayName}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-[#1A282D] border-gray-200 dark:border-gray-800"
              >
                <DropdownMenuItem
                  onClick={() => navigate("/perfil")}
                  className="cursor-pointer gap-2 min-h-11"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/chat")}
                  className="cursor-pointer gap-2 min-h-11"
                >
                  <Globe className="w-4 h-4" />
                  <span>Chat Global</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/ao-vivo")}
                  className="cursor-pointer gap-2 min-h-11"
                >
                  <Tv className="w-4 h-4" />
                  <span>Ao Vivo</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="cursor-pointer gap-2 min-h-11"
                >
                  <Moon className="w-4 h-4" />
                  <span>Modo {theme === "dark" ? "Claro" : "Escuro"}</span>
                </DropdownMenuItem>
                {!isInstalled && (
                  <DropdownMenuItem
                    onClick={() => navigate("/instalar")}
                    className="cursor-pointer gap-2 min-h-11"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Instalar app</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => navigate("/configuracoes")}
                  className="cursor-pointer gap-2 min-h-11"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                {user && isAdmin && (
                  <DropdownMenuItem
                    onClick={() => navigate("/admin")}
                    className="cursor-pointer gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Painel Admin</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuItem
                  onSelect={handleLogout}
                  className="cursor-pointer gap-2 text-red-500 focus:text-red-500 min-h-11"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedHeader;
