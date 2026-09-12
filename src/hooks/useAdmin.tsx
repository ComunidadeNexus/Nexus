import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_CHECK_TIMEOUT_MS = 6000;

export const useAdmin = () => {
  const { user, loading: authLoading, signingOut } = useAuth();
  const [roleAdmin, setRoleAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = user?.id;

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (signingOut || !userId) {
      setRoleAdmin(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    setLoading(true);

    const checkAdminRole = async () => {
      try {
        const query = supabase.from("user_roles").select("role").eq("user_id", userId);
        const { data, error } = await Promise.race([
          query,
          new Promise<never>((_, reject) => {
            timeoutId = setTimeout(
              () => reject(new Error("admin-check-timeout")),
              ADMIN_CHECK_TIMEOUT_MS,
            );
          }),
        ]);

        if (cancelled) return;

        if (error) {
          console.error("Error checking admin role:", error);
          setRoleAdmin(false);
        } else {
          setRoleAdmin((data || []).some((row) => row.role === "admin"));
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Error checking admin role:", err);
        // Timeout: stop the spinner and keep the last known role so a slow
        // re-check cannot trap an already-confirmed admin on the gate.
        if (!(err instanceof Error && err.message === "admin-check-timeout")) {
          setRoleAdmin(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void checkAdminRole();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, authLoading, signingOut]);

  // Drop admin immediately on Sair. Keep roleAdmin across user-object churn
  // (mobile getSession) so the admin gate does not bounce a confirmed admin.
  const isAdmin = !signingOut && roleAdmin;

  return { isAdmin, loading: signingOut ? false : authLoading || loading };
};
