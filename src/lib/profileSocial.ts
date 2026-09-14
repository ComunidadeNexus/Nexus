export const PROFILE_CATEGORY_KEYS = [
  "content_creator",
  "musician",
  "developer",
  "designer",
  "entrepreneur",
  "educator",
  "gamer",
  "influencer",
  "other",
] as const;

export type ProfileCategoryKey = (typeof PROFILE_CATEGORY_KEYS)[number];

export const PROFILE_CATEGORY_LABELS: Record<ProfileCategoryKey, string> = {
  content_creator: "Criador de conteúdo",
  musician: "Músico",
  developer: "Dev",
  designer: "Designer",
  entrepreneur: "Empreendedor",
  educator: "Educador",
  gamer: "Gamer",
  influencer: "Influencer",
  other: "Outro",
};

export const PROFILE_CATEGORIES = PROFILE_CATEGORY_KEYS.map((key) => ({
  key,
  label: PROFILE_CATEGORY_LABELS[key],
}));

export const SOCIAL_NETWORK_KEYS = [
  "instagram",
  "twitter",
  "youtube",
  "linkedin",
  "tiktok",
  "website",
] as const;

export type SocialNetworkKey = (typeof SOCIAL_NETWORK_KEYS)[number];

export const SOCIAL_NETWORKS: { key: SocialNetworkKey; label: string; placeholder: string }[] = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/seuusuario" },
  { key: "twitter", label: "X / Twitter", placeholder: "https://x.com/seuusuario" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@canal" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/seuusuario" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@seuusuario" },
  { key: "website", label: "Website", placeholder: "https://seusite.com" },
];

export type SocialLinks = Partial<Record<SocialNetworkKey, string>>;

const CATEGORY_KEY_SET = new Set<string>(PROFILE_CATEGORY_KEYS);
const SOCIAL_KEY_SET = new Set<string>(SOCIAL_NETWORK_KEYS);

export function isProfileCategoryKey(value: unknown): value is ProfileCategoryKey {
  return typeof value === "string" && CATEGORY_KEY_SET.has(value);
}

export function sanitizeProfileCategories(input: unknown): ProfileCategoryKey[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<ProfileCategoryKey>();
  for (const item of input) {
    if (isProfileCategoryKey(item) && !seen.has(item)) {
      seen.add(item);
    }
  }
  return PROFILE_CATEGORY_KEYS.filter((key) => seen.has(key));
}

export function chosenCategoryLabels(input: unknown): { key: ProfileCategoryKey; label: string }[] {
  return sanitizeProfileCategories(input).map((key) => ({
    key,
    label: PROFILE_CATEGORY_LABELS[key],
  }));
}

export function toggleProfileCategory(
  current: readonly string[],
  key: ProfileCategoryKey,
): ProfileCategoryKey[] {
  const selected = new Set(sanitizeProfileCategories(current));
  if (selected.has(key)) selected.delete(key);
  else selected.add(key);
  return PROFILE_CATEGORY_KEYS.filter((item) => selected.has(item));
}

export function isHttpsUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/[\s<>]/.test(trimmed)) return false;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return false;
    if (url.username || url.password) return false;
    if (!url.hostname) return false;
    if (url.hostname === "." || url.hostname.includes(" ")) return false;
    return true;
  } catch {
    return false;
  }
}

export function sanitizeSocialLinks(input: unknown): SocialLinks {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const result: SocialLinks = {};
  const record = input as Record<string, unknown>;
  for (const key of SOCIAL_NETWORK_KEYS) {
    const raw = record[key];
    if (typeof raw !== "string") continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (isHttpsUrl(trimmed)) result[key] = trimmed;
  }
  return result;
}

export function parseSocialLinkDrafts(input: unknown): Record<SocialNetworkKey, string> {
  const drafts = {} as Record<SocialNetworkKey, string>;
  const record =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  for (const key of SOCIAL_NETWORK_KEYS) {
    const raw = record[key];
    drafts[key] = typeof raw === "string" ? raw : "";
  }
  return drafts;
}

export function validateSocialLinkDrafts(drafts: Record<SocialNetworkKey, string>): {
  links: SocialLinks;
  errors: Partial<Record<SocialNetworkKey, string>>;
} {
  const links: SocialLinks = {};
  const errors: Partial<Record<SocialNetworkKey, string>> = {};

  for (const key of SOCIAL_NETWORK_KEYS) {
    const trimmed = (drafts[key] || "").trim();
    if (!trimmed) continue;
    if (!isHttpsUrl(trimmed)) {
      errors[key] = "Use uma URL https:// válida";
      continue;
    }
    links[key] = trimmed;
  }

  return { links, errors };
}

export function filledSocialLinks(
  input: unknown,
): { key: SocialNetworkKey; label: string; url: string }[] {
  const links = sanitizeSocialLinks(input);
  return SOCIAL_NETWORKS.flatMap((network) => {
    const url = links[network.key];
    return url ? [{ key: network.key, label: network.label, url }] : [];
  });
}

export type FollowGuardReason = "unauthenticated" | "missing_target" | "self";

export function canFollow(
  followerId: string | null | undefined,
  targetId: string | null | undefined,
): { ok: true } | { ok: false; reason: FollowGuardReason } {
  if (!followerId) return { ok: false, reason: "unauthenticated" };
  if (!targetId) return { ok: false, reason: "missing_target" };
  if (followerId === targetId) return { ok: false, reason: "self" };
  return { ok: true };
}

export function formatFollowersLabel(count: number): string {
  const safe = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return safe === 1 ? "1 seguidor" : `${safe} seguidores`;
}

export function formatFollowingLabel(count: number): string {
  const safe = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return `${safe} seguindo`;
}

export function profilePath(userId: string | null | undefined): string | null {
  if (!userId) return null;
  return `/perfil/${userId}`;
}

export const profileQueryKeys = {
  detail: (userId: string) => ["profile", userId] as const,
  followStatus: (targetId: string, viewerId: string) =>
    ["follow-status", targetId, viewerId] as const,
  followCounts: (userId: string) => ["follow-counts", userId] as const,
};

export function isSocialNetworkKey(value: unknown): value is SocialNetworkKey {
  return typeof value === "string" && SOCIAL_KEY_SET.has(value);
}
