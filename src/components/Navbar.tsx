import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Zap,
  LogOut,
  User,
  Shield,
  MessageCircle,
  Store,
  Home,
  Users,
  Coins,
  Hexagon,
  MessagesSquare,
  Crown,
  BarChart3,
  Settings,
  Search,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import WalletModal from "@/components/coins/WalletModal";
import NotificationBell from "@/components/notifications/NotificationBell";
import ThemeToggle from "@/components/theme/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { isAdmin } = useAdmin();
  const { subscribed, tier } = useSubscription();

  const isActive = (path: string) => location.pathname === path;
  const isAppPage = user && location.pathname !== "/";

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer -ml-4" onClick={() => navigate("/")}>
            <img
              src="/logo-nexus.png"
              alt="Nexus Logo"
              className="h-28 w-auto object-contain scale-125 origin-left"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isAppPage ? (
              <>
                <button
                  onClick={() => navigate("/")}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isActive("/") ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Home className="w-4 h-4" />
                  Início
                </button>
                <button
                  onClick={() => navigate("/comunidade")}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isActive("/comunidade")
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Users className="w-4 h-4" />
                  Feed
                </button>
                <button
                  onClick={() => navigate("/nucleos")}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isActive("/nucleos") || location.pathname.startsWith("/nucleos")
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Hexagon className="w-4 h-4" />
                  Núcleos
                </button>
                <button
                  onClick={() => navigate("/marketplace")}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    isActive("/marketplace")
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Store className="w-4 h-4" />
                  Loja
                </button>
                <button
                  onClick={() => navigate("/mensagens")}
                  className={cn(
                    "flex items-center gap-2 transition-colors",
                    location.pathname.startsWith("/mensagens")
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  Início
                </button>
                {user ? (
                  <button
                    onClick={() => navigate("/comunidade")}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Comunidade
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/auth")}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    Entrar na Comunidade
                  </button>
                )}
              </>
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {!loading && user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/busca")}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white relative"
              >
                <Search className="w-5 h-5" />
              </Button>
            )}
            {!loading && user && <NotificationBell />}
            {!loading && user && <WalletModal />}
            {!loading &&
              (user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        {isAdmin ? (
                          <Shield className="w-4 h-4 text-primary" />
                        ) : (
                          <User className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <span className="max-w-[100px] truncate">
                        {user.user_metadata?.name || user.email?.split("@")[0]}
                      </span>
                      {subscribed && tier !== "free" && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-500/20 text-yellow-500 text-xs"
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          {tier === "enterprise" ? "Enterprise" : "Pro"}
                        </Badge>
                      )}
                      {isAdmin && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                          Admin
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => navigate("/perfil")}
                      className="cursor-pointer"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </DropdownMenuItem>
                    {tier === "enterprise" && (
                      <DropdownMenuItem
                        onClick={() => navigate("/analytics")}
                        className="cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 mr-2 text-primary" />
                        Analytics
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => navigate("/premium")}
                      className="cursor-pointer font-medium text-yellow-500"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Área Premium
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/mensagens")}
                      className="cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Mensagens
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/marketplace")}
                      className="cursor-pointer"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Marketplace
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/nucleos")}
                      className="cursor-pointer"
                    >
                      <Hexagon className="w-4 h-4 mr-2" />
                      Núcleos
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <WalletModal
                        trigger={
                          <button className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer">
                            <Coins className="w-4 h-4 mr-2 text-yellow-500" />
                            Nexus Coins
                          </button>
                        }
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/configuracoes")}
                      className="cursor-pointer"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate("/regras")}
                      className="cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Regras da Comunidade
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")}>
                    Entrar
                  </Button>
                  <Button variant="gradient" onClick={() => navigate("/auth?mode=signup")}>
                    Cadastrar
                  </Button>
                </>
              ))}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              {isAppPage ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/");
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 text-left transition-colors",
                      isActive("/")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Home className="w-4 h-4" />
                    Início
                  </button>
                  <button
                    onClick={() => {
                      navigate("/comunidade");
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 text-left transition-colors",
                      isActive("/comunidade")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Users className="w-4 h-4" />
                    Feed
                  </button>
                  <button
                    onClick={() => {
                      navigate("/nucleos");
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 text-left transition-colors",
                      isActive("/nucleos") || location.pathname.startsWith("/nucleos")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Hexagon className="w-4 h-4" />
                    Núcleos
                  </button>
                  <button
                    onClick={() => {
                      navigate("/marketplace");
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 text-left transition-colors",
                      isActive("/marketplace")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Store className="w-4 h-4" />
                    Loja
                  </button>
                  <button
                    onClick={() => {
                      navigate("/mensagens");
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 text-left transition-colors",
                      location.pathname.startsWith("/mensagens")
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-muted-foreground hover:text-white transition-colors"
                  >
                    Início
                  </button>
                  {user ? (
                    <button
                      onClick={() => {
                        navigate("/comunidade");
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-muted-foreground hover:text-white transition-colors"
                    >
                      Comunidade
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        navigate("/auth");
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-muted-foreground hover:text-white transition-colors"
                    >
                      Entrar na Comunidade
                    </button>
                  )}
                </>
              )}
              <div className="flex flex-col gap-2 pt-4">
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/perfil");
                        setIsMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/regras");
                        setIsMenuOpen(false);
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Regras da Comunidade
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="w-full" onClick={() => navigate("/auth")}>
                      Entrar
                    </Button>
                    <Button
                      variant="gradient"
                      className="w-full"
                      onClick={() => navigate("/auth?mode=signup")}
                    >
                      Cadastrar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
