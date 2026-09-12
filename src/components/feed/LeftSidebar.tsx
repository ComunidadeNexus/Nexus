import React, { useState } from "react";
import {
  Home,
  TrendingUp,
  Newspaper,
  Compass,
  Plus,
  Briefcase,
  Star,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  MessageCircle,
  Globe,
  GraduationCap,
  Gamepad2,
  Tv,
  BookOpen,
  Smartphone,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import CreateNucleoModal from "../nucleos/CreateNucleoModal";
import { useCategories } from "@/hooks/useCategories";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { cn } from "@/lib/utils";

interface LeftSidebarProps {
  variant?: "desktop" | "drawer";
  onNavigate?: () => void;
  onCreateNucleo?: () => void;
  className?: string;
}

const LeftSidebar = ({
  variant = "desktop",
  onNavigate,
  onCreateNucleo,
  className,
}: LeftSidebarProps) => {
  const [topicsOpen, setTopicsOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [isCreateNucleoOpen, setIsCreateNucleoOpen] = useState(false);
  const location = useLocation();
  const { categories } = useCategories();
  const currentCategory = new URLSearchParams(location.search).get("categoria");
  const isHomePath = location.pathname === "/feed" || location.pathname === "/comunidade";

  const getNavItemClass = (path: string) => {
    const [pathname, queryString] = path.split("?");
    const linkCategory = queryString ? new URLSearchParams(queryString).get("categoria") : null;

    let isActive = false;
    if (linkCategory) {
      isActive = currentCategory === linkCategory;
    } else if (pathname === "/feed") {
      isActive = isHomePath && !currentCategory;
    } else {
      isActive =
        location.pathname === pathname || (pathname === "/feed" && location.pathname === "/");
    }
    if (isActive) {
      return "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#00C6FF] to-[#FF007F] text-white shadow-md cursor-pointer w-full transition-all";
    }
    return "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#2A3B42] transition-colors cursor-pointer w-full text-gray-800 dark:text-gray-200";
  };

  const sectionTitleClass =
    "text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-1 mt-4 flex items-center justify-between cursor-pointer hover:text-primary transition-colors";

  const handleNavClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!onNavigate) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest("a")) {
      onNavigate();
    }
  };

  const handleCreateNucleo = () => {
    if (onCreateNucleo) {
      onCreateNucleo();
      return;
    }
    setIsCreateNucleoOpen(true);
  };

  return (
    <nav
      aria-label="Navegação principal"
      onClick={handleNavClick}
      className={cn(
        variant === "drawer"
          ? "h-full overflow-y-auto custom-scrollbar px-2 pt-12 pb-8"
          : "bg-transparent h-[calc(100vh-60px)] sticky top-[60px] overflow-y-auto pb-20 custom-scrollbar pr-2 mt-2",
        className,
      )}
    >
      {/* Feeds */}
      <div className="mb-4">
        <Link to="/feed" className={getNavItemClass("/feed")}>
          <Home className="w-5 h-5" />
          <span>Início</span>
        </Link>
        <Link to="/popular" className={getNavItemClass("/popular")}>
          <TrendingUp className="w-5 h-5" />
          <span>Popular</span>
        </Link>
        <Link to="/noticias" className={getNavItemClass("/noticias")}>
          <Newspaper className="w-5 h-5" />
          <span>Notícias</span>
        </Link>
        <Link to="/nucleos" className={getNavItemClass("/nucleos")}>
          <Compass className="w-5 h-5" />
          <span>Explorar</span>
        </Link>
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-3"></div>

      {/* Categorias (Assuntos) */}
      <div className="mb-2">
        <div className={sectionTitleClass} onClick={() => setCategoriesOpen(!categoriesOpen)}>
          <span>Assuntos</span>
          {categoriesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
        {categoriesOpen && (
          <div className="flex flex-col gap-0.5 mt-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/feed?categoria=${category.slug}`}
                className={getNavItemClass(`/feed?categoria=${category.slug}`)}
              >
                <div className="w-5 flex justify-center text-gray-400">
                  <DynamicIcon name={category.icon} size={16} />
                </div>
                <span
                  style={{
                    color: currentCategory === category.slug ? undefined : category.color,
                  }}
                  className={
                    currentCategory === category.slug
                      ? ""
                      : "font-medium brightness-90 saturate-150 dark:brightness-110"
                  }
                >
                  {category.name}
                </span>
                {category.is_premium_only && <Star className="w-3 h-3 ml-auto text-yellow-500" />}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-3"></div>

      {/* Plataforma */}
      <div className="mb-2">
        <div className={sectionTitleClass} onClick={() => setTopicsOpen(!topicsOpen)}>
          <span>Plataforma</span>
          {topicsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {topicsOpen && (
          <div className="flex flex-col gap-0.5 mt-2">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium w-full text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5" />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-500">
                  Nexus Academy
                </span>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 px-1.5 py-0"
              >
                Em breve
              </Badge>
            </div>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium w-full text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70">
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5" />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-500">
                  Hub de Games
                </span>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 px-1.5 py-0"
              >
                Em breve
              </Badge>
            </div>
            <Link to="/ao-vivo" className={getNavItemClass("/ao-vivo")}>
              <Tv className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-600">
                Ao Vivo (Twitch)
              </span>
            </Link>
            <Link to="/mensagens" className={getNavItemClass("/mensagens")}>
              <MessageCircle className="w-5 h-5" />
              <span>Mensagens</span>
            </Link>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium w-full text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70">
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5" />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-500">
                  Marketplace
                </span>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 px-1.5 py-0"
              >
                Em breve
              </Badge>
            </div>
            <Link to="/chat" className={getNavItemClass("/chat")}>
              <Globe className="w-5 h-5" />
              <span>Chat Global</span>
            </Link>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium w-full text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5" />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-500">
                  Área Premium
                </span>
              </div>
              <Badge
                variant="secondary"
                className="text-[10px] bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 px-1.5 py-0"
              >
                Em breve
              </Badge>
            </div>
            <button
              type="button"
              onClick={handleCreateNucleo}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#2A3B42] transition-colors cursor-pointer w-full text-gray-800 dark:text-gray-200 text-left"
            >
              <Plus className="w-5 h-5" />
              <span>Criar Comunidade</span>
            </button>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-3"></div>

      {/* Recursos */}
      <div className="mb-2">
        <div className={sectionTitleClass} onClick={() => setResourcesOpen(!resourcesOpen)}>
          <span>Recursos</span>
          {resourcesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>

        {resourcesOpen && (
          <div className="flex flex-col gap-0.5 mt-2">
            <Link to="/regras" className={getNavItemClass("/regras")}>
              <BookOpen className="w-5 h-5" />
              <span>Regras da Comunidade</span>
            </Link>
            <Link to="/sobre" className={getNavItemClass("/sobre")}>
              <Info className="w-5 h-5" />
              <span>Sobre o Nexus</span>
            </Link>
            <Link to="/instalar" className={getNavItemClass("/instalar")}>
              <Smartphone className="w-5 h-5" />
              <span>Instalar app</span>
            </Link>
          </div>
        )}
      </div>

      <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-3"></div>

      {!onCreateNucleo && (
        <CreateNucleoModal open={isCreateNucleoOpen} onOpenChange={setIsCreateNucleoOpen} />
      )}
    </nav>
  );
};

export default LeftSidebar;
