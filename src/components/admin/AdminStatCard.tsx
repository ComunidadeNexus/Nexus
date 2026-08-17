import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  colorClass?: string;
  bgClass?: string;
}

const AdminStatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  colorClass = "text-violet-400",
  bgClass = "bg-violet-500/10",
}: AdminStatCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 hover:bg-white/8 transition-all duration-300 group">
      {/* Glow effect */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 blur-2xl bg-violet-500 group-hover:opacity-20 transition-opacity" />

      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">
            {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
          </p>
          {(trend || trendLabel) && (
            <div className="flex items-center gap-1 text-xs">
              {trend === "up" && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />}
              {trend === "down" && <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
              {trend === "neutral" && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
              <span className={cn(
                trend === "up" && "text-emerald-500",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-muted-foreground",
              )}>
                {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", bgClass)}>
          <Icon className={cn("w-6 h-6", colorClass)} />
        </div>
      </div>
    </div>
  );
};

export default AdminStatCard;
