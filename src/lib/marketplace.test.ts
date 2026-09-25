import { getMarketplaceCategory, MARKETPLACE_CATEGORIES, slugifyMarketplaceLabel, sortMarketplaceHighlights } from "./marketplace";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

assert(MARKETPLACE_CATEGORIES.length >= 8, "marketplace catalog needs the category row");
assert(
  MARKETPLACE_CATEGORIES.some((category) => category.slug === "jogos"),
  "Jogos stays as a marketplace category",
);
assert(
  MARKETPLACE_CATEGORIES.some((category) => category.slug === "assinaturas"),
  "Assinaturas e Premium stays as a marketplace category",
);
assert(
  (getMarketplaceCategory("jogos")?.highlights.filter((item) => item.popularOrder != null).length ||
    0) === 12,
  "Jogos popular row has the 12 featured titles",
);
assert(
  getMarketplaceCategory("jogos")?.highlights[0]?.slug === "albion",
  "Albion Online leads the Jogos catalog",
);
assert(
  getMarketplaceCategory("jogos")?.highlights.every((item) => Boolean(item.image)),
  "every game tile has a cover image",
);
assert(
  JSON.stringify(
    sortMarketplaceHighlights(
      getMarketplaceCategory("jogos")?.highlights.filter((item) => item.popularOrder != null) || [],
      "popular",
    ).map((item) => item.slug),
  ) ===
    JSON.stringify([
      "albion",
      "clash-of-clans",
      "diablo-iv",
      "arc-raiders",
      "poe2",
      "minecraft",
      "poe",
      "roblox",
      "steam",
      "valorant",
      "lol",
      "fortnite",
    ]),
  "Popular Jogos keeps the reference order",
);
assert(
  getMarketplaceCategory("jogos")
    ?.highlights.filter((item) => item.popularOrder != null)
    .every((item) => item.image?.startsWith("/marketplace/games/")),
  "featured covers are served from local marketplace assets",
);
assert(getMarketplaceCategory("digital")?.slug === "gift-cards", "legacy digital maps to gift cards");
assert(
  slugifyMarketplaceLabel("Assinaturas e Premium") === "assinaturas-e-premium",
  "category names become url slugs",
);

console.log("marketplace catalog tests passed");
