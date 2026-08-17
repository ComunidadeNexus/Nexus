import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ListingCategory = "produto" | "servico" | "digital";
export type ListingCondition = "novo" | "usado" | "recondicionado";
export type ListingStatus = "active" | "sold" | "paused" | "deleted";

interface MarketplaceListing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: string | null;
  images: string[];
  location: string | null;
  is_negotiable: boolean;
  status: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

interface ListingFilters {
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "recent" | "price_asc" | "price_desc" | "popular";
}

interface SellerInfo {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export const useMarketplace = (filters?: ListingFilters) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [sellers, setSellers] = useState<Record<string, SellerInfo>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchListings = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from("marketplace_listings")
        .select("*")
        .eq("status", "active");

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte("price", filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte("price", filters.maxPrice);
      }

      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      switch (filters?.sortBy) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "popular":
          query = query.order("views_count", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Parse images JSON
      const formattedListings: MarketplaceListing[] = (data || []).map((listing) => ({
        ...listing,
        images: Array.isArray(listing.images) 
          ? (listing.images as unknown as string[]).map(img => String(img))
          : [],
      }));

      setListings(formattedListings);

      // Fetch seller profiles
      const userIds = [...new Set((data || []).map((l) => l.user_id))];
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url, is_verified")
          .in("user_id", userIds);

        const sellersMap: Record<string, SellerInfo> = {};
        (profilesData || []).forEach((p) => {
          sellersMap[p.user_id] = {
            user_id: p.user_id,
            name: p.name,
            avatar_url: p.avatar_url,
            is_verified: p.is_verified,
          };
        });
        setSellers(sellersMap);
      }

      // Fetch user favorites
      if (user) {
        const { data: favoritesData } = await supabase
          .from("marketplace_favorites")
          .select("listing_id")
          .eq("user_id", user.id);

        setFavorites(new Set((favoritesData || []).map((f) => f.listing_id)));
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createListing = async (listing: Omit<MarketplaceListing, "id" | "user_id" | "views_count" | "created_at" | "updated_at">) => {
    if (!user) return { error: "Not authenticated", data: null };

    try {
      const { data, error } = await supabase
        .from("marketplace_listings")
        .insert({
          ...listing,
          user_id: user.id,
          images: listing.images || [],
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchListings();
      return { data, error: null };
    } catch (err: any) {
      console.error("Error creating listing:", err);
      return { error: err.message, data: null };
    }
  };

  const updateListing = async (id: string, updates: Partial<MarketplaceListing>) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("marketplace_listings")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      await fetchListings();
      return { error: null };
    } catch (err: any) {
      console.error("Error updating listing:", err);
      return { error: err.message };
    }
  };

  const deleteListing = async (id: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("marketplace_listings")
        .update({ status: "deleted" as ListingStatus })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      await fetchListings();
      return { error: null };
    } catch (err: any) {
      console.error("Error deleting listing:", err);
      return { error: err.message };
    }
  };

  const toggleFavorite = async (listingId: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      if (favorites.has(listingId)) {
        // Remove favorite
        await supabase
          .from("marketplace_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId);

        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        // Add favorite
        await supabase
          .from("marketplace_favorites")
          .insert({ user_id: user.id, listing_id: listingId });

        setFavorites((prev) => new Set([...prev, listingId]));
      }

      return { error: null };
    } catch (err: any) {
      console.error("Error toggling favorite:", err);
      return { error: err.message };
    }
  };

  const incrementViews = async (listingId: string) => {
    try {
      // Increment views directly with update
      const listing = listings.find(l => l.id === listingId);
      if (listing) {
        await supabase
          .from("marketplace_listings")
          .update({ views_count: listing.views_count + 1 })
          .eq("id", listingId);
      }
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user, filters?.category, filters?.minPrice, filters?.maxPrice, filters?.search, filters?.sortBy]);

  return {
    listings,
    sellers,
    favorites,
    isLoading,
    createListing,
    updateListing,
    deleteListing,
    toggleFavorite,
    incrementViews,
    refetch: fetchListings,
  };
};

export const useMyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyListings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("marketplace_listings")
        .select("*")
        .eq("user_id", user.id)
        .neq("status", "deleted")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedListings: MarketplaceListing[] = (data || []).map((listing) => ({
        ...listing,
        images: Array.isArray(listing.images) 
          ? (listing.images as unknown as string[]).map(img => String(img))
          : [],
      }));

      setListings(formattedListings);
    } catch (error) {
      console.error("Error fetching my listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  return {
    listings,
    isLoading,
    refetch: fetchMyListings,
  };
};
