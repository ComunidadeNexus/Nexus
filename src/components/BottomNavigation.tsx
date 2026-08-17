import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, Camera, Plus, Bell, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import CreateStoryModal from "@/components/stories/CreateStoryModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error("Escreva algo para publicar");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("posts").insert({
        content: postContent.trim(),
        user_id: user.id,
      });

      if (error) throw error;

      toast.success("Post publicado!");
      setPostContent("");
      setShowCreatePost(false);
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao publicar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { icon: Home, path: "/", label: "Home" },
    { icon: Search, path: "/comunidade", label: "Buscar" },
    { icon: Camera, action: () => setShowCreateStory(true), label: "Story" },
    { icon: Plus, action: () => setShowCreatePost(true), label: "Criar", isCenter: true },
    { icon: Bell, path: "/nucleos", label: "Notificações" },
    { icon: MessageCircle, path: "/mensagens", label: "Mensagens" },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {navItems.map((item, index) => {
            const isActive = item.path && location.pathname === item.path;
            const isCenter = item.isCenter;

            return (
              <button
                key={index}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={cn(
                  "flex items-center justify-center flex-1 h-full transition-all duration-200",
                  isCenter
                    ? "relative"
                    : isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground active:scale-95"
                )}
              >
                {isCenter ? (
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center -mt-2">
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                ) : (
                  <item.icon
                    className={cn(
                      "w-6 h-6 transition-transform duration-200",
                      isActive && "fill-current"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="O que você está pensando?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowCreatePost(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePost} disabled={isSubmitting || !postContent.trim()}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Publicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Story Modal */}
      <CreateStoryModal
        open={showCreateStory}
        onOpenChange={setShowCreateStory}
        onSuccess={() => {}}
      />
    </>
  );
};

export default BottomNavigation;
