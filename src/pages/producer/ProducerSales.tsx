import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ProducerSales = () => {
  const { user } = useAuth();
  const [rows, setRows] = useState<Array<{ id: string; amount: number; payment_status: string; created_at: string }>>([]);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("orders")
      .select("id, amount, payment_status, created_at")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data || []) as typeof rows));
  }, [user]);

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Vendas</h2>
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma venda ainda.</p>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="rounded-lg border border-white/10 p-3 text-sm flex justify-between">
            <span>{row.payment_status}</span>
            <span>
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(row.amount))}
            </span>
          </div>
        ))
      )}
    </div>
  );
};

export default ProducerSales;
