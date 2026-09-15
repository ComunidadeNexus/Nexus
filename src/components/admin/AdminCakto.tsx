import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { producerStatusLabel } from "@/hooks/useProducer";

const AdminCakto = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<"producers" | "orders" | "webhooks" | "subscriptions">("producers");
  const [fee, setFee] = useState("10");
  const [producers, setProducers] = useState<Array<{ user_id: string; full_name: string; tax_id_last4: string }>>([]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [orders, setOrders] = useState<Array<{ id: string; payment_status: string; amount: number; created_at: string }>>([]);
  const [events, setEvents] = useState<Array<{ id: string; event_type: string; processed: boolean; created_at: string }>>([]);
  const [subs, setSubs] = useState<Array<{ id: string; status: string; provider: string; created_at: string }>>([]);

  const load = async () => {
    const [{ data: producerRows }, { data: profileRows }, { data: orderRows }, { data: eventRows }, { data: feeRow }, { data: subRows }] =
      await Promise.all([
        supabase.from("producer_profiles").select("user_id, full_name, tax_id_last4"),
        supabase.from("profiles").select("user_id, producer_status").neq("producer_status", "none"),
        supabase.from("orders").select("id, payment_status, amount, created_at").order("created_at", { ascending: false }).limit(50),
        supabase
          .from("payment_webhook_events")
          .select("id, event_type, processed, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.from("system_settings").select("value").eq("key", "platform_fee_percentage").maybeSingle(),
        supabase
          .from("subscriptions")
          .select("id, status, provider, created_at")
          .eq("provider", "cakto")
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
    setProducers((producerRows || []) as typeof producers);
    const map: Record<string, string> = {};
    (profileRows || []).forEach((p) => {
      map[p.user_id] = p.producer_status;
    });
    setStatuses(map);
    setOrders((orderRows || []) as typeof orders);
    setEvents((eventRows || []) as typeof events);
    setSubs((subRows || []) as typeof subs);
    if (feeRow?.value != null) setFee(String(feeRow.value));
  };

  useEffect(() => {
    void load();
  }, []);

  const setStatus = async (userId: string, status: string) => {
    const { data, error } = await supabase.functions.invoke("cakto-admin-producer", {
      body: { user_id: userId, status },
    });
    if (error || data?.error) {
      toast({ variant: "destructive", title: "Falha ao atualizar", description: data?.error || error?.message });
      return;
    }
    toast({ title: "Status atualizado" });
    await load();
  };

  const saveFee = async () => {
    const { data, error } = await supabase.functions.invoke("cakto-admin-producer", {
      body: { action: "SET_PLATFORM_FEE", percentage: Number(fee) },
    });
    if (error || data?.error) {
      toast({ variant: "destructive", title: "Não salvou a comissão", description: data?.error || error?.message });
      return;
    }
    toast({ title: "Comissão Nexus atualizada" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cakto / Produtores</h1>
      <div className="flex gap-2">
        {(["producers", "orders", "webhooks", "subscriptions"] as const).map((id) => (
          <Button key={id} variant={tab === id ? "default" : "outline"} onClick={() => setTab(id)}>
            {id === "producers"
              ? "Produtores"
              : id === "orders"
                ? "Pedidos"
                : id === "webhooks"
                  ? "Webhooks"
                  : "Assinaturas"}
          </Button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Comissão Nexus (%)</p>
          <Input value={fee} onChange={(e) => setFee(e.target.value)} className="w-28" />
        </div>
        <Button onClick={() => void saveFee()}>Salvar</Button>
      </div>
      {tab === "producers" &&
        producers.map((p) => (
          <div key={p.user_id} className="rounded-lg border border-white/10 p-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p>{p.full_name}</p>
              <p className="text-xs text-muted-foreground">
                ••••{p.tax_id_last4} · {producerStatusLabel(statuses[p.user_id])}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void setStatus(p.user_id, "approved")}>
                Aprovar
              </Button>
              <Button size="sm" variant="outline" onClick={() => void setStatus(p.user_id, "rejected")}>
                Recusar
              </Button>
              <Button size="sm" variant="destructive" onClick={() => void setStatus(p.user_id, "suspended")}>
                Suspender
              </Button>
            </div>
          </div>
        ))}
      {tab === "orders" &&
        orders.map((o) => (
          <div key={o.id} className="rounded-lg border border-white/10 p-3 text-sm flex justify-between">
            <span>{o.payment_status}</span>
            <span>
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(o.amount))}
            </span>
          </div>
        ))}
      {tab === "webhooks" &&
        events.map((e) => (
          <div key={e.id} className="rounded-lg border border-white/10 p-3 text-sm flex justify-between">
            <span>{e.event_type}</span>
            <span>{e.processed ? "processado" : "pendente"}</span>
          </div>
        ))}
      {tab === "subscriptions" &&
        (subs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma assinatura Cakto confirmada ainda.</p>
        ) : (
          subs.map((s) => (
            <div key={s.id} className="rounded-lg border border-white/10 p-3 text-sm flex justify-between">
              <span>{s.provider}</span>
              <span>{s.status}</span>
            </div>
          ))
        ))}
    </div>
  );
};

export default AdminCakto;
