import { 
  BookOpen, Megaphone, MessageCircle, HelpCircle, GraduationCap,
  FolderKanban, Trophy, Briefcase, Calendar, Crown, MessageSquarePlus, Coffee
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  name: string;
  icon: string;
  color: string;
  size?: "sm" | "md";
  className?: string;
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

const CategoryBadge = ({ name, icon, color, size = "sm", className }: CategoryBadgeProps) => {
  const IconComponent = iconMap[icon] || MessageCircle;

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 font-medium border-0",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1",
        className
      )}
      style={{ 
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <IconComponent className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      {name}
    </Badge>
  );
};

export default CategoryBadge;
