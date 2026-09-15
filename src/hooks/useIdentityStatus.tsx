import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type IdentityRecord = {
  cpf_last4: string;
  status: string;
  verified_at: string;
};

export const useIdentityStatus = () => {
  const { user } = useAuth();
  const [identity, setIdentity] = useState<IdentityRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) {
      setIdentity(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("identity_verifications")
      .select("cpf_last4, status, verified_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching identity status:", error);
      setIdentity(null);
    } else {
      setIdentity(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    identity,
    verified: Boolean(identity?.status),
    loading,
    refetch,
  };
};
