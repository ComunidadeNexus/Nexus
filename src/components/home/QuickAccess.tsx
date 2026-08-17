import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAccessItem {
  icon: LucideIcon;
  label: string;
  path: string;
  color: string;
}

interface QuickAccessProps {
  items: QuickAccessItem[];
}

const QuickAccess = ({ items }: QuickAccessProps) => {
  const navigate = useNavigate();

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Acesso Rápido</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "group relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl",
              "bg-card/50 border border-border/50 backdrop-blur-sm",
              "hover:border-primary/50 hover:bg-card/80 transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1"
            )}
          >
            <div className={cn(
              "p-3 rounded-xl bg-gradient-to-br",
              item.color,
              "group-hover:scale-110 transition-transform duration-300"
            )}>
              <item.icon className="w-6 h-6 text-white" />
            </div>
            <span className="font-medium text-sm text-foreground">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickAccess;
