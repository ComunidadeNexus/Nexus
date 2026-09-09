import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const FEED_QUERY_TIMEOUT_MS = 3500;
const FEED_PAGE_SIZE = 50;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uniqueUuids(ids: (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && UUID_RE.test(id)))];
}

function mergeAbortSignals(...signals: (AbortSignal | undefined)[]): AbortSignal {
  const controller = new AbortController();
  const onAbort = () => {
    if (!controller.signal.aborted) controller.abort();
  };
  for (const signal of signals) {
    if (!signal) continue;
    if (signal.aborted) {
      onAbort();
      return controller.signal;
    }
    signal.addEventListener("abort", onAbort, { once: true });
  }
  return controller.signal;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = "name" in err ? String((err as { name?: string }).name) : "";
  const message = "message" in err ? String((err as { message?: string }).message) : "";
  return name === "AbortError" || /aborted|timed out/i.test(message);
}

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

type FeedSort = "hot" | "new" | "top";

async function loadFeedPosts({
  sortBy,
  categorySlug,
  userId,
  signal,
}: {
  sortBy: FeedSort;
  categorySlug?: string | null;
  userId: string | null;
  signal: AbortSignal;
}): Promise<FeedPost[]> {
  const slug = categorySlug?.trim() || null;
  let filterCategoryId: string | null = null;

  if (slug) {
    // Avoid .single() — 0 rows returns HTTP 406 and can leave the query pending.
    const { data: cats, error: catError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .eq("is_active", true)
      .limit(1)
      .abortSignal(signal);

    if (catError) {
      if (isAbortError(catError)) throw catError;
      console.error("Error fetching category:", catError);
      return [];
    }

    const cat = cats?.[0];
    if (!cat) {
      return [];
    }
    filterCategoryId = cat.id;
  }

  // Single flat posts query — no .or()/in() privacy filter, no nested embeds.
  // Those extra round-trips (nucleo_members + nucleos + embeds) can stall the
  // supabase-js client on desktop (many sidebar queries at once) and on /popular
  // (order by upvotes + embeds). RLS already hides hidden/premium posts.
  let postsQuery = supabase
    .from("posts")
    .select(
      "id, user_id, nucleo_id, category_id, content, media_url, media_type, upvotes, downvotes, comments_count, created_at",
    )
    .eq("is_hidden", false)
    .limit(FEED_PAGE_SIZE)
    .abortSignal(signal);

  if (filterCategoryId) {
    postsQuery = postsQuery.eq("category_id", filterCategoryId);
  }

  postsQuery =
    sortBy === "top"
      ? postsQuery.order("upvotes", { ascending: false })
      : postsQuery.order("created_at", { ascending: false });

  const { data, error: postsError } = await postsQuery;
  if (postsError) {
    if (isAbortError(postsError)) throw postsError;
    console.error("Error fetching posts:", postsError);
    return [];
  }
  const rows = data || [];

  const profilesMap: Record<
    string,
    { name: string | null; username: string | null; avatar_url: string | null }
  > = {};
  const nucleosMap: Record<string, { slug: string | null; name: string | null }> = {};
  const userVotesMap: Record<string, "upvote" | "downvote"> = {};

  // Enrichment must not block an already-fetched row list (desktop E2E).
  try {
    const userIds = uniqueUuids(rows.map((p) => p.user_id));
    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url")
        .in("user_id", userIds)
        .abortSignal(signal);
      if (profilesError) {
        if (isAbortError(profilesError)) throw profilesError;
        console.error("Error fetching profiles:", profilesError);
      } else if (profilesData) {
        profilesData.forEach((p) => {
          profilesMap[p.user_id] = {
            name: p.name,
            username: p.username,
            avatar_url: p.avatar_url,
          };
        });
      }
    }

    const nucleoIds = uniqueUuids(rows.map((p) => p.nucleo_id));
    if (nucleoIds.length > 0) {
      const { data: nucleosData, error: nucleosError } = await supabase
        .from("nucleos")
        .select("id, slug, name")
        .in("id", nucleoIds)
        .abortSignal(signal);
      if (nucleosError) {
        if (isAbortError(nucleosError)) throw nucleosError;
        console.error("Error fetching nucleos:", nucleosError);
      } else if (nucleosData) {
        nucleosData.forEach((n) => {
          nucleosMap[n.id] = { slug: n.slug, name: n.name };
        });
      }
    }

    const postIds = rows.map((p) => p.id);
    if (userId && postIds.length > 0) {
      const { data: votesData, error: votesError } = await supabase
        .from("reactions")
        .select("post_id, reaction_type")
        .eq("user_id", userId)
        .in("reaction_type", ["like", "curious"])
        .in("post_id", postIds)
        .abortSignal(signal);
      if (votesError) {
        if (isAbortError(votesError)) throw votesError;
        console.error("Error fetching votes:", votesError);
      } else if (votesData) {
        votesData.forEach((v) => {
          if (v.post_id) {
            userVotesMap[v.post_id] = v.reaction_type === "like" ? "upvote" : "downvote";
          }
        });
      }
    }
  } catch (err) {
    if (!isAbortError(err)) {
      console.error("Error enriching feed posts:", err);
    }
  }

  return rows.map((post) => ({
    ...post,
    title: post.content?.substring(0, 50) || null,
    upvotes_count: post.upvotes || 0,
    downvotes_count: post.downvotes || 0,
    author: profilesMap[post.user_id] || { name: null, username: null, avatar_url: null },
    nucleo: (post.nucleo_id && nucleosMap[post.nucleo_id]) || { slug: "geral", name: "Geral" },
    user_vote: userVotesMap[post.id] || null,
  })) as FeedPost[];
}

export const useFeed = (sortBy: "hot" | "new" | "top" = "hot", categorySlug?: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch Posts
  const {
    data: posts,
    isFetched,
    isError,
    error,
    fetchStatus,
  } = useQuery({
    queryKey: ["feed-posts", sortBy, categorySlug ?? null, user?.id ?? null],
    retry: false,
    networkMode: "always",
    queryFn: async ({ signal }): Promise<FeedPost[]> => {
      const timeoutController = new AbortController();
      const timeoutId = setTimeout(() => timeoutController.abort(), FEED_QUERY_TIMEOUT_MS);
      const combinedSignal = mergeAbortSignals(signal, timeoutController.signal);

      try {
        return await withTimeout(
          loadFeedPosts({
            sortBy,
            categorySlug,
            userId: user?.id ?? null,
            signal: combinedSignal,
          }),
          FEED_QUERY_TIMEOUT_MS,
          "Feed query timed out",
        );
      } catch (err) {
        if (!isAbortError(err)) {
          console.error("Error fetching posts:", err);
        }
        return [];
      } finally {
        clearTimeout(timeoutId);
      }
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
    posts: posts ?? [],
    // Leave the spinner once the query has settled (success, error, or timeout).
    // fetchStatus === "fetching" is the in-flight first load; paused/idle must not spin forever.
    isLoading: !isFetched && !isError && fetchStatus === "fetching",
    error,
    createPost: createPostMutation.mutate,
    isCreating: createPostMutation.isPending,
    vote: voteMutation.mutate,
    deletePost: deletePostMutation.mutate,
  };
};
