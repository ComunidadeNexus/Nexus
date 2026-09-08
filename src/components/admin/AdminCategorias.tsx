import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, Pencil, Trash2, Eye, EyeOff, Shield, Crown, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
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
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  is_active: boolean;
  is_admin_only: boolean;
  is_premium_only: boolean;
  order_position: number;
  created_at: string;
}

const emptyCategory = {
  name: "",
  slug: "",
  description: "",
  icon: "📌",
  color: "#8b5cf6",
  is_active: true,
  is_admin_only: false,
  is_premium_only: false,
  order_position: 0,
};

const AdminCategorias = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyCategory);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("categories").select("*").order("order_position");

    // Auto-seed force reset (will run once if length > 5 or if we haven't seeded emojis)
    const hasEmojis = data?.some((c) => c.icon === "🌍" || c.icon === "💻");
    if (!error && data && (!hasEmojis || data.length > 5)) {
      // Deletar todas as atuais
      if (data.length > 0) {
        await Promise.all(data.map((c) => supabase.from("categories").delete().eq("id", c.id)));
      }

      const newCategories = [
        {
          name: "Geral",
          slug: "geral",
          description: "Discussões gerais sobre qualquer assunto da plataforma.",
          icon: "🌍",
          color: "#3b82f6",
          order_position: 1,
          is_active: true,
          is_admin_only: false,
          is_premium_only: false,
        },
        {
          name: "Tecnologia",
          slug: "tecnologia",
          description: "Tudo sobre programação, IA, gadgets e futuro.",
          icon: "💻",
          color: "#8b5cf6",
          order_position: 2,
          is_active: true,
          is_admin_only: false,
          is_premium_only: false,
        },
        {
          name: "Marketing",
          slug: "marketing",
          description: "Estratégias de vendas, tráfego pago, SEO e copywriting.",
          icon: "📈",
          color: "#10b981",
          order_position: 3,
          is_active: true,
          is_admin_only: false,
          is_premium_only: false,
        },
        {
          name: "Design",
          slug: "design",
          description: "UI/UX, ilustração, edição de vídeo e processos criativos.",
          icon: "🎨",
          color: "#f59e0b",
          order_position: 4,
          is_active: true,
          is_admin_only: false,
          is_premium_only: false,
        },
        {
          name: "Off-Topic",
          slug: "off-topic",
          description: "Conversas aleatórias, memes, jogos e descontração.",
          icon: "☕",
          color: "#ef4444",
          order_position: 5,
          is_active: true,
          is_admin_only: false,
          is_premium_only: false,
        },
      ];
      await supabase.from("categories").insert(newCategories);
      const { data: freshData } = await supabase
        .from("categories")
        .select("*")
        .order("order_position");
      setCategories(freshData || []);
    } else if (!error) {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...emptyCategory, order_position: categories.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon,
      color: cat.color,
      is_active: cat.is_active,
      is_admin_only: cat.is_admin_only,
      is_premium_only: cat.is_premium_only,
      order_position: cat.order_position,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) {
      toast({ title: "Nome e slug são obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await supabase.from("categories").update(form).eq("id", editTarget.id);
        toast({ title: "Categoria atualizada!" });
      } else {
        await supabase.from("categories").insert(form);
        toast({ title: "Categoria criada!" });
      }
      setDialogOpen(false);
      fetchCategories();
    } catch (e) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("categories").update({ is_active: !current }).eq("id", id);
    toast({ title: !current ? "Categoria ativada" : "Categoria desativada" });
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    toast({ title: "Categoria deletada" });
    setDeleteTarget(null);
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
            <p className="text-sm text-muted-foreground">
              {categories.length} categorias cadastradas
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="relative p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DynamicIcon name={cat.icon} size={24} className="text-muted-foreground" />
                  <div>
                    <p className="font-semibold text-foreground">{cat.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{cat.slug}</p>
                  </div>
                </div>
                <div
                  className="w-3 h-3 rounded-full border-2 border-white/20 shrink-0 mt-1"
                  style={{ backgroundColor: cat.color }}
                />
              </div>

              {cat.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{cat.description}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-3">
                {cat.is_active ? (
                  <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Ativa
                  </Badge>
                ) : (
                  <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                    Inativa
                  </Badge>
                )}
                {cat.is_admin_only && (
                  <Badge className="text-xs bg-violet-500/20 text-violet-400 border-violet-500/30">
                    <Shield className="w-3 h-3 mr-1" /> Admin Only
                  </Badge>
                )}
                {cat.is_premium_only && (
                  <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    <Crown className="w-3 h-3 mr-1" /> Premium
                  </Badge>
                )}
                <Badge className="text-xs bg-white/10 text-muted-foreground border-white/10">
                  Pos. {cat.order_position}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/10 text-xs"
                  onClick={() => openEdit(cat)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/10 hover:bg-white/10"
                  title={cat.is_active ? "Desativar" : "Ativar"}
                  onClick={() => toggleActive(cat.id, cat.is_active)}
                >
                  {cat.is_active ? (
                    <EyeOff className="w-3.5 h-3.5 text-orange-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/20 hover:bg-red-500/10"
                  title="Deletar"
                  onClick={() => setDeleteTarget(cat.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
        <DialogContent className="max-w-lg bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="bg-white/5 border-white/10"
                  placeholder="Ex: Tecnologia"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    }))
                  }
                  className="bg-white/5 border-white/10 font-mono"
                  placeholder="tecnologia"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-white/5 border-white/10 resize-none h-20"
                placeholder="Descrição da categoria..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Ícone (emoji)</Label>
                <Input
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  className="bg-white/5 border-white/10 text-center text-xl"
                  placeholder="📌"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="bg-white/5 border-white/10 h-10 cursor-pointer p-1"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Posição</Label>
                <Input
                  type="number"
                  value={form.order_position}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order_position: Number(e.target.value) }))
                  }
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-3">
              {[
                { key: "is_active", label: "Ativa", desc: "Exibir para usuários" },
                {
                  key: "is_admin_only",
                  label: "Somente Admin",
                  desc: "Apenas admins podem postar",
                },
                {
                  key: "is_premium_only",
                  label: "Somente Premium",
                  desc: "Requer assinatura premium",
                },
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
              {saving ? "Salvando..." : editTarget ? "Salvar Alterações" : "Criar Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" /> Deletar Categoria
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza? Posts desta categoria não serão afetados, mas a categoria não estará mais
            disponível.
          </p>
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

export default AdminCategorias;
