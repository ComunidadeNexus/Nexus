import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const FEED_QUERY_TIMEOUT_MS = 8000;
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

  // Public + joined nucleos. Time out membership separately so a hung RLS
  // lookup cannot block the whole feed (falls back to public nucleos / global posts).
  let userNucleos: string[] = [];
  if (userId) {
    const memberTimeout = new AbortController();
    const memberTimer = setTimeout(
      () => memberTimeout.abort(),
      Math.min(3000, FEED_QUERY_TIMEOUT_MS),
    );
    try {
      const { data: memberData, error: memberError } = await withTimeout(
        Promise.resolve(
          supabase
            .from("nucleo_members")
            .select("nucleo_id")
            .eq("user_id", userId)
            .abortSignal(mergeAbortSignals(signal, memberTimeout.signal)),
        ),
        Math.min(3000, FEED_QUERY_TIMEOUT_MS),
        "nucleo_members timed out",
      );
      if (memberError && !isAbortError(memberError)) {
        console.error("Error fetching nucleo memberships:", memberError);
      } else if (memberData) {
        userNucleos = uniqueUuids(memberData.map((m) => m.nucleo_id));
      }
    } catch (err) {
      if (!isAbortError(err)) {
        console.error("Error fetching nucleo memberships:", err);
      }
    } finally {
      clearTimeout(memberTimer);
    }
  }

  const { data: publicNucleos, error: publicNucleoError } = await supabase
    .from("nucleos")
    .select("id")
    .eq("is_private", false)
    .abortSignal(signal);
  if (publicNucleoError) {
    if (isAbortError(publicNucleoError)) throw publicNucleoError;
    console.error("Error fetching public nucleos:", publicNucleoError);
  }
  const publicNucleoIds = uniqueUuids((publicNucleos || []).map((n) => n.id));
  const allowedNucleos = uniqueUuids([...userNucleos, ...publicNucleoIds]);

  const selectClause = `
          id, user_id, nucleo_id, category_id, content, media_url, media_type,
          upvotes, downvotes, comments_count, created_at,
          nucleo:nucleos(slug, name),
          category:categories(name, slug, color)
        `;

  const buildPostsQuery = () => {
    let query = supabase
      .from("posts")
      .select(selectClause)
      .eq("is_hidden", false)
      .limit(FEED_PAGE_SIZE)
      .abortSignal(signal);

    if (filterCategoryId) {
      query = query.eq("category_id", filterCategoryId);
    }

    if (sortBy === "top") {
      query = query.order("upvotes", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    return query;
  };

  // Avoid PostgREST `.or(nucleo_id.is.null, nucleo_id.in.(...))` — empty or
  // malformed `in.()` and the or+in combo can stall the request. Two queries
  // (global posts + allowed nucleos) always resolve or abort.
  const postQueries = [
    buildPostsQuery().is("nucleo_id", null),
    ...(allowedNucleos.length > 0 ? [buildPostsQuery().in("nucleo_id", allowedNucleos)] : []),
  ];

  const postResults = await Promise.all(postQueries);
  const seen = new Set<string>();
  const rows: NonNullable<(typeof postResults)[number]["data"]> = [];

  for (const result of postResults) {
    if (result.error) {
      if (isAbortError(result.error)) throw result.error;
      console.error("Error fetching posts:", result.error);
      continue;
    }
    for (const post of result.data || []) {
      if (!post?.id || seen.has(post.id)) continue;
      seen.add(post.id);
      rows.push(post);
    }
  }

  rows.sort((a, b) => {
    if (sortBy === "top") {
      return (b.upvotes ?? 0) - (a.upvotes ?? 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const userIds = uniqueUuids(rows.map((p) => p.user_id));
  const profilesMap: Record<
    string,
    { name: string | null; username: string | null; avatar_url: string | null }
  > = {};

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

  const userVotesMap: Record<string, "upvote" | "downvote"> = {};
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

  return rows.map((post: any) => ({
    ...post,
    title: post.title || post.content?.substring(0, 50) || null,
    upvotes_count: post.upvotes || 0,
    downvotes_count: post.downvotes || 0,
    author: profilesMap[post.user_id] || { name: null, username: null, avatar_url: null },
    nucleo: post.nucleo || { slug: "geral", name: "Geral" },
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
