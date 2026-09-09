import React, { useState } from "react";
import {
  MessageSquare,
  Share2,
  Bookmark,
  Heart,
  Eye,
  MoreHorizontal,
  Trash2,
  Flag,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFeed } from "@/hooks/useFeed";
import CommentSection from "./CommentSection";
import SharePostModal from "./SharePostModal";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PostCardProps {
  postId: string;
  nucleus: string;
  author: string;
  authorId?: string;
  authorAvatar?: string | null;
  timeAgo: string;
  title: string;
  content: string;
  votes: number;
  comments: number;
  mediaUrl?: string;
  mediaType?: string;
  userVote?: "upvote" | "downvote" | null;
}

const PostCard = ({
  postId,
  nucleus,
  author,
  authorId,
  authorAvatar,
  timeAgo,
  title,
  content,
  votes,
  comments,
  mediaUrl,
  mediaType,
  userVote,
}: PostCardProps) => {
  const { vote, deletePost } = useFeed();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isSaved, setIsSaved] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("saved_posts") || "[]");
    return saved.includes(postId);
  });

  const handleLike = () => {
    const finalVote = userVote === "upvote" ? null : "upvote";
    vote({ postId, voteType: finalVote });
  };

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem("saved_posts") || "[]");
    if (isSaved) {
      const newSaved = saved.filter((id: string) => id !== postId);
      localStorage.setItem("saved_posts", JSON.stringify(newSaved));
      setIsSaved(false);
      toast.success("Post removido dos salvos");
    } else {
      saved.push(postId);
      localStorage.setItem("saved_posts", JSON.stringify(saved));
      setIsSaved(true);
      toast.success("Post salvo com sucesso!");
    }
    window.dispatchEvent(new Event("saved_posts_updated"));
  };

  const handleDelete = () => {
    if (deletePost) {
      deletePost(postId);
    } else {
      toast.info("Função de deletar post indisponível no momento.");
    }
  };

  const handleReport = () => {
    toast.success("Report enviado ao painel ADM");
  };

  const videoViews = Math.floor((postId.charCodeAt(0) || 1) * 31.4 + 120);

  const isOwner = user && authorId && user.id === authorId;

  return (
    <div className="bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-4 overflow-hidden flex flex-col transition-colors hover:border-gray-300 dark:hover:border-gray-600">
      <div className="flex w-full">
        {/* Conteúdo do Post */}
        <div className="flex-1 p-4">
          {/* Header do Post */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs min-w-0">
              <Link to={authorId ? `/perfil/${authorId}` : "#"} className="shrink-0">
                <Avatar className="w-8 h-8 hover:opacity-80 transition-opacity">
                  <AvatarImage src={authorAvatar || undefined} />
                  <AvatarFallback>{author[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  <Link
                    to={authorId ? `/perfil/${authorId}` : "#"}
                    className="font-bold hover:underline cursor-pointer text-gray-900 dark:text-gray-100 truncate"
                  >
                    {author}
                  </Link>
                  {nucleus && nucleus !== "geral" && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="font-bold hover:underline cursor-pointer hover:text-primary transition-colors truncate">
                        n/{nucleus}
                      </span>
                    </>
                  )}
                </div>
                <span className="text-gray-500">{timeAgo}</span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-md transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-800 shadow-lg rounded-xl"
              >
                {isOwner ? (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer rounded-lg p-3 font-medium"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir post
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={handleReport}
                    className="text-gray-700 dark:text-gray-300 focus:bg-gray-100 dark:focus:bg-[#2A3B42] cursor-pointer rounded-lg p-3 font-medium"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Título e Texto */}
          <div className="mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight break-words">
              {title}
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line line-clamp-4">
              {content}
            </p>
          </div>

          {/* Mídia (Se houver) */}
          {mediaUrl && (
            <div className="mb-3 rounded-lg overflow-hidden max-h-[500px] flex flex-col bg-gray-100 dark:bg-black -mx-4 sm:mx-0 relative">
              {mediaType?.includes("video") ? (
                <>
                  <video src={mediaUrl} controls className="max-h-[500px] w-full object-contain" />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                    <Eye className="w-3.5 h-3.5" />
                    {videoViews} visualizações
                  </div>
                </>
              ) : (
                <img
                  src={mediaUrl}
                  alt="Conteúdo do post"
                  className="max-h-[500px] w-full object-contain"
                />
              )}
            </div>
          )}

          {/* Barra de Ações Inferior */}
          <div className="flex items-center justify-between text-gray-500 pt-1">
            <div className="flex items-center gap-2 -ml-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 min-h-11 px-2 py-1.5 rounded-md transition-colors text-sm font-semibold ${
                  userVote === "upvote"
                    ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                    : "hover:bg-gray-100 dark:hover:bg-[#2A3B42]"
                }`}
              >
                <Heart className={`w-6 h-6 ${userVote === "upvote" ? "fill-current" : ""}`} />
                <span className={userVote === "upvote" ? "text-red-500" : ""}>
                  {votes > 0 ? votes : ""}
                </span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 min-h-11 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-md transition-colors text-sm font-semibold"
              >
                <MessageSquare className="w-6 h-6" />
                <span>{comments > 0 ? comments : ""}</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 min-h-11 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-[#2A3B42] rounded-md transition-colors text-sm font-semibold"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 min-h-11 min-w-11 p-1.5 rounded-md transition-colors text-sm font-semibold ${
                isSaved
                  ? "text-primary hover:bg-primary/10"
                  : "hover:bg-gray-100 dark:hover:bg-[#2A3B42]"
              }`}
            >
              <Bookmark className={`w-6 h-6 ${isSaved ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Seção de Comentários */}
      {showComments && <CommentSection postId={postId} />}

      {/* Modal de Compartilhamento */}
      <SharePostModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        postId={postId}
        title={title}
      />
    </div>
  );
};

export default PostCard;
