import { useAuth } from "@/contexts/AuthContext";
import { isDurableSignedOut } from "@/lib/authStorage";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useIdentityStatus } from "@/hooks/useIdentityStatus";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowUnverified?: boolean;
}

const ProtectedRoute = ({ children, allowUnverified = false }: ProtectedRouteProps) => {
  const { user, loading, signingOut } = useAuth();
  const location = useLocation();
  const { verified, loading: identityLoading } = useIdentityStatus();

  if (signingOut && isDurableSignedOut()) {
    return <Navigate to="/auth" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowUnverified) {
    if (identityLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    if (!verified) {
      return <Navigate to="/verificar-identidade" replace state={{ from: location.pathname }} />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
