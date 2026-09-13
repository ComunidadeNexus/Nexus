import { format, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export type AnalyticsPeriod = "7d" | "30d" | "90d";

export interface DailyStats {
  date: string;
  posts: number;
  likes: number;
  comments: number;
}

export interface AnalyticsTopPost {
  id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface AnalyticsData {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  avgEngagementRate: number;
  postsThisWeek: number;
  postsThisMonth: number;
  likesThisWeek: number;
  commentsThisWeek: number;
  topPosts: AnalyticsTopPost[];
  dailyStats: DailyStats[];
  followerGrowth: number;
  profileViews: number;
}

/** Admin used to `.in(post_id, everyPostId)` — that GET URL hangs in PostgREST. */
export const ANALYTICS_IN_CHUNK = 80;
export const ANALYTICS_FETCH_TIMEOUT_MS = 12_000;
export const ANALYTICS_CHART_ROW_LIMIT = 2_000;
export const ANALYTICS_TOP_POST_CANDIDATES = 40;

export function periodToDays(period: AnalyticsPeriod): number {
  if (period === "7d") return 7;
  if (period === "90d") return 90;
  return 30;
}

export function chunkIds(ids: string[], size = ANALYTICS_IN_CHUNK): string[][] {
  if (ids.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size));
  }
  return chunks;
}

/** Empty `.in()` generates `in.()` and can hang forever in supabase-js. */
export function canFilterByPostIds(ids: string[] | null | undefined): ids is string[] {
  return Array.isArray(ids) && ids.length > 0;
}

export function analyticsErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "name" in error && error.name === "AbortError") {
    return "O carregamento do analytics estourou o tempo. Tente novamente.";
  }
  if (error instanceof Error && /timeout|timed out|aborted/i.test(error.message)) {
    return "O carregamento do analytics estourou o tempo. Tente novamente.";
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "Não foi possível carregar o analytics. Tente novamente.";
}

export function emptyAnalytics(): AnalyticsData {
  return {
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    avgEngagementRate: 0,
    postsThisWeek: 0,
    postsThisMonth: 0,
    likesThisWeek: 0,
    commentsThisWeek: 0,
    topPosts: [],
    dailyStats: [],
    followerGrowth: 0,
    profileViews: 0,
  };
}

export function pickTopPosts(
  posts: Array<{
    id: string;
    content: string | null;
    likes_count: number | null;
    comments_count: number | null;
    created_at: string;
  }>,
  limit = 5,
): AnalyticsTopPost[] {
  return [...posts]
    .map((post) => ({
      id: post.id,
      content: post.content || "",
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      created_at: post.created_at,
      engagement: (post.likes_count || 0) + (post.comments_count || 0),
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, limit)
    .map(({ engagement: _engagement, ...post }) => post);
}

export function buildDailyStats(
  startDate: Date,
  endDate: Date,
  posts: Array<{ created_at: string }>,
  reactions: Array<{ created_at: string }>,
  comments: Array<{ created_at: string }>,
): DailyStats[] {
  return eachDayOfInterval({ start: startDate, end: endDate }).map((day) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return {
      date: format(day, "dd/MM", { locale: ptBR }),
      posts: posts.filter((p) => format(new Date(p.created_at), "yyyy-MM-dd") === dayStr).length,
      likes: reactions.filter((r) => format(new Date(r.created_at), "yyyy-MM-dd") === dayStr)
        .length,
      comments: comments.filter((c) => format(new Date(c.created_at), "yyyy-MM-dd") === dayStr)
        .length,
    };
  });
}

export function readFollowerGrowth(
  isGlobalAdmin: boolean,
  result: { count?: number | null; data?: unknown },
): number {
  if (isGlobalAdmin) return result.count || 0;
  const data = result.data;
  if (data && typeof data === "object" && !Array.isArray(data) && "followers_count" in data) {
    const count = (data as { followers_count?: number | null }).followers_count;
    return count || 0;
  }
  return 0;
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms = ANALYTICS_FETCH_TIMEOUT_MS,
  signal?: AbortSignal,
): Promise<T> {
  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Analytics fetch timed out"));
    }, ms);
  });

  const onAbort = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
  signal?.addEventListener("abort", onAbort);

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort);
  }
}
