import { useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, Plus, MessagesSquare, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import CreatePostModal from "@/components/community/CreatePostModal";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const items = [
    {
      icon: Home,
      path: "/comunidade",
      label: "Início",
      isActive:
        location.pathname === "/comunidade" ||
        location.pathname === "/popular" ||
        location.pathname === "/feed",
    },
    {
      icon: Compass,
      path: "/nucleos",
      label: "Explorar",
      isActive: location.pathname.startsWith("/nucleo"),
    },
    { icon: Plus, label: "Criar", isCenter: true, isActive: false },
    {
      icon: MessagesSquare,
      path: "/chat",
      label: "Chat",
      isActive: location.pathname === "/chat",
    },
    {
      icon: User,
      path: "/perfil",
      label: "Perfil",
      isActive: location.pathname.startsWith("/perfil"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border lg:hidden safe-area-bottom">
      <div className="flex items-stretch justify-around min-h-14 px-1">
        {items.map((item) => {
          if (item.isCenter) {
            return (
              <div key={item.label} className="flex-1 flex items-center justify-center">
                <CreatePostModal
                  triggerNode={
                    <button
                      type="button"
                      aria-label="Criar post"
                      className="flex items-center justify-center min-h-11 min-w-11 -mt-3"
                    >
                      <span className="w-12 h-12 bg-gradient-to-r from-[#00C6FF] to-[#FF007F] rounded-xl flex items-center justify-center shadow-lg">
                        <Plus className="w-6 h-6 text-white" />
                      </span>
                    </button>
                  }
                />
              </div>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.path && navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 min-h-14 gap-0.5 transition-colors",
                item.isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className={cn("w-6 h-6", item.isActive && "stroke-[2.5]")} />
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
