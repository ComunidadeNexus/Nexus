import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronDown,
  Plus,
  Search,
  Loader2,
  Store,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/hooks/useAdmin";
import { useMarketplace } from "@/hooks/useMarketplace";
import {
  formatListingPrice,
  getMarketplaceCategory,
  getMarketplaceHighlight,
  type MarketplaceCategory,
  type MarketplaceHighlight,
} from "@/lib/marketplace";
import { MarketplaceCategoryIcon } from "@/components/marketplace/MarketplaceCategoryIcon";
import MarketplaceCategoriesDialog from "@/components/marketplace/MarketplaceCategoriesDialog";
import MarketplaceListingCard from "@/components/marketplace/MarketplaceListingCard";

const SORT_OPTIONS = [
  { value: "popular", label: "Mais vistos" },
  { value: "recent", label: "Mais recentes" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
] as const;

const MarketplaceComingSoon = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="glass-card p-12 rounded-2xl flex flex-col items-center text-center max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-primary/5 blur-[100px] -z-10" />
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Store className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-4">Marketplace</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Estamos preparando um espaço incrível para você comprar e vender com a comunidade. Aguarde
          a próxima atualização!
        </p>
        <div className="flex items-center gap-2 text-sm font-medium text-primary/80 bg-primary/10 px-4 py-2 rounded-full mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Em breve
        </div>
        <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
          Voltar
        </Button>
      </div>
    </div>
  );
};

const MarketplaceStorefront = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(params.get("q") || "");

  const categorySlug = params.get("categoria");
  const itemSlug = params.get("item");
  const sortBy = (params.get("ordenar") as (typeof SORT_OPTIONS)[number]["value"]) || "popular";
  const category = getMarketplaceCategory(categorySlug);
  const highlight = getMarketplaceHighlight(categorySlug, itemSlug);

  const { listings, sellers, isLoading } = useMarketplace({
    search: params.get("q") || undefined,
    category: category?.slug,
    subcategory: highlight?.slug,
    sortBy,
  });

  const stats = useMemo(() => {
    const sellersCount = new Set(listings.map((listing) => listing.user_id)).size;
    const minPrice = listings.reduce(
      (min, listing) => Math.min(min, listing.price),
      listings[0]?.price ?? 0,
    );
    return { sellersCount, minPrice };
  }, [listings]);

  const applyFilters = (next: Record<string, string | null>) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (!value) merged.delete(key);
      else merged.set(key, value);
    });
    setParams(merged, { replace: true });
  };

  const pickCategory = (picked: MarketplaceCategory) => {
    setCategoriesOpen(false);
    applyFilters({ categoria: picked.slug, item: null });
  };

  const pickHighlight = (picked: MarketplaceCategory, item: MarketplaceHighlight) => {
    setCategoriesOpen(false);
    applyFilters({ categoria: picked.slug, item: item.slug });
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    applyFilters({ q: localSearch.trim() || null });
  };

  const title = highlight?.label || category?.label || "Marketplace Nexus";

  return (
    <div className="w-full min-h-[70vh] bg-[#0b1018] text-white -mx-3 sm:-mx-4 md:mx-0 px-3 sm:px-4 md:px-0 pt-1 pb-10">
      <div className="sticky top-14 z-30 -mx-3 sm:-mx-4 md:mx-0 mb-4 px-3 sm:px-4 md:px-0 py-3 bg-[#0b1018] border-b border-white/10">
        <div className="flex items-center gap-2">
          <form onSubmit={submitSearch} className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar contas, gift cards, assinaturas..."
              className="h-11 pl-10 rounded-full bg-[#151b24] border-white/10 text-white placeholder:text-white/40"
            />
          </form>
          <button
            type="button"
            onClick={() => setCategoriesOpen(true)}
            className="hidden sm:inline-flex items-center gap-1 min-h-11 px-3 rounded-full text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5"
          >
            Categorias
            <ChevronDown className="w-4 h-4" />
          </button>
          <Button
            type="button"
            onClick={() => navigate("/marketplace/novo")}
            className="min-h-11 rounded-full px-4 font-bold text-white bg-gradient-to-r from-[#00C6FF] to-[#FF007F]"
          >
            <Plus className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Anunciar</span>
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setCategoriesOpen(true)}
          className="sm:hidden mt-2 inline-flex items-center gap-1 min-h-11 text-sm font-semibold text-[#00C6FF]"
        >
          Categorias
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3 rounded-xl border border-[#00C6FF]/20 bg-[#00C6FF]/10 px-4 py-2 text-xs sm:text-sm text-[#9ae8ff]">
        Vitrine interna da equipe. Usuários comuns continuam vendo Em breve.
      </div>

      {category && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00C6FF] to-[#FF007F] flex items-center justify-center shrink-0">
              <MarketplaceCategoryIcon name={category.icon} className="w-8 h-8 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/45">
                Marketplace
                {highlight ? ` · ${category.label}` : ""}
              </p>
              <h1 className="text-2xl font-bold truncate">{title}</h1>
              <p className="text-sm text-white/55 mt-1">
                {listings.length} {listings.length === 1 ? "anúncio" : "anúncios"}
                {listings.length > 0 && ` · a partir de ${formatListingPrice(stats.minPrice)}`}
                {` · ${stats.sellersCount} ${stats.sellersCount === 1 ? "vendedor" : "vendedores"}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-2">
            <ShieldCheck className="w-4 h-4 text-[#00C6FF]" />
            Compra e venda pela comunidade Nexus
          </div>
        </div>
      )}

      {!category && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-white/55 text-sm">Comprar e vender com a comunidade Nexus</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={category ? "Buscar nesta categoria..." : "Buscar anúncios..."}
            className="h-11 pl-10 rounded-full bg-[#151b24] border-white/10 text-white placeholder:text-white/40"
          />
        </form>
        <select
          value={sortBy}
          onChange={(e) => applyFilters({ ordenar: e.target.value })}
          className="h-11 min-h-11 rounded-full bg-[#151b24] border border-white/10 px-4 text-sm text-white"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Ordenar: {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/15 bg-[#121821]">
          <Store className="w-12 h-12 mx-auto text-white/30 mb-4" />
          <h3 className="text-lg font-medium">Nenhum anúncio ainda</h3>
          <p className="text-white/50 mb-4">Crie o primeiro para ir testando a vitrine.</p>
          <Button type="button" onClick={() => navigate("/marketplace/novo")}>
            Anunciar
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {listings.map((listing) => (
            <MarketplaceListingCard
              key={listing.id}
              listing={listing}
              seller={sellers[listing.user_id]}
            />
          ))}
        </div>
      )}

      <MarketplaceCategoriesDialog
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
        activeCategory={category?.slug}
        onPickCategory={pickCategory}
        onPickHighlight={pickHighlight}
      />
    </div>
  );
};

const Marketplace = () => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return <MarketplaceComingSoon />;
  return <MarketplaceStorefront />;
};

export default Marketplace;
