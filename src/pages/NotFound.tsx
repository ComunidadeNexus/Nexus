import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error("404: rota inexistente:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="w-full min-h-[70vh] bg-background flex flex-col items-center justify-center px-4 py-16 text-center">
      <img
        src="/logo-nexus.png"
        alt="Nexus"
        className="h-16 w-auto max-w-[200px] object-contain mb-6"
      />
      <p className="text-sm font-bold tracking-widest text-primary mb-2">404</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Página não encontrada</h1>
      <p className="text-muted-foreground max-w-md mb-2">
        Esse endereço não existe, foi movido ou está escrito de outro jeito.
      </p>
      <p className="text-xs text-muted-foreground/70 font-mono break-all mb-8 max-w-full">
        {location.pathname}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          to={user ? "/comunidade" : "/"}
          className="inline-flex items-center justify-center min-h-11 px-6 py-3 rounded-full font-bold bg-gradient-to-r from-[#00C6FF] to-[#FF007F] text-white"
        >
          {user ? "Voltar à Comunidade" : "Página inicial"}
        </Link>
        {!user && (
          <Link
            to="/auth"
            className="inline-flex items-center justify-center min-h-11 px-6 py-3 rounded-full font-bold border border-border text-foreground"
          >
            Entrar
          </Link>
        )}
        {user && (
          <Link
            to="/"
            className="inline-flex items-center justify-center min-h-11 px-6 py-3 rounded-full font-bold border border-border text-foreground"
          >
            Página inicial
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotFound;
