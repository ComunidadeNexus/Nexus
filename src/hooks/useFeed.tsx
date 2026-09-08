import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface FeedPost {
  id: string;
  user_id: string;
  nucleo_id: string | null;
  title: string | null;
  content: string;
  media_url: string | null;
  media_type: string | null;
  upvotes_count: number;
  downvotes_count: number;
  comments_count: number;
  created_at: string;
  author: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  nucleo: {
    slug: string | null;
    name: string | null;
  } | null;
  category: {
    name: string;
    slug: string;
    color: string;
  } | null;
  user_vote?: "upvote" | "downvote" | null;
}

export const useFeed = (sortBy: "hot" | "new" | "top" = "hot", categorySlug?: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Posts
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feed-posts", sortBy, categorySlug],
    queryFn: async () => {
      let filterCategoryId = null;
      if (categorySlug) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categorySlug)
          .single();
        if (cat) filterCategoryId = cat.id;
      }

      // Fetch allowed nucleos (public + user's joined nucleos)
      let userNucleos: string[] = [];
      if (user) {
        const { data: memberData } = await supabase
          .from("nucleo_members")
          .select("nucleo_id")
          .eq("user_id", user.id);
        if (memberData) userNucleos = memberData.map((m) => m.nucleo_id);
      }

      const { data: publicNucleos } = await supabase
        .from("nucleos")
        .select("id")
        .eq("is_private", false);
      const publicNucleoIds = publicNucleos ? publicNucleos.map((n) => n.id) : [];

      const allowedNucleos = [...new Set([...userNucleos, ...publicNucleoIds])];

      let query = supabase
        .from("posts")
        .select(
          `
          id, user_id, nucleo_id, category_id, content, media_url, media_type, 
          upvotes, downvotes, comments_count, created_at,
          nucleo:nucleos(slug, name),
          category:categories(name, slug, color)
        `,
        )
        // @ts-ignore
        .eq("is_hidden", false);

      // Apply privacy filter
      if (allowedNucleos.length > 0) {
        query = query.or(`nucleo_id.is.null,nucleo_id.in.(${allowedNucleos.join(",")})`);
      } else {
        query = query.or(`nucleo_id.is.null`);
      }

      if (filterCategoryId) {
        query = query.eq("category_id", filterCategoryId);
      }

      if (sortBy === "new") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "top") {
        query = query.order("upvotes", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching posts:", error);
        throw error;
      }

      // Buscar perfis separadamente para evitar erro de FK
      const userIds = [...new Set((data || []).map((p) => p.user_id))];
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

      // Se o usuário estiver logado, buscar seus votos também
      const userVotesMap: Record<string, "upvote" | "downvote"> = {};
      if (user) {
        const { data: votesData } = await supabase
          .from("reactions")
          .select("post_id, reaction_type")
          .eq("user_id", user.id)
          .in("reaction_type", ["like", "curious"]);

        if (votesData) {
          votesData.forEach((v) => {
            if (v.post_id) {
              userVotesMap[v.post_id] = v.reaction_type === "like" ? "upvote" : "downvote";
            }
          });
        }
      }

      // Format response
      return (data || []).map((post: any) => ({
        ...post,
        title: post.title || post.content?.substring(0, 50) || null, // Mock title fallback
        upvotes_count: post.upvotes || 0,
        downvotes_count: post.downvotes || 0,
        author: profilesMap[post.user_id] || { name: null, username: null, avatar_url: null },
        nucleo: post.nucleo || { slug: "geral", name: "Geral" },
        user_vote: userVotesMap[post.id] || null,
      })) as FeedPost[];
    },
  });

  // Create Post
  const createPostMutation = useMutation({
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ["feed-posts"] });

      const optimisticId = `temp-${Date.now()}`;
      const newFeedPost: FeedPost = {
        id: optimisticId,
        user_id: user?.id || "",
        nucleo_id: newPost.nucleo_id || null,
        title: newPost.title,
        content: newPost.content,
        media_url: null,
        media_type: null,
        upvotes_count: 0,
        downvotes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        author: {
          name: user?.user_metadata?.name || user?.email?.split("@")[0] || "Usuário",
          username: null,
          avatar_url: null,
        },
        nucleo: newPost.nucleo_id
          ? { slug: "nucleo", name: "Núcleo" }
          : { slug: "geral", name: "Geral" },
        user_vote: null,
      };

      queryClient.setQueryData(["feed-posts", sortBy], (old: FeedPost[] | undefined) => {
        return old ? [newFeedPost, ...old] : [newFeedPost];
      });

      return { optimisticId };
    },
    mutationFn: async (newPost: { title: string; content: string; nucleo_id?: string }) => {
      if (!user) throw new Error("Você precisa estar logado para postar.");

      const postData: any = {
        user_id: user.id,
        content: newPost.title ? `**${newPost.title}**\n\n${newPost.content}` : newPost.content,
        nucleo_id: newPost.nucleo_id || null,
      };

      const { data, error } = await supabase.from("posts").insert([postData]).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables, context) => {
      toast.success("Postagem criada com sucesso!");

      // Remove or replace the optimistic post if needed, but invalidation will handle it
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onError: (error) => {
      toast.error("Erro ao criar postagem: " + error.message);
    },
  });

  // Vote on Post
  const voteMutation = useMutation({
    onMutate: async ({ postId, voteType }) => {
      // Optimistic update for voting
      await queryClient.cancelQueries({ queryKey: ["feed-posts"] });
      const previousPosts = queryClient.getQueryData(["feed-posts", sortBy]);

      queryClient.setQueryData(["feed-posts", sortBy], (old: FeedPost[] | undefined) => {
        if (!old) return old;
        return old.map((post) => {
          if (post.id === postId) {
            const oldVote = post.user_vote;
            let newUpvotes = post.upvotes_count;
            let newDownvotes = post.downvotes_count;

            if (oldVote === "upvote") newUpvotes = Math.max(0, newUpvotes - 1);
            if (oldVote === "downvote") newDownvotes = Math.max(0, newDownvotes - 1);

            if (voteType === "upvote") newUpvotes++;
            if (voteType === "downvote") newDownvotes++;

            return {
              ...post,
              user_vote: voteType,
              upvotes_count: newUpvotes,
              downvotes_count: newDownvotes,
            };
          }
          return post;
        });
      });

      return { previousPosts };
    },
    mutationFn: async ({
      postId,
      voteType,
    }: {
      postId: string;
      voteType: "upvote" | "downvote" | null;
    }) => {
      if (!user) throw new Error("Você precisa estar logado para votar.");

      const dbVoteType =
        voteType === "upvote" ? "like" : voteType === "downvote" ? "curious" : null;

      // Pegamos todas as reações caso haja duplicatas por erro anterior
      const { data: existingReactions } = await supabase
        .from("reactions")
        .select("id, reaction_type")
        .eq("user_id", user.id)
        .eq("post_id", postId);

      if (dbVoteType === null) {
        // Remover voto(s)
        if (existingReactions && existingReactions.length > 0) {
          await supabase.from("reactions").delete().eq("user_id", user.id).eq("post_id", postId);
        }
      } else {
        if (existingReactions && existingReactions.length > 0) {
          const firstReaction = existingReactions[0];
          if (firstReaction.reaction_type === dbVoteType && existingReactions.length === 1) return; // Mesmo voto

          // Se for diferente ou houver duplicatas, limpa tudo e insere novamente
          await supabase.from("reactions").delete().eq("user_id", user.id).eq("post_id", postId);
          await supabase
            .from("reactions")
            .insert([{ user_id: user.id, post_id: postId, reaction_type: dbVoteType as any }]);
        } else {
          // Novo voto
          await supabase
            .from("reactions")
            .insert([{ user_id: user.id, post_id: postId, reaction_type: dbVoteType as any }]);
        }
      }
    },
    onSuccess: () => {
      // Pode ser silencioso, já atualizamos otimisticamente
    },
    onError: (error, variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["feed-posts", sortBy], context.previousPosts);
      }
      toast.error("Erro ao registrar voto: " + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
  });

  // Delete Post Mutation
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("Você precisa estar logado para excluir um post.");

      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .eq("user_id", user.id);
      if (error) throw error;
      return postId;
    },
    onMutate: async (postId) => {
      // Cancela requisições em andamento para não sobrescrever o cache otimista
      await queryClient.cancelQueries({ queryKey: ["feed-posts"] });

      // Atualização otimista: Remover o post do cache imediatamente
      queryClient.setQueryData(["feed-posts", sortBy], (old: FeedPost[] | undefined) =>
        old ? old.filter((p) => p.id !== postId) : [],
      );
    },
    onSuccess: () => {
      toast.success("Post excluído com sucesso");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onError: (error) => {
      toast.error("Erro ao excluir post: " + error.message);
    },
  });

  return {
    posts,
    isLoading,
    error,
    createPost: createPostMutation.mutate,
    isCreating: createPostMutation.isPending,
    vote: voteMutation.mutate,
    deletePost: deletePostMutation.mutate,
  };
};
