import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchIsAdmin, getCachedAdminRole } from "@/lib/adminRole";

export const useAdmin = () => {
  const { user, session, loading: authLoading, signingOut } = useAuth();
  const userId = user?.id ?? null;
  const cached = getCachedAdminRole(userId);
  const [roleAdmin, setRoleAdmin] = useState(() => cached === true);
  const [loading, setLoading] = useState(() => cached === null && Boolean(userId));

  useEffect(() => {
    if (signingOut || !userId) {
      setRoleAdmin(false);
      setLoading(false);
      return;
    }

    const known = getCachedAdminRole(userId);
    if (known !== null) {
      setRoleAdmin(known);
      setLoading(false);
    } else {
      setLoading(true);
    }

    let cancelled = false;

    void fetchIsAdmin({
      userId,
      accessToken: session?.access_token,
      refreshToken: session?.refresh_token,
    }).then((result) => {
      if (cancelled) return;
      if (typeof result === "boolean") setRoleAdmin(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [userId, session?.access_token, session?.refresh_token, signingOut]);

  // Drop admin immediately on Sair. A cached/confirmed admin must not keep
  // the /admin spinner alive if auth flickers.
  const isAdmin = !signingOut && roleAdmin;
  const waiting = isAdmin ? false : cached === null && (loading || (authLoading && !userId));

  return { isAdmin, loading: signingOut ? false : waiting };
};
