import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ProducerFinance = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<
    Array<{
      id: string;
      gross_amount: number;
      gateway_fee: number;
      platform_fee: number;
      producer_amount: number;
      status: string;
      created_at: string;
    }>
  >([]);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("producer_transactions")
      .select("id, gross_amount, gateway_fee, platform_fee, producer_amount, status, created_at")
      .eq("producer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data || []) as typeof rows));
  }, [user]);

  const money = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v));

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Financeiro</h2>
      {rows.map((row) => (
        <div key={row.id} className="rounded-lg border border-white/10 p-3 text-sm grid sm:grid-cols-5 gap-2">
          <span>{row.status}</span>
          <span>Bruto {money(row.gross_amount)}</span>
          <span>Taxa Cakto {money(row.gateway_fee)}</span>
          <span>Nexus {money(row.platform_fee)}</span>
          <span>Você {money(row.producer_amount)}</span>
        </div>
      ))}
    </div>
  );
};

export default ProducerFinance;
