export const LISTING_CONDITION_LABELS: Record<string, string> = {
  novo: "Novo",
  usado: "Usado",
  recondicionado: "Recondicionado",
};

const steamCapsule = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`;

const localCover = (file: string) => `/marketplace/games/${file}`;

export type MarketplaceHighlight = {
  id?: number;
  slug: string;
  label: string;
  accent: string;
  image?: string;
  fit?: "cover" | "contain";
  popularOrder?: number;
  sortOrder?: number;
  isActive?: boolean;
};

export type MarketplaceCategory = {
  id?: number;
  slug: string;
  label: string;
  icon: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
  highlights: MarketplaceHighlight[];
};

export const MARKETPLACE_CATEGORY_ICONS = [
  "Gamepad2",
  "Share2",
  "Gift",
  "MessageSquare",
  "Crown",
  "Mail",
  "Monitor",
  "Sparkles",
  "GraduationCap",
  "ShoppingBag",
  "Tag",
] as const;

export function slugifyMarketplaceLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

const game = (
  slug: string,
  label: string,
  accent: string,
  image: string,
  extra: Partial<MarketplaceHighlight> = {},
): MarketplaceHighlight => ({
  slug,
  label,
  accent,
  image,
  fit: extra.fit ?? "cover",
  popularOrder: extra.popularOrder,
});

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    slug: "jogos",
    label: "Jogos",
    icon: "Gamepad2",
    highlights: [
      game("albion", "Albion Online", "from-[#1a2a12] to-[#6b8f3a]", localCover("albion.jpg"), {
        popularOrder: 1,
      }),
      game(
        "clash-of-clans",
        "Clash Of Clans",
        "from-[#1a3d0a] to-[#7ac142]",
        localCover("clash-of-clans.jpg"),
        { fit: "contain", popularOrder: 2 },
      ),
      game("diablo-iv", "Diablo IV", "from-[#1a0505] to-[#7a1515]", localCover("diablo-iv.jpg"), {
        popularOrder: 3,
      }),
      game("arc-raiders", "Arc Raiders", "from-[#2a1808] to-[#c45a12]", localCover("arc-raiders.jpg"), {
        popularOrder: 4,
      }),
      game("poe2", "Path of Exile 2", "from-[#140808] to-[#6b1d1d]", localCover("poe2.jpg"), {
        popularOrder: 5,
      }),
      game(
        "minecraft",
        "Minecraft",
        "from-[#3b6d2a] to-[#5d9c41]",
        localCover("minecraft.jpg"),
        { popularOrder: 6 },
      ),
      game("poe", "Path Of Exile", "from-[#1b1208] to-[#8a6a2a]", localCover("poe.jpg"), {
        popularOrder: 7,
      }),
      game(
        "roblox",
        "Roblox",
        "from-[#111] to-[#e2231a]",
        localCover("roblox.svg"),
        { fit: "contain", popularOrder: 8 },
      ),
      game(
        "steam",
        "STEAM",
        "from-[#0b1c2d] to-[#1b2838]",
        localCover("steam.svg"),
        { fit: "contain", popularOrder: 9 },
      ),
      game(
        "valorant",
        "Valorant",
        "from-[#0f1923] to-[#ff4655]",
        localCover("valorant.jpg"),
        { popularOrder: 10 },
      ),
      game(
        "lol",
        "League of Legends",
        "from-[#091428] to-[#c8aa6e]",
        localCover("lol.png"),
        { fit: "contain", popularOrder: 11 },
      ),
      game(
        "fortnite",
        "Fortnite",
        "from-[#0b1030] to-[#5b4dff]",
        localCover("fortnite.svg"),
        { fit: "contain", popularOrder: 12 },
      ),
      game("cs2", "Counter-Strike 2", "from-[#111] to-[#de9b35]", steamCapsule(730)),
      game("gta-v", "Grand Theft Auto V", "from-[#102010] to-[#4aa03a]", steamCapsule(271590)),
      game("dota-2", "Dota 2", "from-[#111] to-[#c23c2a]", steamCapsule(570)),
      game("apex", "Apex Legends", "from-[#111] to-[#da292a]", steamCapsule(1172470)),
      game("elden-ring", "Elden Ring", "from-[#1a1408] to-[#c9a227]", steamCapsule(1245620)),
      game("bg3", "Baldur's Gate 3", "from-[#1a1008] to-[#8a5a20]", steamCapsule(1086940)),
      game("palworld", "Palworld", "from-[#0a2030] to-[#3db7e4]", steamCapsule(1623730)),
      game("rust", "Rust", "from-[#2a1a10] to-[#8b4513]", steamCapsule(252490)),
      game("pubg", "PUBG", "from-[#1a1a12] to-[#c4a35a]", steamCapsule(578080)),
      game("the-finals", "THE FINALS", "from-[#111] to-[#ef4444]", steamCapsule(2073850)),
      game("cyberpunk", "Cyberpunk 2077", "from-[#111] to-[#fcee0a]", steamCapsule(1091500)),
      game("rdr2", "Red Dead Redemption 2", "from-[#1a0808] to-[#8b1e1e]", steamCapsule(1174180)),
      game("dbd", "Dead by Daylight", "from-[#111] to-[#a11]", steamCapsule(381210)),
      game("warzone", "Call of Duty", "from-[#111] to-[#4b5563]", steamCapsule(1938090)),
      game("fc-25", "EA Sports FC", "from-[#052e16] to-[#16a34a]", steamCapsule(2669320)),
      game("warframe", "Warframe", "from-[#111] to-[#00C6FF]", steamCapsule(230410)),
    ],
  },
  {
    slug: "redes-sociais",
    label: "Redes Sociais",
    icon: "Share2",
    highlights: [
      { slug: "instagram", label: "Instagram", accent: "from-[#f58529] to-[#dd2a7b]" },
      { slug: "tiktok", label: "TikTok", accent: "from-[#25f4ee] to-[#fe2c55]" },
      { slug: "youtube", label: "YouTube", accent: "from-[#ff0000] to-[#282828]" },
      { slug: "x", label: "X / Twitter", accent: "from-[#111] to-[#00C6FF]" },
    ],
  },
  {
    slug: "gift-cards",
    label: "Gift Cards",
    icon: "Gift",
    highlights: [
      { slug: "google-play", label: "Google Play", accent: "from-[#34a853] to-[#4285f4]" },
      { slug: "apple", label: "Apple", accent: "from-[#555] to-[#111]" },
      { slug: "playstation", label: "PlayStation", accent: "from-[#003087] to-[#0070d1]" },
      { slug: "xbox", label: "Xbox", accent: "from-[#107c10] to-[#0b3d0b]" },
    ],
  },
  {
    slug: "discord",
    label: "Discord",
    icon: "MessageSquare",
    highlights: [
      { slug: "nitro", label: "Nitro", accent: "from-[#5865f2] to-[#00C6FF]" },
      { slug: "servidor", label: "Servidor", accent: "from-[#5865f2] to-[#111]" },
      { slug: "boost", label: "Boost", accent: "from-[#f47fff] to-[#5865f2]" },
    ],
  },
  {
    slug: "assinaturas",
    label: "Assinaturas e Premium",
    icon: "Crown",
    highlights: [
      { slug: "spotify", label: "Spotify", accent: "from-[#1db954] to-[#191414]" },
      { slug: "netflix", label: "Netflix", accent: "from-[#e50914] to-[#221f1f]" },
      { slug: "prime", label: "Prime Video", accent: "from-[#00a8e1] to-[#232f3e]" },
      { slug: "crunchyroll", label: "Crunchyroll", accent: "from-[#f47521] to-[#111]" },
      { slug: "youtube-premium", label: "YouTube Premium", accent: "from-[#ff0000] to-[#282828]" },
    ],
  },
  {
    slug: "emails",
    label: "Emails",
    icon: "Mail",
    highlights: [
      { slug: "gmail", label: "Gmail", accent: "from-[#ea4335] to-[#34a853]" },
      { slug: "outlook", label: "Outlook", accent: "from-[#0078d4] to-[#00C6FF]" },
    ],
  },
  {
    slug: "licencas",
    label: "Licenças e Softwares",
    icon: "Monitor",
    highlights: [
      { slug: "windows", label: "Windows", accent: "from-[#00adef] to-[#0078d7]" },
      { slug: "office", label: "Office", accent: "from-[#d83b01] to-[#eb3c00]" },
      { slug: "adobe", label: "Adobe", accent: "from-[#ff0000] to-[#111]" },
    ],
  },
  {
    slug: "servicos-digitais",
    label: "Serviços Digitais",
    icon: "Sparkles",
    highlights: [
      { slug: "design", label: "Design", accent: "from-[#00C6FF] to-[#FF007F]" },
      { slug: "dev", label: "Programação", accent: "from-[#00C6FF] to-[#111]" },
      { slug: "edicao", label: "Edição", accent: "from-[#FF007F] to-[#111]" },
    ],
  },
  {
    slug: "cursos",
    label: "Cursos e Treinamentos",
    icon: "GraduationCap",
    highlights: [
      { slug: "tech", label: "Tecnologia", accent: "from-[#00C6FF] to-[#111]" },
      { slug: "games", label: "Games", accent: "from-[#FF007F] to-[#111]" },
      { slug: "criacao", label: "Criação", accent: "from-[#00C6FF] to-[#FF007F]" },
    ],
  },
];

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  produto: "servicos-digitais",
  servico: "servicos-digitais",
  digital: "gift-cards",
};

export function normalizeMarketplaceCategory(slug: string | null | undefined) {
  if (!slug) return null;
  return LEGACY_CATEGORY_MAP[slug] ?? slug;
}

export function getMarketplaceCategory(
  slug: string | null | undefined,
  catalog: MarketplaceCategory[] = MARKETPLACE_CATEGORIES,
) {
  const normalized = normalizeMarketplaceCategory(slug);
  if (!normalized) return null;
  return catalog.find((category) => category.slug === normalized) ?? null;
}

export function getMarketplaceHighlight(
  categorySlug: string | null,
  itemSlug: string | null,
  catalog: MarketplaceCategory[] = MARKETPLACE_CATEGORIES,
) {
  const category = getMarketplaceCategory(categorySlug, catalog);
  if (!category || !itemSlug) return null;
  return category.highlights.find((item) => item.slug === itemSlug) ?? null;
}

export function sortMarketplaceHighlights(
  items: MarketplaceHighlight[],
  sort: "popular" | "az",
) {
  if (sort === "az") {
    return [...items].sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }
  return [...items].sort((a, b) => {
    const aRank = a.popularOrder ?? Number.MAX_SAFE_INTEGER;
    const bRank = b.popularOrder ?? Number.MAX_SAFE_INTEGER;
    if (aRank !== bRank) return aRank - bRank;
    return a.label.localeCompare(b.label, "pt-BR");
  });
}

export const LISTING_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  MARKETPLACE_CATEGORIES.map((category) => [category.slug, category.label]),
);

export function listingCategoryLabels(catalog: MarketplaceCategory[] = MARKETPLACE_CATEGORIES) {
  return Object.fromEntries(catalog.map((category) => [category.slug, category.label]));
}

export function formatListingPrice(price: number) {
  if (price <= 0) return "Grátis";
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  });
}
