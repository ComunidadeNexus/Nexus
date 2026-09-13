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

/** DB stores like/curious; the UI and cache use upvote/downvote. */
export function mapReactionToVote(value: unknown): "upvote" | "downvote" | null {
  if (value === "upvote" || value === "like") return "upvote";
  if (value === "downvote" || value === "curious") return "downvote";
  return null;
}

export function applyVoteToPost(post: FeedPost, voteType: "upvote" | "downvote" | null): FeedPost {
  const oldVote = mapReactionToVote(post.user_vote);
  let newUpvotes = post.upvotes_count;
  let newDownvotes = post.downvotes_count;

  if (oldVote === "upvote") newUpvotes = Math.max(0, newUpvotes - 1);
  if (oldVote === "downvote") newDownvotes = Math.max(0, newDownvotes - 1);
  if (voteType === "upvote") newUpvotes += 1;
  if (voteType === "downvote") newDownvotes += 1;

  return {
    ...post,
    user_vote: voteType,
    upvotes_count: newUpvotes,
    downvotes_count: newDownvotes,
  };
}

function authorFromRow(row: object): FeedPostAuthor | null {
  if (!("author" in row) || !row.author || typeof row.author !== "object") return null;
  const author = row.author as Record<string, unknown>;
  return {
    name: asString(author.name),
    username: asString(author.username),
    avatar_url: asString(author.avatar_url),
  };
}

function nucleoFromRow(row: object): FeedPostNucleo | null {
  if (!("nucleo" in row) || !row.nucleo || typeof row.nucleo !== "object") return null;
  const nucleo = row.nucleo as Record<string, unknown>;
  return {
    slug: asString(nucleo.slug),
    name: asString(nucleo.name),
  };
}

/**
 * Drop cache holes and coerce optimistic / leftover rows so Feed.tsx never
 * calls display helpers on null. /comunidade and /feed share the "hot" query
 * key; CreatePostModal writes into every ["feed-posts"] cache.
 */
export function sanitizeFeedPosts(value: unknown): FeedPost[] {
  if (!Array.isArray(value)) return [];

  const posts: FeedPost[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object") continue;

    const record = row as FeedPostRow & { author?: unknown; nucleo?: unknown; user_vote?: unknown };
    const userId = asString(record.user_id);
    const id = asString(record.id);
    const nucleoId = asString(record.nucleo_id);
    const author = authorFromRow(row);
    const nucleo = nucleoFromRow(row);
    const vote = mapReactionToVote(record.user_vote) ?? undefined;

    const mapped = mapFeedPost(record, {
      profiles: userId && author ? { [userId]: author } : undefined,
      nucleos: nucleoId && nucleo ? { [nucleoId]: nucleo } : undefined,
      votes: id && vote ? { [id]: vote } : undefined,
    });
    if (mapped) posts.push(mapped);
  }
  return posts;
}
