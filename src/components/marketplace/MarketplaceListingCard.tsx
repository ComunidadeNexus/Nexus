import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import type { MarketplaceListing } from "@/hooks/useMarketplace";
import { formatListingPrice, LISTING_CATEGORY_LABELS } from "@/lib/marketplace";
import { UserAvatar, ProfileName } from "@/components/profile/ProfileLink";

type Seller = {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
};

const MarketplaceListingCard = ({
  listing,
  seller,
}: {
  listing: MarketplaceListing;
  seller?: Seller;
}) => {
  const cover = listing.images[0];

  return (
    <Link
      to={`/marketplace/${listing.id}`}
      className="group block rounded-xl overflow-hidden bg-[#121821] border border-white/5 hover:border-[#00C6FF]/40 transition-colors"
    >
      <div className="relative aspect-[16/10] bg-[#1b2430] overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30">
            <Store className="w-10 h-10" />
          </div>
        )}
        {listing.views_count > 0 && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white">
            {listing.views_count} {listing.views_count === 1 ? "view" : "views"}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[11px] text-white/45 mb-1 truncate">
          {LISTING_CATEGORY_LABELS[listing.category] || listing.category}
        </p>
        <h2 className="text-sm font-semibold text-white line-clamp-2 min-h-10">{listing.title}</h2>
        {seller && (
          <div className="flex items-center gap-2 mt-2">
            <UserAvatar
              userId={seller.user_id}
              name={seller.name}
              avatarUrl={seller.avatar_url}
              className="w-5 h-5"
            />
            <ProfileName
              userId={seller.user_id}
              name={seller.name}
              isVerified={seller.is_verified}
              className="text-xs text-white/60"
            />
          </div>
        )}
        <p className="mt-2 text-sm font-bold text-white">{formatListingPrice(listing.price)}</p>
      </div>
    </Link>
  );
};

export default MarketplaceListingCard;
