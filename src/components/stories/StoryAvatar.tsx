import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface StoryAvatarProps {
  name: string;
  avatarUrl?: string | null;
  hasUnseenStory?: boolean;
  isAddButton?: boolean;
  isViewed?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const StoryAvatar = ({
  name,
  avatarUrl,
  hasUnseenStory = false,
  isAddButton = false,
  isViewed = false,
  size = "md",
  onClick,
}: StoryAvatarProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  const innerSizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-18 h-18",
  };

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 flex-shrink-0"
    >
      <div
        className={cn(
          "rounded-full p-[2px] transition-all duration-200",
          sizeClasses[size],
          hasUnseenStory && !isViewed
            ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
            : isViewed
            ? "bg-muted-foreground/30"
            : "bg-transparent"
        )}
      >
        <div
          className={cn(
            "rounded-full bg-background p-[2px] w-full h-full flex items-center justify-center"
          )}
        >
          {isAddButton ? (
            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-6 h-6 text-primary" />
            </div>
          ) : (
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground truncate max-w-[60px]">
        {isAddButton ? "Seu Story" : name?.split(" ")[0] || "User"}
      </span>
    </button>
  );
};

export default StoryAvatar;
