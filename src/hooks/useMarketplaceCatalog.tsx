import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  MARKETPLACE_CATEGORIES,
  type MarketplaceCategory,
  type MarketplaceHighlight,
} from "@/lib/marketplace";

type CatalogMode = "storefront" | "admin";

type CategoryRow = {
  id: number;
  slug: string;
  label: string;
  icon: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  marketplace_category_items: ItemRow[] | null;
};

type ItemRow = {
  id: number;
  slug: string;
  label: string;
  image_url: string | null;
  accent: string;
  fit: string;
  popular_order: number | null;
  sort_order: number;
  is_active: boolean;
};

const mapItem = (item: ItemRow): MarketplaceHighlight => ({
  id: item.id,
  slug: item.slug,
  label: item.label,
  accent: item.accent,
  image: item.image_url || undefined,
  fit: item.fit === "contain" ? "contain" : "cover",
  popularOrder: item.popular_order ?? undefined,
  sortOrder: item.sort_order,
  isActive: item.is_active,
});

const mapCategory = (row: CategoryRow): MarketplaceCategory => ({
  id: row.id,
  slug: row.slug,
  label: row.label,
  icon: row.icon,
  image: row.image_url || undefined,
  sortOrder: row.sort_order,
  isActive: row.is_active,
  highlights: [...(row.marketplace_category_items || [])]
    .sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label, "pt-BR"))
    .map(mapItem),
});

export async function uploadMarketplaceCatalogImage(userId: string, file: File) {
  const isJpeg = file.type === "image/jpeg" || file.type === "image/jpg";
  const isPng = file.type === "image/png";
  if (!isJpeg && !isPng) {
    throw new Error("Envie uma imagem JPG ou PNG");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("A imagem deve ter no máximo 5MB");
  }

  const ext = isPng ? "png" : "jpg";
  const path = `${userId}/catalog/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("marketplace").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("marketplace").getPublicUrl(path);
  return data.publicUrl;
}

export function useMarketplaceCatalog(mode: CatalogMode = "storefront") {
  const { user } = useAuth();
  const [rows, setRows] = useState<MarketplaceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    const { data, error: queryError } = await supabase
      .from("marketplace_categories")
      .select("*, marketplace_category_items(*)")
      .order("sort_order", { ascending: true })
      .order("label", { ascending: true });

    if (queryError) {
      setError(queryError.message);
      setRows([]);
      setIsLoading(false);
      return;
    }

    setError(null);
    setRows((data as CategoryRow[] | null)?.map(mapCategory) ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  const categories = useMemo(() => {
    const source = error ? (mode === "storefront" ? MARKETPLACE_CATEGORIES : []) : rows;
    if (mode === "admin") return source;
    return source
      .filter((category) => category.isActive !== false)
      .map((category) => ({
        ...category,
        highlights: category.highlights.filter((item) => item.isActive !== false),
      }));
  }, [error, mode, rows]);

  const saveCategory = async (payload: {
    id?: number;
    slug: string;
    label: string;
    icon: string;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
  }) => {
    const body = {
      slug: payload.slug,
      label: payload.label.trim(),
      icon: payload.icon,
      image_url: payload.image_url,
      sort_order: payload.sort_order,
      is_active: payload.is_active,
    };
    const query = payload.id
      ? supabase.from("marketplace_categories").update(body).eq("id", payload.id)
      : supabase.from("marketplace_categories").insert(body);
    const { error: saveError } = await query;
    if (saveError) throw saveError;
    await fetchCatalog();
  };

  const saveItem = async (payload: {
    id?: number;
    category_id: number;
    slug: string;
    label: string;
    image_url: string | null;
    accent: string;
    fit: "cover" | "contain";
    popular_order: number | null;
    sort_order: number;
    is_active: boolean;
  }) => {
    const body = {
      category_id: payload.category_id,
      slug: payload.slug,
      label: payload.label.trim(),
      image_url: payload.image_url,
      accent: payload.accent,
      fit: payload.fit,
      popular_order: payload.popular_order,
      sort_order: payload.sort_order,
      is_active: payload.is_active,
    };
    const query = payload.id
      ? supabase.from("marketplace_category_items").update(body).eq("id", payload.id)
      : supabase.from("marketplace_category_items").insert(body);
    const { error: saveError } = await query;
    if (saveError) throw saveError;
    await fetchCatalog();
  };

  const deleteCategory = async (id: number) => {
    const { error: deleteError } = await supabase.from("marketplace_categories").delete().eq("id", id);
    if (deleteError) throw deleteError;
    await fetchCatalog();
  };

  const deleteItem = async (id: number) => {
    const { error: deleteError } = await supabase
      .from("marketplace_category_items")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;
    await fetchCatalog();
  };

  const uploadImage = async (file: File) => {
    if (!user) throw new Error("Faça login para enviar imagens");
    return uploadMarketplaceCatalogImage(user.id, file);
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCatalog,
    saveCategory,
    saveItem,
    deleteCategory,
    deleteItem,
    uploadImage,
  };
}
