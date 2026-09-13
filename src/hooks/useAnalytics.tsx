import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, startOfMonth, subDays } from "date-fns";
import {
  ANALYTICS_CHART_ROW_LIMIT,
  ANALYTICS_FETCH_TIMEOUT_MS,
  ANALYTICS_TOP_POST_CANDIDATES,
  type AnalyticsData,
  type AnalyticsPeriod,
  analyticsErrorMessage,
  buildDailyStats,
  canFilterByPostIds,
  chunkIds,
  pickTopPosts,
  periodToDays,
  readFollowerGrowth,
  withTimeout,
} from "@/lib/analytics";

function throwIfError<T extends { error: { message: string } | null }>(
  result: T,
  label: string,
): T {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result;
}

export const useAnalytics = (isGlobalAdmin: boolean = false) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<AnalyticsPeriod>("30d");

  const fetchAnalytics = useCallback(async () => {
    if (!userId) {
      setAnalytics(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), ANALYTICS_FETCH_TIMEOUT_MS);

    try {
      const data = await withTimeout(
        loadAnalytics(userId, isGlobalAdmin, period),
        ANALYTICS_FETCH_TIMEOUT_MS,
        controller.signal,
      );
      if (controller.signal.aborted) {
        throw new DOMException("The operation was aborted.", "AbortError");
      }
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setAnalytics(null);
      setError(
        analyticsErrorMessage(
          controller.signal.aborted
            ? new DOMException("The operation was aborted.", "AbortError")
            : err,
        ),
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [userId, isGlobalAdmin, period]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    period,
    setPeriod,
    refetch: fetchAnalytics,
  };
};

async function loadAnalytics(
  userId: string,
  isGlobalAdmin: boolean,
  period: AnalyticsPeriod,
): Promise<AnalyticsData> {
  const now = new Date();
  const startDate = subDays(now, periodToDays(period));
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const startIso = startDate.toISOString();
  const weekIso = weekStart.toISOString();
  const monthIso = monthStart.toISOString();

  const postCount = () => {
    let query = supabase.from("posts").select("*", { count: "exact", head: true });
    if (!isGlobalAdmin) query = query.eq("user_id", userId);
    return query;
  };

  const [
    totalPostsResult,
    postsWeekResult,
    postsMonthResult,
    likesResult,
    commentsResult,
    likesWeekResult,
    commentsWeekResult,
    followersResult,
    topPostsResult,
    periodPostsResult,
    periodReactionsResult,
    periodCommentsResult,
  ] = await Promise.all([
    postCount(),
    postCount().gte("created_at", weekIso),
    postCount().gte("created_at", monthIso),
    isGlobalAdmin
      ? supabase
          .from("reactions")
          .select("*", { count: "exact", head: true })
          .not("post_id", "is", null)
      : Promise.resolve({ count: 0, error: null }),
    isGlobalAdmin
      ? supabase.from("comments").select("*", { count: "exact", head: true })
      : Promise.resolve({ count: 0, error: null }),
    isGlobalAdmin
      ? supabase
          .from("reactions")
          .select("*", { count: "exact", head: true })
          .not("post_id", "is", null)
          .gte("created_at", weekIso)
      : Promise.resolve({ count: 0, error: null }),
    isGlobalAdmin
      ? supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekIso)
      : Promise.resolve({ count: 0, error: null }),
    isGlobalAdmin
      ? supabase.from("profiles").select("*", { count: "exact", head: true })
      : supabase.from("profiles").select("followers_count").eq("user_id", userId).maybeSingle(),
    (() => {
      let query = supabase
        .from("posts")
        .select("id, content, likes_count, comments_count, created_at, upvotes, downvotes")
        .order("likes_count", { ascending: false })
        .limit(ANALYTICS_TOP_POST_CANDIDATES);
      if (!isGlobalAdmin) query = query.eq("user_id", userId);
      return query;
    })(),
    (() => {
      let query = supabase
        .from("posts")
        .select("created_at")
        .gte("created_at", startIso)
        .order("created_at", { ascending: false })
        .limit(ANALYTICS_CHART_ROW_LIMIT);
      if (!isGlobalAdmin) query = query.eq("user_id", userId);
      return query;
    })(),
    isGlobalAdmin
      ? supabase
          .from("reactions")
          .select("created_at")
          .not("post_id", "is", null)
          .gte("created_at", startIso)
          .order("created_at", { ascending: false })
          .limit(ANALYTICS_CHART_ROW_LIMIT)
      : Promise.resolve({ data: [] as Array<{ created_at: string }>, error: null }),
    isGlobalAdmin
      ? supabase
          .from("comments")
          .select("created_at")
          .gte("created_at", startIso)
          .order("created_at", { ascending: false })
          .limit(ANALYTICS_CHART_ROW_LIMIT)
      : Promise.resolve({ data: [] as Array<{ created_at: string }>, error: null }),
  ]);

  throwIfError(totalPostsResult, "posts");
  throwIfError(postsWeekResult, "posts da semana");
  throwIfError(postsMonthResult, "posts do mês");
  throwIfError(likesResult, "curtidas");
  throwIfError(commentsResult, "comentários");
  throwIfError(likesWeekResult, "curtidas da semana");
  throwIfError(commentsWeekResult, "comentários da semana");
  throwIfError(followersResult, "usuários");
  throwIfError(topPostsResult, "top posts");
  throwIfError(periodPostsResult, "posts do período");
  throwIfError(periodReactionsResult, "reações do período");
  throwIfError(periodCommentsResult, "comentários do período");

  const topRows = topPostsResult.data || [];

  let totalLikes = likesResult.count || 0;
  let totalComments = commentsResult.count || 0;
  let likesThisWeek = likesWeekResult.count || 0;
  let commentsThisWeek = commentsWeekResult.count || 0;
  let periodReactions = periodReactionsResult.data || [];
  let periodComments = periodCommentsResult.data || [];

  if (!isGlobalAdmin) {
    const userPostsResult = throwIfError(
      await supabase
        .from("posts")
        .select("id, likes_count, comments_count, upvotes, downvotes")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(500),
      "posts do usuário",
    );
    const userPosts = userPostsResult.data || [];
    const postIds = userPosts.map((post) => post.id);
    totalLikes = userPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0);
    totalComments = userPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0);

    if (canFilterByPostIds(postIds)) {
      const [weekLikes, weekComments, chartLikes, chartComments] = await Promise.all([
        countByPostIds("reactions", postIds, weekIso),
        countByPostIds("comments", postIds, weekIso),
        listCreatedAtByPostIds("reactions", postIds, startIso),
        listCreatedAtByPostIds("comments", postIds, startIso),
      ]);
      likesThisWeek = weekLikes;
      commentsThisWeek = weekComments;
      periodReactions = chartLikes;
      periodComments = chartComments;
    }
  }

  const followerGrowth = readFollowerGrowth(isGlobalAdmin, followersResult);

  const totalPosts = totalPostsResult.count || 0;
  const totalViews = topRows.reduce(
    (sum, post) => sum + (post.upvotes || 0) + (post.downvotes || 0),
    0,
  );

  return {
    totalPosts,
    totalLikes,
    totalComments,
    totalViews,
    avgEngagementRate: totalPosts > 0 ? (totalLikes + totalComments) / totalPosts : 0,
    postsThisWeek: postsWeekResult.count || 0,
    postsThisMonth: postsMonthResult.count || 0,
    likesThisWeek,
    commentsThisWeek,
    topPosts: pickTopPosts(topRows),
    dailyStats: buildDailyStats(
      startDate,
      now,
      periodPostsResult.data || [],
      periodReactions,
      periodComments,
    ),
    followerGrowth,
    profileViews: 0,
  };
}

async function countByPostIds(
  table: "reactions" | "comments",
  postIds: string[],
  sinceIso: string,
): Promise<number> {
  let total = 0;
  for (const chunk of chunkIds(postIds)) {
    const result = throwIfError(
      await supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .in("post_id", chunk)
        .gte("created_at", sinceIso),
      table,
    );
    total += result.count || 0;
  }
  return total;
}

async function listCreatedAtByPostIds(
  table: "reactions" | "comments",
  postIds: string[],
  sinceIso: string,
): Promise<Array<{ created_at: string }>> {
  const rows: Array<{ created_at: string }> = [];
  for (const chunk of chunkIds(postIds)) {
    const result = throwIfError(
      await supabase
        .from(table)
        .select("created_at")
        .in("post_id", chunk)
        .gte("created_at", sinceIso)
        .limit(ANALYTICS_CHART_ROW_LIMIT),
      table,
    );
    rows.push(...((result.data || []) as Array<{ created_at: string }>));
  }
  return rows;
}
