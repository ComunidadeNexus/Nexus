import { Loader2 } from "lucide-react";
import { useFollowers } from "@/hooks/useFollowers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { canFollow } from "@/lib/profileSocial";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  userId: string;
  className?: string;
}

const FollowButton = ({ userId, className }: FollowButtonProps) => {
  const { user } = useAuth();
  const { isFollowing, isLoading, toggleFollow } = useFollowers(userId);
  const guard = canFollow(user?.id, userId);

  if (!guard.ok) return null;

  const handleClick = async () => {
    const wasFollowing = isFollowing;
    const { error } = await toggleFollow(userId);
    if (error) {
      console.error("Follow error:", error);
      toast.error("Erro ao atualizar seguimento");
      return;
    }
    toast.success(wasFollowing ? "Deixou de seguir" : "Agora você está seguindo!");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "flex items-center justify-center gap-2 min-h-11 px-4 sm:px-6 py-2 rounded-full font-bold text-sm transition-opacity shadow-md disabled:opacity-50",
        isFollowing
          ? "bg-gray-100 dark:bg-[#2A3B42] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
          : "bg-gradient-to-r from-[#00C6FF] to-[#FF007F] hover:opacity-90 text-white",
        className,
      )}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {isFollowing ? "Seguindo" : "Seguir"}
    </button>
  );
};

export default FollowButton;
