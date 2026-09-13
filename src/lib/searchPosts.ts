/**
 * Post search helpers. /busca used to textSearch(content) then fall back to a
 * raw .or(ilike) with nested embeds. FTS on "QA" is empty (no tsvector / too
 * short), and a failing embed aborted the ilike fallback — Posts=0 while the
 * same title is visible in the feed.
 */

export function normalizeSearchQuery(raw: string): string {
  return raw.trim();
}

export function escapeIlikePattern(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export function quotePostgrestValue(raw: string): string {
  return `"${raw.replace(/"/g, '\\"')}"`;
}

/** title OR content substring match, safe for PostgREST `.or()`. */
export function buildPostsSearchOr(rawQuery: string): string | null {
  const query = normalizeSearchQuery(rawQuery);
  if (!query) return null;

  const pattern = `%${escapeIlikePattern(query)}%`;
  const value = quotePostgrestValue(pattern);
  return `title.ilike.${value},content.ilike.${value}`;
}

export const POST_SEARCH_COLUMNS =
  "id, user_id, nucleo_id, title, content, media_url, media_type, upvotes, downvotes, comments_count, created_at";
