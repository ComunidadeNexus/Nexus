export interface FeedPostAuthor {
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

export interface FeedPostNucleo {
  slug: string | null;
  name: string | null;
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
  author: FeedPostAuthor | null;
  nucleo: FeedPostNucleo | null;
  category: {
    name: string;
    slug: string;
    color: string;
  } | null;
  user_vote?: "upvote" | "downvote" | null;
}

export interface FeedPostRow {
  id?: unknown;
  user_id?: unknown;
  nucleo_id?: unknown;
  title?: unknown;
  content?: unknown;
  media_url?: unknown;
  media_type?: unknown;
  upvotes?: unknown;
  downvotes?: unknown;
  upvotes_count?: unknown;
  downvotes_count?: unknown;
  comments_count?: unknown;
  created_at?: unknown;
}

export interface FeedPostMaps {
  profiles?: Record<string, FeedPostAuthor>;
  nucleos?: Record<string, FeedPostNucleo>;
  votes?: Record<string, "upvote" | "downvote">;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asTrimmed(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, value);
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return Math.max(0, parsed);
  }
  return 0;
}

function asIsoDate(value: unknown): string {
  if (typeof value === "string" && !Number.isNaN(Date.parse(value))) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  return new Date(0).toISOString();
}

/**
 * Keep title and body distinct. Never derive the title from content — that
 * made published posts re-render with the body in the title slot.
 */
export function resolvePostTitle(row: Pick<FeedPostRow, "title" | "content">): string | null {
  return asTrimmed(row.title);
}

export function mapFeedPost(row: FeedPostRow, maps: FeedPostMaps = {}): FeedPost | null {
  const id = asString(row.id);
  const userId = asString(row.user_id);
  if (!id || !userId) return null;

  const nucleoId = asString(row.nucleo_id);
  const content = asString(row.content) ?? "";

  return {
    id,
    user_id: userId,
    nucleo_id: nucleoId,
    title: resolvePostTitle(row),
    content,
    media_url: asString(row.media_url),
    media_type: asString(row.media_type),
    upvotes_count: asCount(row.upvotes_count ?? row.upvotes),
    downvotes_count: asCount(row.downvotes_count ?? row.downvotes),
    comments_count: asCount(row.comments_count),
    created_at: asIsoDate(row.created_at),
    author: maps.profiles?.[userId] ?? { name: null, username: null, avatar_url: null },
    nucleo: (nucleoId && maps.nucleos?.[nucleoId]) || { slug: "geral", name: "Geral" },
    category: null,
    user_vote: maps.votes?.[id] ?? null,
  };
}

export function mapFeedPosts(
  rows: FeedPostRow[] | null | undefined,
  maps: FeedPostMaps = {},
): FeedPost[] {
  if (!Array.isArray(rows)) return [];
  const posts: FeedPost[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const mapped = mapFeedPost(row, maps);
    if (mapped) posts.push(mapped);
  }
  return posts;
}

export function displayPostTitle(post: Pick<FeedPost, "title">): string {
  return asTrimmed(post.title) || "Sem Título";
}

export function displayPostAuthor(post: Pick<FeedPost, "author">): string {
  return asTrimmed(post.author?.name) || asTrimmed(post.author?.username) || "Usuário";
}
