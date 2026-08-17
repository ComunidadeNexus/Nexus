import { cn } from "@/lib/utils";
import { Clock, TrendingUp, Pin } from "lucide-react";

export type FilterType = "recent" | "popular" | "pinned";

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { value: FilterType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "recent", label: "Recentes", icon: Clock },
  { value: "popular", label: "Populares", icon: TrendingUp },
  { value: "pinned", label: "Fixados", icon: Pin },
];

const FilterTabs = ({ activeFilter, onFilterChange }: FilterTabsProps) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
      {filters.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
            activeFilter === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
