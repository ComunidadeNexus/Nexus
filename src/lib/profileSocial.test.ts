import {
  canFollow,
  chosenCategoryLabels,
  filledSocialLinks,
  formatFollowersLabel,
  formatFollowingLabel,
  isHttpsUrl,
  PROFILE_CATEGORY_LABELS,
  normalizeSocialLinkDraft,
  sanitizeProfileCategories,
  sanitizeSocialLinks,
  toggleProfileCategory,
  validateSocialLinkDrafts,
} from "./profileSocial";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(PROFILE_CATEGORY_LABELS.content_creator === "Criador de conteúdo", "PT label for creator");
assert(PROFILE_CATEGORY_LABELS.musician === "Músico", "PT label for musician");
assert(PROFILE_CATEGORY_LABELS.developer === "Dev", "PT label for developer");
assert(PROFILE_CATEGORY_LABELS.other === "Outro", "PT label for other");

assert(
  JSON.stringify(sanitizeProfileCategories(["gamer", "hacker", "gamer", "dev"])) ===
    JSON.stringify(["gamer"]),
  "unknown keys dropped and duplicates collapsed",
);

assert(
  JSON.stringify(sanitizeProfileCategories(["influencer", "developer"])) ===
    JSON.stringify(["developer", "influencer"]),
  "chosen keys keep catalog order",
);

const labels = chosenCategoryLabels(["gamer", "content_creator", "not_a_role"]);
assert(labels.length === 2, "public profile only shows chosen categories");
assert(labels[0].label === "Criador de conteúdo", "first chosen label");
assert(labels[1].label === "Gamer", "second chosen label");
assert(
  !chosenCategoryLabels(["gamer"]).some((item) => item.key === "musician"),
  "unselected catalog keys never appear",
);

assert(
  JSON.stringify(toggleProfileCategory(["gamer"], "developer")) ===
    JSON.stringify(["developer", "gamer"]),
  "toggle adds a category",
);
assert(
  JSON.stringify(toggleProfileCategory(["gamer", "developer"], "gamer")) ===
    JSON.stringify(["developer"]),
  "toggle removes a category",
);

assert(isHttpsUrl("https://instagram.com/nexus") === true, "https url is valid");
assert(isHttpsUrl("https://x.com/nexus?ref=1") === true, "https url with query is valid");
assert(isHttpsUrl("http://instagram.com/nexus") === false, "http is rejected");
assert(isHttpsUrl("javascript:alert(1)") === false, "javascript url is rejected");
assert(isHttpsUrl("https://evil.com/path with space") === false, "whitespace is rejected");
assert(isHttpsUrl("ftp://example.com") === false, "non-https protocol is rejected");
assert(isHttpsUrl("") === false, "empty string is not a url");
assert(isHttpsUrl("  https://ok.com  ") === true, "trimmed https is valid");
assert(isHttpsUrl("https://user:pass@ok.com") === false, "credentials are rejected");

assert(
  JSON.stringify(sanitizeSocialLinks({ twitter: "https://x.com/n", website: "http://bad.com" })) ===
    JSON.stringify({ twitter: "https://x.com/n" }),
  "only https social links are kept",
);
assert(
  Object.keys(sanitizeSocialLinks({ discord: "https://discord.gg/x", website: "" })).length === 0,
  "unsupported networks and blanks are dropped",
);

const validated = validateSocialLinkDrafts({
  instagram: "https://instagram.com/ok",
  twitter: "x.com/nope",
  youtube: "",
  linkedin: "",
  tiktok: "",
  website: "https://nexus.community",
});
assert(validated.links.instagram === "https://instagram.com/ok", "valid instagram kept");
assert(validated.links.website === "https://nexus.community", "valid website kept");
assert(validated.links.twitter === "https://x.com/nope", "partial twitter url is normalized");
assert(validated.errors.twitter === undefined, "normalized twitter is valid");

assert(
  normalizeSocialLinkDraft("instagram", "@nexus") === "https://instagram.com/nexus",
  "instagram handle becomes url",
);
assert(
  normalizeSocialLinkDraft("youtube", "@canal") === "https://youtube.com/@canal",
  "youtube handle becomes url",
);
assert(
  normalizeSocialLinkDraft("instagram", "instagram.com/nexus") === "https://instagram.com/nexus",
  "instagram domain without protocol is filled",
);
assert(
  normalizeSocialLinkDraft("website", "seusite.com") === "https://seusite.com",
  "website without protocol is filled",
);

const invalidDraft = validateSocialLinkDrafts({
  instagram: "nao e um link",
  twitter: "",
  youtube: "",
  linkedin: "",
  tiktok: "",
  website: "",
});
assert(invalidDraft.errors.instagram !== undefined, "garbage instagram is flagged");
assert(invalidDraft.links.instagram === undefined, "garbage instagram is not saved");

const filled = filledSocialLinks({
  instagram: "https://instagram.com/ok",
  twitter: "",
  website: "https://nexus.community",
});
assert(filled.length === 2, "only filled links are returned");
assert(
  filled.every((item) => item.url.startsWith("https://")),
  "filled links are https",
);

assert(canFollow("a", "a").ok === false, "cannot follow self");
assert((canFollow("a", "a") as { reason: string }).reason === "self", "self reason");
assert(canFollow(null, "b").ok === false, "cannot follow when logged out");
assert(canFollow("a", "b").ok === true, "can follow another user");
assert(canFollow("a", undefined).ok === false, "missing target is blocked");

assert(formatFollowersLabel(0) === "0 seguidores", "zero followers plural");
assert(formatFollowersLabel(1) === "1 seguidor", "one follower singular");
assert(formatFollowersLabel(12) === "12 seguidores", "many followers plural");
assert(formatFollowingLabel(3) === "3 seguindo", "following label");

console.log("profileSocial.test.ts: all assertions passed");
