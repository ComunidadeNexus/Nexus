import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  features: any;
  is_active: boolean;
  stripe_price_id_monthly: string | null;
  stripe_price_id_yearly: string | null;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  interval: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "Ativa", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  canceled: { label: "Cancelada", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  past_due: { label: "Em Atraso", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  trialing: { label: "Trial", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

const emptyPlan = {
  name: "", description: "", price_monthly: 0, price_yearly: 0,
  features: [], is_active: true,
  stripe_price_id_monthly: "", stripe_price_id_yearly: "",
};

const AdminAssinaturas = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Plan | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [featuresText, setFeaturesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"plans" | "subscriptions">("plans");

  useEffect(() => { fetchPlans(); fetchSubscriptions(); }, []);

  const fetchPlans = async () => {
    setLoadingPlans(true);
    const { data } = await supabase.from("plans").select("*").order("price_monthly");
    setPlans(data || []);
    setLoadingPlans(false);
  };

  const fetchSubscriptions = async () => {
    setLoadingSubs(true);
    const { data } = await supabase.from("subscriptions").select("*").order("created_at", { ascending: false }).limit(50);
    setSubscriptions(data || []);
    setLoadingSubs(false);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...emptyPlan });
    setFeaturesText("");
    setDialogOpen(true);
  };

  const openEdit = (p: Plan) => {
    setEditTarget(p);
    setForm({
      name: p.name, description: p.description || "",
      price_monthly: p.price_monthly, price_yearly: p.price_yearly,
      features: p.features, is_active: p.is_active,
      stripe_price_id_monthly: p.stripe_price_id_monthly || "",
      stripe_price_id_yearly: p.stripe_price_id_yearly || "",
    });
    setFeaturesText(Array.isArray(p.features) ? p.features.join("\n") : JSON.stringify(p.features, null, 2));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const features = featuresText.split("\n").map(l => l.trim()).filter(Boolean);
      const payload = { ...form, features };
      if (editTarget) {
        await supabase.from("plans").update(payload).eq("id", editTarget.id);
        toast({ title: "Plano atualizado!" });
      } else {
        await supabase.from("plans").insert(payload);
        toast({ title: "Plano criado!" });
      }
      setDialogOpen(false);
      fetchPlans();
    } finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("plans").update({ is_active: !current }).eq("id", id);
    toast({ title: !current ? "Plano ativado" : "Plano desativado" });
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("plans").delete().eq("id", id);
    toast({ title: "Plano deletado" });
    setDeleteTarget(null);
    fetchPlans();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
            <p className="text-sm text-muted-foreground">Planos e assinantes</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" /> Novo Plano
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { key: "plans", label: "Planos" },
          { key: "subscriptions", label: "Assinantes" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === tab.key ? "border-violet-500 text-violet-400 bg-violet-500/10" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >{tab.label}
            {tab.key === "subscriptions" && <span className="ml-2 text-xs bg-white/10 rounded-full px-2 py-0.5">{subscriptions.length}</span>}
          </button>
        ))}
      </div>

      {activeTab === "plans" && (
        loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{plan.name}</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">
                      R$ {plan.price_monthly.toFixed(2)}
                      <span className="text-sm text-muted-foreground font-normal">/mês</span>
                    </p>
                    {plan.price_yearly > 0 && (
                      <p className="text-sm text-muted-foreground">R$ {plan.price_yearly.toFixed(2)}/ano</p>
                    )}
                  </div>
                  <Badge className={`text-xs ${plan.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                    {plan.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {plan.description && <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>}
                {Array.isArray(plan.features) && plan.features.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {plan.features.slice(0, 3).map((f: string, i: number) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-muted-foreground">+{plan.features.length - 3} mais...</li>
                    )}
                  </ul>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-white/10 hover:bg-white/10 text-xs" onClick={() => openEdit(plan)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/10 text-xs" onClick={() => toggleActive(plan.id, plan.is_active)}>
                    {plan.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/20 hover:bg-red-500/10" onClick={() => setDeleteTarget(plan.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "subscriptions" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Usuário ID</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Plano</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Intervalo</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Expira</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Criado em</th>
                </tr>
              </thead>
              <tbody>
                {loadingSubs ? Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array(6).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-8 rounded" /></td>)}
                  </tr>
                )) : subscriptions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted-foreground py-12">Nenhuma assinatura encontrada</td></tr>
                ) : subscriptions.map(sub => {
                  const statusConf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.active;
                  const plan = plans.find(p => p.id === sub.plan_id);
                  return (
                    <tr key={sub.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{sub.user_id.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-foreground">{plan?.name || sub.plan_id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${statusConf.className}`}>{statusConf.label}</Badge>
                        {sub.cancel_at_period_end && (
                          <Badge className="ml-1 text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">Cancelamento Pendente</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{sub.interval === "monthly" ? "Mensal" : "Anual"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {sub.current_period_end ? format(new Date(sub.current_period_end), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {format(new Date(sub.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => !open && setDialogOpen(false)}>
        <DialogContent className="max-w-lg bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Editar Plano" : "Novo Plano"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-white/5 border-white/10 resize-none h-16" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Preço Mensal (R$)</Label>
                <Input type="number" step="0.01" value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: Number(e.target.value) }))} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-1.5">
                <Label>Preço Anual (R$)</Label>
                <Input type="number" step="0.01" value={form.price_yearly} onChange={e => setForm(f => ({ ...f, price_yearly: Number(e.target.value) }))} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Recursos (um por linha)</Label>
              <Textarea
                value={featuresText}
                onChange={e => setFeaturesText(e.target.value)}
                className="bg-white/5 border-white/10 resize-none h-28 font-mono text-xs"
                placeholder="Acesso ilimitado&#10;Chat exclusivo&#10;Badge premium"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <p className="text-sm font-medium text-foreground">Plano Ativo</p>
                <p className="text-xs text-muted-foreground">Disponível para novas assinaturas</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
              {saving ? "Salvando..." : editTarget ? "Salvar" : "Criar Plano"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400"><AlertTriangle className="w-5 h-5" /> Deletar Plano</DialogTitle>
            <DialogDescription>Assinaturas existentes não serão afetadas, mas ninguém mais poderá assinar este plano.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              <Trash2 className="w-4 h-4 mr-2" /> Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAssinaturas;
