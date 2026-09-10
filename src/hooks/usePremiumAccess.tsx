import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const usePremiumAccess = () => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!user) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("has_premium_access", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Error checking premium access:", error);
        setHasAccess(false);
      } else {
        setHasAccess(!!data);
      }
      setLoading(false);
    };

    check();
  }, [user]);

  return { hasAccess, loading };
};
