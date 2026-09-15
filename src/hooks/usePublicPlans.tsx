import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface PublicPlan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
  cakto_offer_id_monthly: string | null;
  cakto_offer_id_yearly: string | null;
}

const parseFeatures = (value: Json): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
};

export const usePublicPlans = () => {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    const { data, error } = await supabase
      .from("plans")
      .select("id, name, description, price_monthly, price_yearly, features, is_active, cakto_offer_id_monthly, cakto_offer_id_yearly")
      .eq("is_active", true)
      .gt("price_monthly", 0)
      .order("price_monthly", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      setPlans([]);
    } else {
      setPlans(
        (data || []).map((plan) => ({
          ...plan,
          price_monthly: Number(plan.price_monthly),
          price_yearly: Number(plan.price_yearly),
          features: parseFeatures(plan.features),
        })),
      );
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPlans();

    const channel = supabase
      .channel("public-plans")
      .on("postgres_changes", { event: "*", schema: "public", table: "plans" }, () => {
        fetchPlans();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPlans]);

  return { plans, isLoading, refetch: fetchPlans };
};
