import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Plus, Pencil, Trash2, Gift, Star, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface BadgeType {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string | null;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  is_active: boolean;
}

const emptyBadge = {
  name: "", icon: "🏆", color: "#8b5cf6", description: "",
  requirement_type: "posts", requirement_value: 10, xp_reward: 100, is_active: true,
};

const AdminGamificacao = () => {
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [grantDialog, setGrantDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<BadgeType | null>(null);
  const [form, setForm] = useState(emptyBadge);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantBadgeId, setGrantBadgeId] = useState("");
  // Ranking
  const [ranking, setRanking] = useState<any[]>([]);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [activeTab, setActiveTab] = useState<"badges" | "ranking">("badges");

  useEffect(() => { fetchBadges(); fetchRanking(); }, []);

  const fetchBadges = async () => {
    setLoading(true);
    const { data } = await supabase.from("badges").select("*").order("xp_reward", { ascending: false });
    setBadges(data || []);
    setLoading(false);
  };

  const fetchRanking = async () => {
    setLoadingRanking(true);
    const { data } = await supabase.from("profiles").select("user_id, name, username, avatar_url, xp_points, karma, level").order("xp_points", { ascending: false }).limit(20);
    setRanking(data || []);
    setLoadingRanking(false);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...emptyBadge });
    setDialogOpen(true);
  };

  const openEdit = (b: BadgeType) => {
    setEditTarget(b);
    setForm({
      name: b.name, icon: b.icon, color: b.color, description: b.description || "",
      requirement_type: b.requirement_type, requirement_value: b.requirement_value,
      xp_reward: b.xp_reward, is_active: b.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.icon) { toast({ title: "Nome e ícone são obrigatórios", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editTarget) {
        await supabase.from("badges").update(form).eq("id", editTarget.id);
        toast({ title: "Badge atualizado!" });
      } else {
        await supabase.from("badges").insert(form);
        toast({ title: "Badge criado!" });
      }
      setDialogOpen(false);
      fetchBadges();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("badges").delete().eq("id", id);
    toast({ title: "Badge deletado" });
    setDeleteTarget(null);
    fetchBadges();
  };

  const handleGrantBadge = async () => {
    if (!grantUserId || !grantBadgeId) { toast({ title: "Preencha todos os campos", variant: "destructive" }); return; }
    const { error } = await supabase.from("user_badges").insert({ user_id: grantUserId, badge_id: grantBadgeId });
    if (error) { toast({ title: "Erro ao conceder badge (pode já ter)", variant: "destructive" }); }
    else { toast({ title: "Badge concedido!" }); setGrantDialog(false); setGrantUserId(""); setGrantBadgeId(""); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gamificação</h1>
            <p className="text-sm text-muted-foreground">Badges, XP e ranking</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setGrantDialog(true)} variant="outline" className="border-white/10 hover:bg-white/10">
            <Gift className="w-4 h-4 mr-2" /> Conceder Badge
          </Button>
          <Button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Novo Badge
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {[
          { key: "badges", label: "Badges" },
          { key: "ranking", label: "Ranking de XP" },
        ].map(tab => (
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

      {activeTab === "badges" && (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {badges.map(badge => (
              <div key={badge.id} className="relative p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2"
                      style={{ borderColor: badge.color + "40", background: badge.color + "15" }}
                    >
                      {badge.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{badge.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-yellow-400">{badge.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`text-xs ${badge.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                    {badge.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                {badge.description && <p className="text-xs text-muted-foreground mb-3">{badge.description}</p>}
                <div className="text-xs text-muted-foreground mb-4">
                  Requisito: <span className="text-foreground">{badge.requirement_value}× {badge.requirement_type}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-white/10 hover:bg-white/10 text-xs" onClick={() => openEdit(badge)}>
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-500/20 hover:bg-red-500/10" onClick={() => setDeleteTarget(badge.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "ranking" && (
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium w-12">#</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Usuário</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nível</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">XP Total</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Karma</th>
              </tr>
            </thead>
            <tbody>
              {loadingRanking ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array(5).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-8 rounded" /></td>)}
                  </tr>
                ))
              ) : ranking.map((u, i) => (
                <tr key={u.user_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                      i === 1 ? "bg-slate-400/20 text-slate-400" :
                      i === 2 ? "bg-orange-700/20 text-orange-500" :
                      "bg-white/5 text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : (u.name || u.username || "?")[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.name || "Sem nome"}</p>
                        <p className="text-xs text-muted-foreground">@{u.username || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">Lv. {u.level}</Badge>
                  </td>
                  <td className="px-4 py-3 text-yellow-400 font-medium">{u.xp_points?.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3 text-foreground">{u.karma}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => !open && setDialogOpen(false)}>
        <DialogContent className="max-w-lg bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Editar Badge" : "Novo Badge"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-1.5">
                <Label>Ícone (emoji) *</Label>
                <Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="bg-white/5 border-white/10 text-center text-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-white/5 border-white/10 resize-none h-16" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Cor</Label>
                <Input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="bg-white/5 border-white/10 h-10 p-1 cursor-pointer" />
              </div>
              <div className="space-y-1.5">
                <Label>XP Recompensa</Label>
                <Input type="number" value={form.xp_reward} onChange={e => setForm(f => ({ ...f, xp_reward: Number(e.target.value) }))} className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-1.5">
                <Label>Valor Requisito</Label>
                <Input type="number" value={form.requirement_value} onChange={e => setForm(f => ({ ...f, requirement_value: Number(e.target.value) }))} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de Requisito</Label>
              <Input value={form.requirement_type} onChange={e => setForm(f => ({ ...f, requirement_type: e.target.value }))} className="bg-white/5 border-white/10" placeholder="posts, comments, likes, followers..." />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <p className="text-sm font-medium text-foreground">Badge Ativo</p>
                <p className="text-xs text-muted-foreground">Visível e atribuível</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
              {saving ? "Salvando..." : editTarget ? "Salvar" : "Criar Badge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Badge Dialog */}
      <Dialog open={grantDialog} onOpenChange={open => !open && setGrantDialog(false)}>
        <DialogContent className="bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" /> Conceder Badge
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>ID do Usuário</Label>
              <Input value={grantUserId} onChange={e => setGrantUserId(e.target.value)} className="bg-white/5 border-white/10 font-mono text-xs" placeholder="UUID do usuário..." />
            </div>
            <div className="space-y-1.5">
              <Label>Badge</Label>
              <select
                value={grantBadgeId}
                onChange={e => setGrantBadgeId(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-sm text-foreground"
              >
                <option value="">Selecionar badge...</option>
                {badges.filter(b => b.is_active).map(b => (
                  <option key={b.id} value={b.id}>{b.icon} {b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGrantDialog(false)}>Cancelar</Button>
            <Button onClick={handleGrantBadge} className="bg-yellow-600 hover:bg-yellow-700">
              <Gift className="w-4 h-4 mr-2" /> Conceder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" /> Deletar Badge
            </DialogTitle>
            <DialogDescription>Usuários que já possuem este badge não serão afetados, mas ninguém mais poderá recebê-lo.</DialogDescription>
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

export default AdminGamificacao;
