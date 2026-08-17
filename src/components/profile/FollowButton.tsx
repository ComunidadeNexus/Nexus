import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useFollowers } from "@/hooks/useFollowers";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

const FollowButton = ({
  userId,
  variant = "default",
  size = "default",
  showIcon = true,
}: FollowButtonProps) => {
  const { user } = useAuth();
  const { isFollowing, isLoading, toggleFollow } = useFollowers(userId);

  // Don't show button for own profile or if not logged in
  if (!user || user.id === userId) {
    return null;
  }

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
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : showIcon ? (
        isFollowing ? (
          <UserMinus className="w-4 h-4" />
        ) : (
          <UserPlus className="w-4 h-4" />
        )
      ) : null}
      {isFollowing ? "Seguindo" : "Seguir"}
    </Button>
  );
};

export default FollowButton;
