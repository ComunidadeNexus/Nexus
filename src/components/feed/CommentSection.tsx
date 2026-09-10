import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useComments } from "@/hooks/useComments";
import GifPicker from "./GifPicker";
import { SmilePlus, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { renderMessageContent } from "@/utils/textParser";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = ({ postId }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { comments, isLoading, createComment, isCreating } = useComments(postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createComment(newComment, {
      onSuccess: () => {
        setNewComment("");
        setShowGifPicker(false);
      },
    });
  };

  const handleGifSelect = (gifUrl: string) => {
    // Adiciona a tag especial do GIF no campo de texto e envia
    const commentWithGif = newComment ? `${newComment} [GIF:${gifUrl}]` : `[GIF:${gifUrl}]`;
    createComment(commentWithGif, {
      onSuccess: () => {
        setNewComment("");
        setShowGifPicker(false);
      },
    });
  };

  const handleEmojiSelect = (emojiData: any) => {
    setNewComment((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-800 p-3 max-md:px-3 max-md:py-2 bg-gray-50 dark:bg-[#152024]">
      {/* Formulário de novo comentário */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3 md:mb-4">
          <Avatar className="w-7 h-7 md:w-8 md:h-8 shrink-0">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>

          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Adicione um comentário..."
              disabled={isCreating}
              className="w-full bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-700 rounded-full pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 transition-all"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowGifPicker(false);
                }}
                className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-full transition-colors"
                title="Adicionar Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGifPicker(!showGifPicker);
                  setShowEmojiPicker(false);
                }}
                className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-full transition-colors"
                title="Adicionar GIF"
              >
                <SmilePlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!newComment.trim() || isCreating}
            className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm max-md:px-4"
          >
            {isCreating ? "..." : "Enviar"}
          </button>
        </form>

        {/* Popover do Seletor de GIFs */}
        {showGifPicker && (
          <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />
        )}

        {/* Popover do Seletor de Emojis */}
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 right-0 z-50">
            <EmojiPicker onEmojiClick={handleEmojiSelect} width={300} height={400} />
          </div>
        )}
      </div>

      {/* Lista de comentários — flat list (no nesting in this tree); tighter on mobile */}
      <div className="flex flex-col gap-3 md:gap-4">
        {isLoading ? (
          <span className="text-xs text-gray-500 text-center block">Carregando comentários...</span>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="w-7 h-7 md:w-8 md:h-8 shrink-0">
                <AvatarImage src={comment.author?.avatar_url || undefined} />
                <AvatarFallback>
                  {comment.author?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col bg-white dark:bg-[#1A282D] border border-gray-100 dark:border-gray-800 rounded-xl rounded-tl-none p-3 shadow-sm max-md:bg-transparent max-md:border-0 max-md:shadow-none max-md:rounded-none max-md:p-0">
                <span className="text-xs font-bold text-gray-900 dark:text-gray-100 mb-0.5 md:mb-1">
                  {comment.author?.name || comment.author?.username || "Usuário"}
                </span>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {renderMessageContent(comment.content)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <span className="text-xs text-gray-500 text-center block">Nenhum comentário ainda.</span>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
