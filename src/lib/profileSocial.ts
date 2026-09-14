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
  { key: "instagram", label: "Instagram", placeholder: "@seuusuario ou https://instagram.com/seuusuario" },
  { key: "twitter", label: "X / Twitter", placeholder: "@seuusuario ou https://x.com/seuusuario" },
  { key: "youtube", label: "YouTube", placeholder: "@canal ou https://youtube.com/@canal" },
  { key: "linkedin", label: "LinkedIn", placeholder: "seuusuario ou https://linkedin.com/in/seuusuario" },
  { key: "tiktok", label: "TikTok", placeholder: "@seuusuario ou https://tiktok.com/@seuusuario" },
  { key: "website", label: "Site", placeholder: "seusite.com ou https://seusite.com" },
];

const SOCIAL_HOSTS: Record<SocialNetworkKey, string[]> = {
  instagram: ["instagram.com", "www.instagram.com"],
  twitter: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"],
  youtube: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
  linkedin: ["linkedin.com", "www.linkedin.com"],
  tiktok: ["tiktok.com", "www.tiktok.com", "vm.tiktok.com"],
  website: [],
};

function hostnameOfLooseUrl(value: string): string | null {
  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
    return new URL(withProtocol).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function matchesKnownHost(value: string, hosts: string[]): boolean {
  const hostname = hostnameOfLooseUrl(value);
  if (!hostname) return false;
  return hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

/** Turns @usuario, dominio.com/user or http://... into an https URL the user can save. */
export function normalizeSocialLinkDraft(key: SocialNetworkKey, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  let value = trimmed;
  if (/^http:\/\//i.test(value)) {
    value = value.replace(/^http:\/\//i, "https://");
  }
  if (value.startsWith("//")) {
    value = `https:${value}`;
  }
  if (/^https:\/\//i.test(value)) {
    return value;
  }

  if (key === "website") {
    return `https://${value.replace(/^\/+/, "")}`;
  }

  if (matchesKnownHost(value, SOCIAL_HOSTS[key])) {
    return `https://${value.replace(/^\/+/, "")}`;
  }

  const handle = value.replace(/^@/, "").replace(/^\/+/, "");
  if (!handle || /\s/.test(handle)) return trimmed;

  switch (key) {
    case "instagram":
      return `https://instagram.com/${handle}`;
    case "twitter":
      return `https://x.com/${handle}`;
    case "youtube":
      return handle.includes("/")
        ? `https://youtube.com/${handle.replace(/^\/+/, "")}`
        : `https://youtube.com/@${handle}`;
    case "linkedin":
      if (handle.startsWith("in/") || handle.startsWith("company/")) {
        return `https://linkedin.com/${handle}`;
      }
      return `https://linkedin.com/in/${handle}`;
    case "tiktok":
      return `https://tiktok.com/@${handle}`;
    default:
      return trimmed;
  }
}

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
    const normalized = normalizeSocialLinkDraft(key, trimmed);
    if (!isHttpsUrl(normalized)) {
      errors[key] = "Cole o link https:// ou o @usuario";
      continue;
    }
    links[key] = normalized;
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
