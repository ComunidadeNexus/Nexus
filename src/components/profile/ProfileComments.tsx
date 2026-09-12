import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const ProfileComments = ({ userId }: { userId: string }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select(
            `
            id,
            content,
            created_at,
            post_id,
            posts (
              id,
              title,
              nucleos (
                slug,
                name
              )
            )
          `,
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        setComments(data || []);
      } catch (err) {
        console.error("Erro ao buscar comentários", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-10 bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400 bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>Nenhum comentário feito ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="p-4 bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comentou em</span>
            {comment.posts?.nucleos && (
              <Link
                to={`/n/${comment.posts.nucleos.slug}`}
                className="font-bold text-gray-700 dark:text-gray-300 hover:underline"
              >
                n/{comment.posts.nucleos.slug}
              </Link>
            )}
            <span className="mx-1">•</span>
            <span>
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>

          <Link to={`/post/${comment.post_id}`} className="block">
            {comment.posts?.title && (
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1 group-hover:text-primary">
                {comment.posts.title}
              </h3>
            )}
            <div className="p-3 bg-gray-50 dark:bg-[#0B1416] rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800">
              {comment.content}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};
