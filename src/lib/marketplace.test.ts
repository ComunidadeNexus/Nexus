import { getMarketplaceCategory, MARKETPLACE_CATEGORIES } from "./marketplace";

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
  (getMarketplaceCategory("jogos")?.highlights.length || 0) > 0,
  "Jogos must have popular tiles",
);
assert(getMarketplaceCategory("digital")?.slug === "gift-cards", "legacy digital maps to gift cards");

console.log("marketplace catalog tests passed");
