import { NavLink, Outlet, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useProducer } from "@/hooks/useProducer";
import { cn } from "@/lib/utils";

const links = [
  { to: "/produtor", label: "Visão geral", end: true },
  { to: "/produtor/produtos", label: "Produtos" },
  { to: "/produtor/vendas", label: "Vendas" },
  { to: "/produtor/clientes", label: "Clientes" },
  { to: "/produtor/financeiro", label: "Financeiro" },
  { to: "/produtor/assinaturas", label: "Assinaturas" },
  { to: "/produtor/configuracoes", label: "Configurações" },
];

const ProducerLayout = () => {
  const { isProducer, loading, statusLabel } = useProducer();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isProducer) return <Navigate to="/comecar-a-vender" replace />;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Painel do Produtor</p>
      <p className="text-sm mb-4">{statusLabel}</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              cn(
                "px-3 py-1.5 rounded-lg text-sm",
                isActive ? "bg-primary text-primary-foreground" : "bg-white/5 hover:bg-white/10",
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
};

export default ProducerLayout;
