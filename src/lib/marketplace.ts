export const LISTING_CONDITION_LABELS: Record<string, string> = {
  novo: "Novo",
  usado: "Usado",
  recondicionado: "Recondicionado",
};

export type MarketplaceHighlight = {
  slug: string;
  label: string;
  accent: string;
};

export type MarketplaceCategory = {
  slug: string;
  label: string;
  icon: string;
  highlights: MarketplaceHighlight[];
};

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    slug: "jogos",
    label: "Jogos",
    icon: "Gamepad2",
    highlights: [
      { slug: "steam", label: "Steam", accent: "from-[#1b2838] to-[#00C6FF]" },
      { slug: "valorant", label: "Valorant", accent: "from-[#ff4655] to-[#0f1923]" },
      { slug: "lol", label: "League of Legends", accent: "from-[#0bc4e9] to-[#c8aa6e]" },
      { slug: "fortnite", label: "Fortnite", accent: "from-[#9d4edd] to-[#00C6FF]" },
      { slug: "minecraft", label: "Minecraft", accent: "from-[#5d9c41] to-[#3b6d2a]" },
      { slug: "roblox", label: "Roblox", accent: "from-[#e2231a] to-[#111]" },
      { slug: "gta", label: "GTA", accent: "from-[#2b6cb0] to-[#1a365d]" },
      { slug: "freefire", label: "Free Fire", accent: "from-[#ff7a18] to-[#ff007f]" },
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

export function getMarketplaceCategory(slug: string | null | undefined) {
  const normalized = normalizeMarketplaceCategory(slug);
  if (!normalized) return null;
  return MARKETPLACE_CATEGORIES.find((category) => category.slug === normalized) ?? null;
}

export function getMarketplaceHighlight(categorySlug: string | null, itemSlug: string | null) {
  const category = getMarketplaceCategory(categorySlug);
  if (!category || !itemSlug) return null;
  return category.highlights.find((item) => item.slug === itemSlug) ?? null;
}

export const LISTING_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  MARKETPLACE_CATEGORIES.map((category) => [category.slug, category.label]),
);

export function formatListingPrice(price: number) {
  if (price <= 0) return "Grátis";
  return price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  });
}
