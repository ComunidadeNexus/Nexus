import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const PREMIUM_CATEGORIES = [
  { value: "ferramentas", label: "Ferramentas" },
  { value: "marketing", label: "Marketing" },
  { value: "masterclass", label: "Masterclasses" },
  { value: "bastidores", label: "Bastidores" },
  { value: "geral", label: "Geral" },
] as const;

export type PremiumContentType = "download" | "video";

export interface PremiumItem {
  id: string;
  title: string;
  description: string | null;
  content_type: PremiumContentType;
  category: string;
  file_url: string;
  thumbnail_url: string | null;
  meta: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export const usePremiumItems = (mode: "admin" | "public" = "public") => {
  const { toast } = useToast();
  const [items, setItems] = useState<PremiumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    let query = supabase
      .from("premium_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (mode === "public") {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching premium items:", error);
      setItems([]);
    } else {
      setItems((data || []) as PremiumItem[]);
    }
    setIsLoading(false);
  }, [mode]);

  useEffect(() => {
    fetchItems();

    const channel = supabase
      .channel(`premium-items-${mode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "premium_items" }, () => {
        fetchItems();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchItems, mode]);

  const saveItem = async (
    payload: Omit<PremiumItem, "id" | "created_at" | "sort_order"> & { id?: string },
  ) => {
    const row = {
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      content_type: payload.content_type,
      category: payload.category || "geral",
      file_url: payload.file_url.trim(),
      thumbnail_url: payload.thumbnail_url?.trim() || null,
      meta: payload.meta?.trim() || null,
      is_published: payload.is_published,
    };

    const { error } = payload.id
      ? await supabase.from("premium_items").update(row).eq("id", payload.id)
      : await supabase.from("premium_items").insert(row);

    if (error) {
      toast({
        title: "Erro ao salvar prêmio",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: payload.id ? "Prêmio atualizado" : "Prêmio publicado",
      description: "Já aparece na área premium dos usuários.",
    });
    await fetchItems();
    return true;
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("premium_items").delete().eq("id", id);
    if (error) {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    toast({ title: "Prêmio removido" });
    await fetchItems();
    return true;
  };

  return { items, isLoading, fetchItems, saveItem, deleteItem };
};
