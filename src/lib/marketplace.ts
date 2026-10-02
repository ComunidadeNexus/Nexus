export const LISTING_CONDITION_LABELS: Record<string, string> = {
  novo: "Novo",
  usado: "Usado",
  recondicionado: "Recondicionado",
};

const steamCapsule = (appId: number) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/capsule_616x353.jpg`;

const localCover = (file: string) => `/marketplace/games/${file}`;
const brandCover = (file: string) => `/marketplace/brands/${file}`;

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

const tile = (
  slug: string,
  label: string,
  accent: string,
  file: string,
  extra: Partial<MarketplaceHighlight> = {},
): MarketplaceHighlight =>
  game(slug, label, accent, brandCover(file), { fit: extra.fit ?? "contain", ...extra });

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
      tile("instagram", "Instagram", "from-[#f58529] to-[#dd2a7b]", "instagram.svg"),
      tile("tiktok", "TikTok", "from-[#25f4ee] to-[#fe2c55]", "tiktok.svg"),
      tile("youtube", "YouTube", "from-[#ff0000] to-[#282828]", "youtube.svg"),
      tile("x", "X / Twitter", "from-[#111] to-[#00C6FF]", "x.svg"),
    ],
  },
  {
    slug: "gift-cards",
    label: "Gift Cards",
    icon: "Gift",
    highlights: [
      tile("google-play", "Google Play", "from-[#34a853] to-[#4285f4]", "google-play.svg"),
      tile("apple", "Apple", "from-[#555] to-[#111]", "apple.svg"),
      tile("playstation", "PlayStation", "from-[#003087] to-[#0070d1]", "playstation.svg"),
      tile("xbox", "Xbox", "from-[#107c10] to-[#0b3d0b]", "xbox.svg"),
    ],
  },
  {
    slug: "discord",
    label: "Discord",
    icon: "MessageSquare",
    highlights: [
      tile("nitro", "Nitro", "from-[#5865f2] to-[#00C6FF]", "discord.svg"),
      tile("servidor", "Servidor", "from-[#5865f2] to-[#111]", "discord.svg"),
      tile("boost", "Boost", "from-[#f47fff] to-[#5865f2]", "discord.svg"),
    ],
  },
  {
    slug: "assinaturas",
    label: "Assinaturas e Premium",
    icon: "Crown",
    highlights: [
      tile("spotify", "Spotify", "from-[#1db954] to-[#191414]", "spotify.svg"),
      tile("netflix", "Netflix", "from-[#e50914] to-[#221f1f]", "netflix.svg"),
      tile("prime", "Prime Video", "from-[#00a8e1] to-[#232f3e]", "prime.svg"),
      tile("crunchyroll", "Crunchyroll", "from-[#f47521] to-[#111]", "crunchyroll.svg"),
      tile("youtube-premium", "YouTube Premium", "from-[#ff0000] to-[#282828]", "youtube.svg"),
    ],
  },
  {
    slug: "emails",
    label: "Emails",
    icon: "Mail",
    highlights: [
      tile("gmail", "Gmail", "from-[#ea4335] to-[#34a853]", "gmail.svg"),
      tile("outlook", "Outlook", "from-[#0078d4] to-[#00C6FF]", "outlook.svg"),
    ],
  },
  {
    slug: "licencas",
    label: "Licenças e Softwares",
    icon: "Monitor",
    highlights: [
      tile("windows", "Windows", "from-[#00adef] to-[#0078d7]", "windows.svg"),
      tile("office", "Office", "from-[#d83b01] to-[#eb3c00]", "office.svg"),
      tile("adobe", "Adobe", "from-[#ff0000] to-[#111]", "adobe.svg"),
    ],
  },
  {
    slug: "servicos-digitais",
    label: "Serviços Digitais",
    icon: "Sparkles",
    highlights: [
      tile("design", "Design", "from-[#00C6FF] to-[#FF007F]", "design.jpg", { fit: "cover" }),
      tile("dev", "Programação", "from-[#00C6FF] to-[#111]", "dev.jpg", { fit: "cover" }),
      tile("edicao", "Edição", "from-[#FF007F] to-[#111]", "edicao.svg"),
    ],
  },
  {
    slug: "cursos",
    label: "Cursos e Treinamentos",
    icon: "GraduationCap",
    highlights: [
      tile("tech", "Tecnologia", "from-[#00C6FF] to-[#111]", "tech.jpg", { fit: "cover" }),
      tile("games", "Games", "from-[#FF007F] to-[#111]", "games.jpg", { fit: "cover" }),
      tile("criacao", "Criação", "from-[#00C6FF] to-[#FF007F]", "criacao.jpg", { fit: "cover" }),
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
