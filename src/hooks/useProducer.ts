import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { producerStatusLabel, type ProducerStatus } from "@/lib/producerStatus";

export type { ProducerStatus };
export { producerStatusLabel };

export type ProducerProfile = {
  producer_type: string;
  full_name: string;
  business_name: string | null;
  tax_id_last4: string;
  tax_id_type: string;
  document_status: string;
  kyc_status: string;
  cakto_account_status: string | null;
};

export type ProducerProduct = {
  id: string;
  producer_id: string;
  title: string;
  description: string;
  price: number;
  status: string;
  checkout_url: string | null;
  created_at: string;
};

export const useProducer = () => {
  const { user } = useAuth();
  const [producerStatus, setProducerStatus] = useState<ProducerStatus>("none");
  const [isProducer, setIsProducer] = useState(false);
  const [profile, setProfile] = useState<ProducerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) {
      setProducerStatus("none");
      setIsProducer(false);
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: row }, { data: producer }] = await Promise.all([
      supabase.from("profiles").select("is_producer, producer_status").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("producer_profiles")
        .select("producer_type, full_name, business_name, tax_id_last4, tax_id_type, document_status, kyc_status, cakto_account_status")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    setIsProducer(Boolean(row?.is_producer));
    setProducerStatus((row?.producer_status as ProducerStatus) || "none");
    setProfile(producer);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { producerStatus, isProducer, profile, loading, refetch, statusLabel: producerStatusLabel(producerStatus) };
};
