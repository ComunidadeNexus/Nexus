import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminData } from "@/hooks/useAdminData";
import { useToast } from "@/hooks/use-toast";
import { Coins, Plus, Pencil, Trash2, ArrowUpDown, Send, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  bonus_coins: number;
  price: number;
  currency: string;
  description: string | null;
  is_active: boolean;
  is_popular: boolean;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

const emptyPkg = {
  name: "",
  coins: 100,
  bonus_coins: 0,
  price: 9.9,
  currency: "BRL",
  description: "",
  is_active: true,
  is_popular: false,
};

const AdminCoins = () => {
  const { toast } = useToast();
  const { creditCoins } = useAdminData();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(false);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CoinPackage | null>(null);
  const [form, setForm] = useState(emptyPkg);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [creditDialog, setCreditDialog] = useState(false);
  const [creditUserId, setCreditUserId] = useState("");
  const [creditAmount, setCreditAmount] = useState("50");
  const [creditDesc, setCreditDesc] = useState("");
  const [activeTab, setActiveTab] = useState<"packages" | "transactions">("packages");

  useEffect(() => {
    fetchPackages();
    fetchTransactions();
  }, []);

  const fetchPackages = async () => {
    setLoadingPkgs(true);
    const { data } = await supabase.from("coin_packages").select("*").order("price");
    setPackages(data || []);
    setLoadingPkgs(false);
  };

  const fetchTransactions = async () => {
    setLoadingTxns(true);
    const { data } = await supabase
      .from("coin_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setTransactions(data || []);
    setLoadingTxns(false);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...emptyPkg });
    setDialogOpen(true);
  };
  const openEdit = (p: CoinPackage) => {
    setEditTarget(p);
    setForm({
      name: p.name,
      coins: p.coins,
      bonus_coins: p.bonus_coins,
      price: p.price,
      currency: p.currency,
      description: p.description || "",
      is_active: p.is_active,
      is_popular: p.is_popular,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await supabase.from("coin_packages").update(form).eq("id", editTarget.id);
        toast({ title: "Pacote atualizado!" });
      } else {
        await supabase.from("coin_packages").insert(form);
        toast({ title: "Pacote criado!" });
      }
      setDialogOpen(false);
      fetchPackages();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("coin_packages").update({ is_active: !current }).eq("id", id);
    toast({ title: !current ? "Pacote ativado" : "Pacote desativado" });
    fetchPackages();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("coin_packages").delete().eq("id", id);
    toast({ title: "Pacote deletado" });
    setDeleteTarget(null);
    fetchPackages();
  };

  const handleCredit = async () => {
    if (!creditUserId || !creditAmount) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    await creditCoins(creditUserId, Number(creditAmount), creditDesc);
    fetchTransactions();
    setCreditDialog(false);
    setCreditUserId("");
    setCreditAmount("50");
    setCreditDesc("");
  };

  const txnTypeColor: Record<string, string> = {
    purchase: "text-emerald-400",
    admin_credit: "text-blue-400",
    spend: "text-red-400",
    reward: "text-yellow-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Nexus Coins</h1>
            <p className="text-sm text-muted-foreground">Pacotes e transações</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setCreditDialog(true)}
            variant="outline"
            className="border-white/10 hover:bg-white/10"
          >
            <Send className="w-4 h-4 mr-2" /> Creditar Coins
          </Button>
          <Button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Novo Pacote
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { key: "packages", label: "Pacotes" },
          { key: "transactions", label: "Transações Recentes" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              activeTab === tab.key
                ? "border-violet-500 text-violet-400 bg-violet-500/10"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "packages" &&
        (loadingPkgs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="relative p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all"
              >
                {pkg.is_popular && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 text-xs">
                      ⭐ Popular
                    </Badge>
                  </div>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{pkg.name}</p>
                    <p className="text-2xl font-bold text-amber-400 mt-1">
                      {pkg.coins}
                      {pkg.bonus_coins > 0 && (
                        <span className="text-sm text-emerald-400 ml-1">+{pkg.bonus_coins}</span>
                      )}
                      <span className="text-sm text-muted-foreground ml-1">coins</span>
                    </p>
                  </div>
                  <p className="text-lg font-bold text-foreground">R$ {pkg.price.toFixed(2)}</p>
                </div>
                {pkg.description && (
                  <p className="text-xs text-muted-foreground mb-3">{pkg.description}</p>
                )}
                <div className="flex gap-1.5 mb-3">
                  <Badge
                    className={`text-xs ${pkg.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}
                  >
                    {pkg.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/10 hover:bg-white/10 text-xs"
                    onClick={() => openEdit(pkg)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10 hover:bg-white/10 text-xs"
                    onClick={() => toggleActive(pkg.id, pkg.is_active)}
                  >
                    {pkg.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/20 hover:bg-red-500/10"
                    onClick={() => setDeleteTarget(pkg.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {activeTab === "transactions" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Valor</th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                    Descrição
                  </th>
                  <th className="text-left px-4 py-3 text-muted-foreground font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {loadingTxns ? (
                  Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {Array(4)
                          .fill(0)
                          .map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <Skeleton className="h-8 rounded" />
                            </td>
                          ))}
                      </tr>
                    ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted-foreground py-12">
                      Nenhuma transação
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Badge className="text-xs bg-white/10 text-foreground border-white/10">
                          {t.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${txnTypeColor[t.type] || "text-foreground"}`}>
                          {t.amount > 0 ? "+" : ""}
                          {t.amount}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">coins</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">
                        {t.description || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {format(new Date(t.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Package */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
        <DialogContent className="max-w-md bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Editar Pacote" : "Novo Pacote de Coins"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Coins</Label>
                <Input
                  type="number"
                  value={form.coins}
                  onChange={(e) => setForm((f) => ({ ...f, coins: Number(e.target.value) }))}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bônus</Label>
                <Input
                  type="number"
                  value={form.bonus_coins}
                  onChange={(e) => setForm((f) => ({ ...f, bonus_coins: Number(e.target.value) }))}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-white/5 border-white/10 resize-none h-16"
              />
            </div>
            {[
              { key: "is_active", label: "Ativo", desc: "Disponível para compra" },
              { key: "is_popular", label: "Popular", desc: "Destacar como mais popular" },
            ].map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch
                  checked={form[key as keyof typeof form] as boolean}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {saving ? "Salvando..." : editTarget ? "Salvar" : "Criar Pacote"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credit Dialog */}
      <Dialog open={creditDialog} onOpenChange={(open) => !open && setCreditDialog(false)}>
        <DialogContent className="bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" /> Creditar Coins Manualmente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>ID do Usuário</Label>
              <Input
                value={creditUserId}
                onChange={(e) => setCreditUserId(e.target.value)}
                className="bg-white/5 border-white/10 font-mono text-xs"
                placeholder="UUID do usuário..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Quantidade de Coins</Label>
              <Input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Motivo (opcional)</Label>
              <Input
                value={creditDesc}
                onChange={(e) => setCreditDesc(e.target.value)}
                className="bg-white/5 border-white/10"
                placeholder="Descrição..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCredit} className="bg-amber-600 hover:bg-amber-700">
              <Coins className="w-4 h-4 mr-2" /> Creditar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" /> Deletar Pacote
            </DialogTitle>
            <DialogDescription>
              Este pacote não estará mais disponível para compra.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoins;
