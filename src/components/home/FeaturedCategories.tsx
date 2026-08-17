import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { 
  Megaphone, HelpCircle, MessageSquare, Calendar, Lightbulb, 
  Wrench, Trophy, Bookmark, Heart, Star, Loader2
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

const FeaturedCategories = () => {
  const navigate = useNavigate();
  const { categories, isLoading: loading } = useCategories();

  const handleCategoryClick = (slug: string) => {
    navigate(`/comunidade?categoria=${slug}`);
  };

  if (loading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const visibleCategories = categories.filter(c => c.is_active).slice(0, 8);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Categorias</h2>
        <button
          onClick={() => navigate("/comunidade")}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Ver todas
        </button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {visibleCategories.map((category) => {
          const IconComponent = iconMap[category.icon] || MessageSquare;
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap",
                "bg-card/50 border border-border/50 backdrop-blur-sm",
                "hover:border-primary/50 hover:bg-card/80 transition-all duration-200",
                "hover:shadow-md hover:shadow-primary/5"
              )}
              style={{ 
                borderColor: `${category.color}30`,
              }}
            >
              <IconComponent 
                className="w-4 h-4 flex-shrink-0" 
                style={{ color: category.color }} 
              />
              <span className="text-sm font-medium text-foreground">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedCategories;
