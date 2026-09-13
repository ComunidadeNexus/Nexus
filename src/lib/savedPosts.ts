const STORAGE_KEY = "saved_posts";

export function readSavedPostIds(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

export function writeSavedPostIds(ids: string[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Private mode / quota — saving is best-effort.
  }
}

export function toggleSavedPost(postId: string): { saved: boolean; ids: string[] } {
  const ids = readSavedPostIds();
  const saved = ids.includes(postId);
  const next = saved ? ids.filter((id) => id !== postId) : [...ids, postId];
  writeSavedPostIds(next);
  return { saved: !saved, ids: next };
}
