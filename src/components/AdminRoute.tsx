import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_GATE_TIMEOUT_MS, resolveAdminGate } from "@/lib/adminGate";
import { Loader2 } from "lucide-react";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading, signingOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();
  const userId = user?.id ?? "anon";
  const [gateTimedOut, setGateTimedOut] = useState(false);
  const timerForIdentity = useRef<string | null>(null);

  // One-shot timer keyed only by auth identity. PR #8 reset this whenever
  // authLoading/adminLoading flickered, so the 8s cap never fired on mobile.
  useEffect(() => {
    if (signingOut) return;
    if (timerForIdentity.current === userId) return;

    timerForIdentity.current = userId;
    setGateTimedOut(false);
    const timeoutId = window.setTimeout(() => setGateTimedOut(true), ADMIN_GATE_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [userId, signingOut]);

  if (signingOut) {
    return <Navigate to="/auth" replace />;
  }

  const view = resolveAdminGate({
    isAdmin,
    userPresent: Boolean(user),
    waiting: authLoading || adminLoading,
    gateTimedOut,
  });

  if (view === "children") {
    return <>{children}</>;
  }

  if (view === "spinner") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (view === "auth") {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  return <Navigate to="/comunidade" replace />;
};

export default AdminRoute;
