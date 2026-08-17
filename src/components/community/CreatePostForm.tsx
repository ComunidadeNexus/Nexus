import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send } from "lucide-react";
import UserAvatar from "./UserAvatar";

interface CreatePostFormProps {
  onPostCreated: () => void;
  userName?: string | null;
  userAvatar?: string | null;
}

const CreatePostForm = ({ onPostCreated, userName, userAvatar }: CreatePostFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um post.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo do post não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("posts").insert({
        content: content.trim(),
        user_id: user.id,
      });

      if (error) throw error;

      setContent("");
      toast({
        title: "Sucesso!",
        description: "Seu post foi publicado.",
      });
      onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar o post.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-4 rounded-xl border border-white/10">
      <div className="flex gap-4">
        <UserAvatar name={userName} avatarUrl={userAvatar} />
        <div className="flex-1 space-y-3">
          <Textarea
            placeholder="O que você quer compartilhar com a comunidade?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] bg-white/5 border-white/10 resize-none focus:border-primary/50"
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {content.length}/2000 caracteres
            </span>
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              variant="gradient"
              size="sm"
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Publicar
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePostForm;
