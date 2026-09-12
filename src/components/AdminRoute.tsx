import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ADMIN_GATE_TIMEOUT_MS = 8000;

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading, signingOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const location = useLocation();
  const [gateTimedOut, setGateTimedOut] = useState(false);

  useEffect(() => {
    if (signingOut || isAdmin || (!authLoading && !adminLoading)) {
      setGateTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => setGateTimedOut(true), ADMIN_GATE_TIMEOUT_MS);
    return () => window.clearTimeout(timeoutId);
  }, [signingOut, isAdmin, authLoading, adminLoading]);

  if (signingOut) {
    return <Navigate to="/auth" replace />;
  }

  // A confirmed admin must reach the panel even if a re-check sets loading again
  // (common on mobile when getSession + onAuthStateChange churn the user object).
  // isAdmin is already false while signingOut, so Sair cannot keep this mounted.
  if (isAdmin) {
    return <>{children}</>;
  }

  if ((authLoading || adminLoading) && !gateTimedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  return <Navigate to="/comunidade" replace />;
};

export default AdminRoute;
