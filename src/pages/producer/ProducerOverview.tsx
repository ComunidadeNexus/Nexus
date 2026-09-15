import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const ProducerOverview = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ sold: 0, month: 0, count: 0, available: 0, pending: 0, fee: 0 });

  useEffect(() => {
    if (!user) return;
    const start = new Date();
    start.setDate(1);
    void (async () => {
      const { data } = await supabase
        .from("producer_transactions")
        .select("gross_amount, producer_amount, platform_fee, status, created_at")
        .eq("producer_id", user.id);
      const rows = data || [];
      const confirmed = rows.filter((r) => r.status === "confirmed");
      const monthRows = confirmed.filter((r) => new Date(r.created_at) >= start);
      setStats({
        sold: confirmed.reduce((s, r) => s + Number(r.gross_amount), 0),
        month: monthRows.reduce((s, r) => s + Number(r.gross_amount), 0),
        count: confirmed.length,
        available: confirmed.reduce((s, r) => s + Number(r.producer_amount), 0),
        pending: rows.filter((r) => r.status === "pending").reduce((s, r) => s + Number(r.producer_amount), 0),
        fee: confirmed.reduce((s, r) => s + Number(r.platform_fee), 0),
      });
    })();
  }, [user]);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        ["Saldo disponível", money(stats.available)],
        ["Saldo pendente", money(stats.pending)],
        ["Total vendido", money(stats.sold)],
        ["Vendas no mês", money(stats.month)],
        ["Quantidade de vendas", String(stats.count)],
        ["Comissão Nexus", money(stats.fee)],
      ].map(([label, value]) => (
        <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold mt-1">{value}</p>
        </div>
      ))}
      <p className="sm:col-span-2 lg:col-span-3 text-xs text-muted-foreground">
        Valores vêm das vendas confirmadas pela Cakto. A Nexus não inventa saldo que esteja só no gateway.
      </p>
    </div>
  );
};

export default ProducerOverview;
