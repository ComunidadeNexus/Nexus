import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Send } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import UserAvatar from "./UserAvatar";
import CategoryBadge from "./CategoryBadge";

interface CreatePostModalProps {
  onPostCreated: () => void;
  userName?: string | null;
  userAvatar?: string | null;
  defaultCategoryId?: string | null;
  nucleoId?: string | null;
}

const CreatePostModal = ({ 
  onPostCreated, 
  userName, 
  userAvatar,
  defaultCategoryId,
  nucleoId 
}: CreatePostModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(defaultCategoryId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories where user can post (not admin_only, unless user is admin)
  const availableCategories = categories.filter(cat => !cat.is_admin_only);

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
        category_id: categoryId,
        nucleo_id: nucleoId,
      });

      if (error) throw error;

      setContent("");
      setCategoryId(defaultCategoryId || null);
      setOpen(false);
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

  const selectedCategory = categories.find(cat => cat.id === categoryId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Post
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <UserAvatar name={userName} avatarUrl={userAvatar} size="sm" />
            <span>Criar novo post</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Categoria (opcional)
            </label>
            <Select
              value={categoryId || "none"}
              onValueChange={(value) => setCategoryId(value === "none" ? null : value)}
            >
              <SelectTrigger className="bg-muted/50 border-white/10">
                <SelectValue placeholder="Selecione uma categoria">
                  {selectedCategory ? (
                    <CategoryBadge
                      name={selectedCategory.name}
                      icon={selectedCategory.icon}
                      color={selectedCategory.color}
                    />
                  ) : (
                    "Sem categoria"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <CategoryBadge
                      name={category.name}
                      icon={category.icon}
                      color={category.color}
                    />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Textarea
              placeholder="O que você quer compartilhar com a comunidade?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px] bg-muted/50 border-white/10 resize-none focus:border-primary/50"
              maxLength={2000}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{content.length}/2000 caracteres</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              variant="gradient"
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
