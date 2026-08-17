import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  BookOpen, Megaphone, MessageCircle, HelpCircle, GraduationCap,
  FolderKanban, Trophy, Briefcase, Calendar, Crown, MessageSquarePlus, Coffee,
  LayoutGrid, ChevronRight, Loader2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  is_admin_only: boolean;
  is_premium_only: boolean;
  order_position: number;
}

interface CategorySidebarProps {
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "book-open": BookOpen,
  "megaphone": Megaphone,
  "message-circle": MessageCircle,
  "help-circle": HelpCircle,
  "graduation-cap": GraduationCap,
  "folder-kanban": FolderKanban,
  "trophy": Trophy,
  "briefcase": Briefcase,
  "calendar": Calendar,
  "crown": Crown,
  "message-square-plus": MessageSquarePlus,
  "coffee": Coffee,
};

const CategorySidebar = ({ selectedCategory, onSelectCategory }: CategorySidebarProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("is_active", true)
          .order("order_position", { ascending: true });

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="space-y-1 p-2">
        {/* All Posts */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
            "hover:bg-white/5",
            selectedCategory === null 
              ? "bg-primary/10 text-primary border border-primary/20" 
              : "text-muted-foreground"
          )}
        >
          <LayoutGrid className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm">Todos os Posts</span>
        </button>

        <div className="h-px bg-border my-3" />

        {/* Category List */}
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon] || MessageCircle;
          const isSelected = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group",
                "hover:bg-white/5",
                isSelected 
                  ? "bg-white/10 text-foreground" 
                  : "text-muted-foreground"
              )}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <IconComponent 
                  className="w-4 h-4" 
                  style={{ color: category.color }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{category.name}</span>
                  {category.is_premium_only && (
                    <Crown className="w-3 h-3 text-yellow-500 shrink-0" />
                  )}
                </div>
              </div>
              <ChevronRight 
                className={cn(
                  "w-4 h-4 shrink-0 transition-transform",
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                )} 
              />
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default CategorySidebar;
