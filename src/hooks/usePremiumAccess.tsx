import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePremiumAccess = () => {
  const { user, loading: authLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const check = async () => {
      try {
        const { data, error } = await supabase.rpc("has_premium_access", {
          _user_id: user.id,
        });

        if (cancelled) return;

        if (!error) {
          setHasAccess(!!data);
          return;
        }

        console.error("Error checking premium access:", error);

        const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
        if (cancelled) return;
        setHasAccess((roles || []).some((row) => row.role === "premium" || row.role === "admin"));
      } catch (err) {
        if (cancelled) return;
        console.error("Error checking premium access:", err);
        setHasAccess(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void check();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { hasAccess, loading: authLoading || loading };
};
