import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Comments
  const {
    data: comments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id, post_id, user_id, content, created_at
        `,
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        throw error;
      }

      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      const profilesMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, name, username, avatar_url")
          .in("user_id", userIds);

        if (profilesData) {
          profilesData.forEach((p) => {
            profilesMap[p.user_id] = {
              name: p.name,
              username: p.username,
              avatar_url: p.avatar_url,
            };
          });
        }
      }

      return (data || []).map((comment) => ({
        ...comment,
        author: profilesMap[comment.user_id] || { name: null, username: null, avatar_url: null },
      })) as Comment[];
    },
    enabled: !!postId,
  });

  // Create Comment
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Você precisa estar logado para comentar.");

      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            user_id: user.id,
            post_id: postId,
            content: content,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // O banco de dados já possui um trigger que incrementa o comments_count automaticamente.
      // Vamos apenas buscar o post para notificar o autor.
      const { data: post } = await supabase
        .from("posts")
        .select("comments_count, user_id, content")
        .eq("id", postId)
        .single();
      if (post) {
        // Notificar o autor do post
        if (post.user_id !== user.id) {
          await supabase.from("notifications").insert([
            {
              user_id: post.user_id,
              actor_id: user.id,
              type: "comment",
              title: "Novo comentário",
              message: `comentou no seu post: ${post.content?.substring(0, 30) || "Post sem título"}`,
              post_id: postId,
              comment_id: data.id,
            },
          ]);
        }
      }

      return data;
    },
    onSuccess: () => {
      toast.success("Comentário enviado!");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] }); // Atualizar contador no feed principal
    },
    onError: (error) => {
      toast.error("Erro ao comentar: " + error.message);
    },
  });

  return {
    comments,
    isLoading,
    error,
    createComment: createCommentMutation.mutate,
    isCreating: createCommentMutation.isPending,
  };
};
