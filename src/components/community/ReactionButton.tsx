import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ReactionButtonProps {
  postId: string;
  initialLikesCount: number;
  initialIsLiked: boolean;
  onUpdate?: () => void;
}

const ReactionButton = ({
  postId,
  initialLikesCount,
  initialIsLiked,
  onUpdate,
}: ReactionButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para curtir posts.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        // Add like
        const { error } = await supabase.from("reactions").insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: "like",
        });

        if (error) throw error;

        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }

      onUpdate?.();
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua reação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleLike}
      disabled={isLoading}
      className={cn(
        "gap-2 transition-all duration-200",
        isLiked && "text-red-500 hover:text-red-600"
      )}
    >
      <Heart
        className={cn(
          "w-4 h-4 transition-all duration-200",
          isLiked && "fill-current"
        )}
      />
      <span>{likesCount}</span>
    </Button>
  );
};

export default ReactionButton;
