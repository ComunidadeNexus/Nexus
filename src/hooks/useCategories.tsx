import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  parent_id: string | null;
  order_position: number;
  is_admin_only: boolean;
  is_premium_only: boolean;
  is_active: boolean;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("order_position", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err as Error);
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoryById = (id: string | null) => {
    if (!id) return null;
    return categories.find((cat) => cat.id === id) || null;
  };

  return {
    categories,
    isLoading,
    error,
    refetch: fetchCategories,
    getCategoryById,
  };
};
