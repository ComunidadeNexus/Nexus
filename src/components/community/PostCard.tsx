import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CommentSection from "./CommentSection";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    is_pinned: boolean;
    is_premium_only: boolean;
    media_url?: string | null;
    media_type?: string | null;
    user_id: string;
    category_id?: string | null;
    score?: number;
    upvotes?: number;
    downvotes?: number;
  };
  category?: {
    name: string;
    icon: string;
    color: string;
  } | null;
  author: {
    name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    user_id?: string;
    username?: string;
    karma?: number;
  };
  userVote?: "upvote" | "downvote" | null;
  isLiked?: boolean;
  onUpdate: () => void;
}

// Parse hashtags in content
const renderContentWithHashtags = (content: string) => {
  const parts = content.split(/(#\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith("#")) {
      return (
        <span key={index} className="text-primary cursor-pointer hover:underline">
          {part}
        </span>
      );
    }
    return part;
  });
};

const PostCard = ({ post, author, userVote, isLiked: initialIsLiked, onUpdate }: PostCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialIsLiked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const handleAuthorClick = () => {
    if (author.user_id) {
      navigate(`/perfil/${author.user_id}`);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Faça login para curtir");
      return;
    }

    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from("reactions")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id);
        setLikesCount((prev) => prev - 1);
      } else {
        // Add like
        await supabase.from("reactions").insert({
          post_id: post.id,
          user_id: user.id,
          reaction_type: "like",
        });
        setLikesCount((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      toast.error("Erro ao curtir");
    }
  };

  const handleAddComment = async () => {
    if (!user || !commentText.trim()) return;

    try {
      await supabase.from("comments").insert({
        post_id: post.id,
        user_id: user.id,
        content: commentText.trim(),
      });
      setCommentText("");
      onUpdate();
      toast.success("Comentário adicionado!");
    } catch (error) {
      toast.error("Erro ao comentar");
    }
  };

  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <img
            src={author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.name}`}
            alt={author.name || "User"}
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
            onClick={handleAuthorClick}
          />
          <div>
            <div className="flex items-center gap-1">
              <span
                onClick={handleAuthorClick}
                className="font-semibold text-sm hover:text-primary cursor-pointer"
              >
                {author.name || "Usuário"}
              </span>
              {author.is_verified && (
                <span className="text-primary text-sm">✓</span>
              )}
              {author.username && (
                <span className="text-muted-foreground text-sm">
                  @{author.username}
                </span>
              )}
              <span className="text-muted-foreground text-sm">•</span>
              <span className="text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: false,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.is_pinned && (
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary text-xs">
              <Pin className="w-3 h-3" />
            </Badge>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content Text */}
      <div className="px-3 pb-2">
        <p className="text-sm whitespace-pre-wrap">
          {renderContentWithHashtags(post.content)}
        </p>
      </div>

      {/* Media */}
      {post.media_url && (
        <div className="w-full">
          {post.media_type?.startsWith("image") ? (
            <img
              src={post.media_url}
              alt="Post media"
              className="w-full object-cover max-h-[500px]"
            />
          ) : post.media_type?.startsWith("video") ? (
            <video
              src={post.media_url}
              controls
              className="w-full max-h-[500px]"
            />
          ) : null}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
          >
            <Heart
              className={cn(
                "w-6 h-6 transition-all",
                isLiked && "fill-red-500 text-red-500"
              )}
            />
            <span>{likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            <span>{post.comments_count}</span>
          </button>

          <button className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setIsSaved(!isSaved)}
          className="hover:text-primary transition-colors"
        >
          <Bookmark
            className={cn(
              "w-6 h-6 transition-all",
              isSaved && "fill-foreground"
            )}
          />
        </button>
      </div>

      {/* Inline Comment Input */}
      <div className="flex items-center gap-2 px-3 pb-3 border-t border-border pt-2">
        <img
          src={user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` : ""}
          alt="Your avatar"
          className="w-8 h-8 rounded-full"
        />
        <Input
          placeholder="Adicione um comentário..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="flex-1 border-none bg-transparent text-sm h-8 focus-visible:ring-0"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        {commentText.trim() && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary font-semibold"
            onClick={handleAddComment}
          >
            Publicar
          </Button>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-3 pb-3">
          <CommentSection postId={post.id} commentsCount={post.comments_count} />
        </div>
      )}
    </article>
  );
};

export default PostCard;
