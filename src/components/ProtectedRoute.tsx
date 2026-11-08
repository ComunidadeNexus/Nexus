import { useAuth } from "@/contexts/AuthContext";
import { isDurableSignedOut } from "@/lib/authStorage";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useIdentityStatus } from "@/hooks/useIdentityStatus";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowUnverified?: boolean;
}

const ProtectedRoute = ({ children, allowUnverified = false }: ProtectedRouteProps) => {
  const { user, loading, signingOut } = useAuth();
  const location = useLocation();
  const { cpfOnFile, loading: identityLoading, blockForReadError, refetch } = useIdentityStatus();

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
    // CPF on file is not identity proof. A failed read must not look like a missing CPF.
    if (blockForReadError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Não foi possível carregar o CPF desta conta. Nada foi alterado.
            </p>
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Tentar de novo
            </Button>
          </div>
        </div>
      );
    }
    if (!cpfOnFile) {
      return <Navigate to="/verificar-identidade" replace state={{ from: location.pathname }} />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
