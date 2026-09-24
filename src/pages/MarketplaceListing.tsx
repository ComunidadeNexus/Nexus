import { useEffect, useRef } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Loader2, MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAdmin } from "@/hooks/useAdmin";
import { useMarketplace } from "@/hooks/useMarketplace";
import {
  formatListingPrice,
  LISTING_CATEGORY_LABELS,
  LISTING_CONDITION_LABELS,
} from "@/lib/marketplace";
import { UserAvatar, ProfileName } from "@/components/profile/ProfileLink";

const MarketplaceListing = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { listings, sellers, favorites, isLoading, toggleFavorite, incrementViews } =
    useMarketplace();

  const listing = listings.find((item) => item.id === listingId);
  const viewedId = useRef<string | null>(null);

  useEffect(() => {
    if (!listingId || !listing || viewedId.current === listingId) return;
    viewedId.current = listingId;
    void incrementViews(listingId);
  }, [listingId, listing, incrementViews]);

  if (adminLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/marketplace" replace />;

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-16">
        <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold mb-2">Anúncio não encontrado</h1>
        <Button variant="outline" onClick={() => navigate("/marketplace")}>
          Voltar ao marketplace
        </Button>
      </div>
    );
  }

  const seller = sellers[listing.user_id];
  const isFavorite = favorites.has(listing.id);

  return (
    <div className="w-full pb-8 max-w-3xl">
      <button
        type="button"
        onClick={() => navigate("/marketplace")}
        className="flex items-center gap-2 min-h-11 text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <div className="bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="grid gap-2 p-3 sm:grid-cols-2">
          {(listing.images.length > 0 ? listing.images : [null]).map((url, index) => (
            <div
              key={url || index}
              className="aspect-[16/10] rounded-lg bg-gray-100 dark:bg-[#2A3B42] overflow-hidden"
            >
              {url ? (
                <img
                  src={url}
                  alt={`${listing.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Store className="w-10 h-10" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{listing.title}</h1>
              <p className="text-2xl font-semibold text-primary mt-1">
                {formatListingPrice(listing.price)}
                {listing.is_negotiable && (
                  <span className="ml-2 text-sm font-medium text-muted-foreground">
                    Aceita negociação
                  </span>
                )}
              </p>
            </div>
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

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">
              {LISTING_CATEGORY_LABELS[listing.category] || listing.category}
            </Badge>
            {listing.condition && (
              <Badge variant="outline">
                {LISTING_CONDITION_LABELS[listing.condition] || listing.condition}
              </Badge>
            )}
            {listing.location && (
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {listing.location}
              </span>
            )}
          </div>

          <p className="mt-5 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {listing.description}
          </p>

          {seller && (
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <UserAvatar
                userId={seller.user_id}
                name={seller.name}
                avatarUrl={seller.avatar_url}
                className="w-10 h-10"
              />
              <div>
                <p className="text-xs text-muted-foreground">Anunciante</p>
                <ProfileName
                  userId={seller.user_id}
                  name={seller.name}
                  isVerified={seller.is_verified}
                  className="font-semibold"
                />
              </div>
              <Button asChild variant="outline" className="ml-auto">
                <Link to={`/perfil/${seller.user_id}`}>Ver perfil</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceListing;
