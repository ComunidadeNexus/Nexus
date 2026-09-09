import React from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
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

const FeedHeader = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const displayName = profile?.name || profile?.username || "Usuário";
  const avatarUrl = profile?.avatar_url;

  const goToSearch = () => navigate("/busca");

  return (
    <div className="sticky top-0 z-50 w-full max-w-[100vw] h-14 bg-white dark:bg-[#1A282D] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-2 px-2 sm:px-4 overflow-hidden">
      {/* Left: Logo */}
      <div className="flex items-center shrink-0 min-w-0">
        <Link to="/comunidade" className="flex items-center min-w-0">
          <img
            src="/logo-nexus.png"
            alt="Nexus Logo"
            className="h-9 sm:h-12 w-auto max-w-[118px] sm:max-w-[180px] object-contain object-left"
          />
        </Link>
      </div>

      {/* Center: Search Bar (desktop/tablet) */}
      <div className="hidden sm:block flex-1 max-w-2xl px-4 min-w-0">
        <button
          type="button"
          onClick={goToSearch}
          className="relative group w-full text-left"
          aria-label="Pesquisar no Nexus"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors" />
          </div>
          <span className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-gray-100 dark:bg-[#2A3B42] text-gray-500 sm:text-sm">
            Pesquisar no Nexus
          </span>
        </button>
      </div>

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
              onClick={goToSearch}
              className="sm:hidden min-h-11 min-w-11 p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors"
              title="Buscar"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

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
                <DropdownMenuItem
                  onClick={() => navigate("/configuracoes")}
                  className="cursor-pointer gap-2 min-h-11"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
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
