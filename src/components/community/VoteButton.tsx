import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type VoteType = "upvote" | "downvote";

interface VoteButtonProps {
  postId: string;
  initialScore: number;
  initialUserVote: VoteType | null;
  onUpdate?: () => void;
}

const VoteButton = ({
  postId,
  initialScore,
  initialUserVote,
  onUpdate,
}: VoteButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote);
  const [score, setScore] = useState(initialScore);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (voteType: VoteType) => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para votar.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (userVote === voteType) {
        // Remove vote - delete reaction
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;

        const scoreDiff = voteType === "upvote" ? -1 : 1;
        setScore((prev) => prev + scoreDiff);
        setUserVote(null);
      } else if (userVote) {
        // Change vote - update reaction
        // Use 'like' for upvote and 'love' for downvote (workaround for enum)
        const reactionType = voteType === "upvote" ? "like" : "love";
        const { error } = await supabase
          .from("reactions")
          .update({ reaction_type: reactionType })
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;

        const scoreDiff = voteType === "upvote" ? 2 : -2;
        setScore((prev) => prev + scoreDiff);
        setUserVote(voteType);
      } else {
        // New vote - insert reaction
        // Use 'like' for upvote and 'love' for downvote (workaround for enum)
        const reactionType = voteType === "upvote" ? "like" : "love";
        const { error } = await supabase.from("reactions").insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: reactionType,
        });

        if (error) throw error;

        const scoreDiff = voteType === "upvote" ? 1 : -1;
        setScore((prev) => prev + scoreDiff);
        setUserVote(voteType);
      }

      onUpdate?.();
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar seu voto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote("upvote")}
        disabled={isLoading}
        className={cn(
          "h-8 w-8 rounded-md transition-all duration-200 hover:bg-primary/20",
          userVote === "upvote" && "text-primary bg-primary/10"
        )}
      >
        <ChevronUp
          className={cn(
            "w-5 h-5 transition-transform",
            userVote === "upvote" && "scale-110"
          )}
        />
      </Button>
      
      <span
        className={cn(
          "text-sm font-bold tabular-nums min-w-[2ch] text-center",
          userVote === "upvote" && "text-primary",
          userVote === "downvote" && "text-destructive",
          !userVote && "text-muted-foreground"
        )}
      >
        {score}
      </span>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleVote("downvote")}
        disabled={isLoading}
        className={cn(
          "h-8 w-8 rounded-md transition-all duration-200 hover:bg-destructive/20",
          userVote === "downvote" && "text-destructive bg-destructive/10"
        )}
      >
        <ChevronDown
          className={cn(
            "w-5 h-5 transition-transform",
            userVote === "downvote" && "scale-110"
          )}
        />
      </Button>
    </div>
  );
};

export default VoteButton;
