import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store, Plus, Search, Loader2, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/hooks/useAdmin";
import { useMarketplace, type ListingCategory } from "@/hooks/useMarketplace";
import { formatListingPrice, LISTING_CATEGORY_LABELS } from "@/lib/marketplace";
import { UserAvatar, ProfileName } from "@/components/profile/ProfileLink";

const CATEGORY_FILTERS: { value: ListingCategory | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "produto", label: "Produto físico" },
  { value: "servico", label: "Serviço" },
  { value: "digital", label: "Digital" },
];

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
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ListingCategory | "all">("all");
  const { listings, sellers, favorites, isLoading, toggleFavorite } = useMarketplace({
    search: search.trim() || undefined,
    category: category === "all" ? undefined : category,
  });

  return (
    <div className="w-full pb-8">
      <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
        Vitrine interna da equipe. Usuários comuns continuam vendo <strong>Em breve</strong>.
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Anúncios da comunidade para comprar e vender</p>
        </div>
        <Button
          type="button"
          onClick={() => navigate("/marketplace/novo")}
          className="min-h-11 gap-2 rounded-full font-bold text-white bg-gradient-to-r from-[#00C6FF] to-[#FF007F]"
        >
          <Plus className="w-4 h-4" />
          Novo anúncio
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar anúncios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORY_FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            className={`min-h-11 px-3 rounded-full text-sm font-semibold border transition-colors ${
              category === item.value
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-white dark:bg-[#1A282D] text-muted-foreground border-gray-200 dark:border-gray-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#1A282D] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum anúncio ainda</h3>
          <p className="text-muted-foreground mb-4">Crie o primeiro para ir testando a vitrine.</p>
          <Button type="button" onClick={() => navigate("/marketplace/novo")}>
            Criar anúncio
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {listings.map((listing) => {
            const seller = sellers[listing.user_id];
            const cover = listing.images[0];
            const isFavorite = favorites.has(listing.id);

            return (
              <div
                key={listing.id}
                className="bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <Link to={`/marketplace/${listing.id}`} className="block">
                  <div className="aspect-[16/10] bg-gray-100 dark:bg-[#2A3B42] overflow-hidden">
                    {cover ? (
                      <img src={cover} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Store className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/marketplace/${listing.id}`} className="min-w-0">
                      <h2 className="font-bold truncate">{listing.title}</h2>
                      <p className="text-lg font-semibold text-primary">
                        {formatListingPrice(listing.price)}
                      </p>
                    </Link>
                    <button
                      type="button"
                      aria-label={isFavorite ? "Remover dos favoritos" : "Favoritar"}
                      onClick={() => void toggleFavorite(listing.id)}
                      className="min-h-11 min-w-11 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#2A3B42]"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                      />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary">
                      {LISTING_CATEGORY_LABELS[listing.category] || listing.category}
                    </Badge>
                    {listing.location && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {listing.location}
                      </span>
                    )}
                  </div>
                  {seller && (
                    <div className="flex items-center gap-2 mt-3">
                      <UserAvatar
                        userId={seller.user_id}
                        name={seller.name}
                        avatarUrl={seller.avatar_url}
                        className="w-6 h-6"
                      />
                      <ProfileName
                        userId={seller.user_id}
                        name={seller.name}
                        isVerified={seller.is_verified}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
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
