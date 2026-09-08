import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  MessageCircle,
  Plus,
  PlusSquare,
  MoreHorizontal,
  User as UserIcon,
  LogOut,
  Settings,
  Moon,
  Lightbulb,
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
  const karma = profile?.karma || 1;

  return (
    <div className="sticky top-0 z-50 w-full h-14 bg-white dark:bg-[#1A282D] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 min-w-[200px] -ml-2">
        <Link to="/feed" className="flex items-center">
          <img
            src="/logo-nexus.png"
            alt="Nexus Logo"
            className="h-20 w-auto object-contain scale-125 origin-left"
          />
        </Link>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-2xl px-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar no Nexus"
            autoComplete="off"
            className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-full leading-5 bg-gray-100 dark:bg-[#2A3B42] text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#1A282D] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-all hover:bg-gray-200 dark:hover:bg-[#344850]"
          />
        </div>
      </div>

      {/* Right: Auth & Actions */}
      <div className="flex items-center justify-end gap-2 min-w-[200px]">
        {!user ? (
          <>
            <button
              onClick={() => navigate("/auth")}
              className="hidden sm:block px-4 py-2 text-sm font-bold text-primary bg-transparent hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#00C6FF] to-[#FF007F] hover:opacity-90 rounded-full transition-colors shadow-sm"
            >
              Entrar
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/mensagens")}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors hidden sm:block"
              title="Mensagens"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            <CreatePostModal
              triggerNode={
                <button className="hidden sm:flex items-center gap-2 p-2 px-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors ml-1 mr-1 text-sm font-semibold hover:text-gray-900 dark:hover:text-gray-100">
                  <PlusSquare className="w-5 h-5 stroke-[1.5]" />
                  Criar
                </button>
              }
            />

            <button
              onClick={() => navigate("/notificacoes")}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-full transition-colors hidden sm:block"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 pl-2 hover:border-gray-200 border border-transparent dark:hover:border-gray-700 rounded-lg transition-colors ml-1">
                  <Avatar className="w-7 h-7">
                    {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start text-xs text-left w-20">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 truncate w-full">
                      {displayName}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-white dark:bg-[#1A282D] border-gray-200 dark:border-gray-800"
              >
                <DropdownMenuItem
                  onClick={() => navigate("/perfil")}
                  className="cursor-pointer gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="cursor-pointer gap-2"
                >
                  <Moon className="w-4 h-4" />
                  <span>Modo {theme === "dark" ? "Claro" : "Escuro"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/configuracoes")}
                  className="cursor-pointer gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 text-red-500 focus:text-red-500"
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
