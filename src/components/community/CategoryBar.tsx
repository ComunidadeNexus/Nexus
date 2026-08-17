import { useRef, useEffect } from "react";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { Loader2, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Megaphone, HelpCircle, MessageSquare, Calendar, Lightbulb, 
  Wrench, Trophy, Bookmark, Heart, Star
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  megaphone: Megaphone,
  "help-circle": HelpCircle,
  "message-square": MessageSquare,
  calendar: Calendar,
  lightbulb: Lightbulb,
  wrench: Wrench,
  trophy: Trophy,
  bookmark: Bookmark,
  heart: Heart,
  star: Star,
};

interface CategoryBarProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const CategoryBar = ({ selectedCategory, onSelectCategory }: CategoryBarProps) => {
  const { categories, isLoading: loading } = useCategories();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll to selected category
  useEffect(() => {
    if (selectedCategory && scrollRef.current) {
      const selectedButton = scrollRef.current.querySelector(`[data-category-id="${selectedCategory}"]`);
      if (selectedButton) {
        selectedButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  const activeCategories = categories.filter(c => c.is_active);

  return (
    <div className="relative group">
      {/* Scroll Buttons - Desktop only */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-background/90 backdrop-blur-sm border border-border rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 bg-background/90 backdrop-blur-sm border border-border rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Categories Scroll Container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1 -mx-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* All Categories Button */}
        <button
          onClick={() => onSelectCategory(null)}
          data-category-id="all"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200",
            "border text-sm font-medium flex-shrink-0",
            !selectedCategory
              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
              : "bg-card/50 border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-card"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Todos</span>
        </button>

        {/* Category Buttons */}
        {activeCategories.map((category) => {
          const IconComponent = iconMap[category.icon] || MessageSquare;
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              data-category-id={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200",
                "border text-sm font-medium flex-shrink-0",
                isSelected
                  ? "shadow-md"
                  : "bg-card/50 border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-card"
              )}
              style={isSelected ? {
                backgroundColor: category.color,
                borderColor: category.color,
                color: "#fff",
                boxShadow: `0 4px 14px ${category.color}40`,
              } : {
                borderColor: `${category.color}30`,
              }}
            >
              <IconComponent className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;
