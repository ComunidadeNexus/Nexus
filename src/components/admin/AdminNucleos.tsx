import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { slugifyNucleoName } from "@/lib/nucleoSlug";
import {
  Hexagon,
  Search,
  BadgeCheck,
  Lock,
  Unlock,
  Trash2,
  Users,
  FileText,
  AlertTriangle,
  Plus,
  Pencil,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface Nucleo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  color: string;
  is_private: boolean;
  is_verified: boolean;
  members_count: number;
  posts_count: number;
  owner_id: string;
  created_at: string;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  is_private: false,
};

const AdminNucleos = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [nucleos, setNucleos] = useState<Nucleo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Nucleo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNucleos();
  }, []);

  const fetchNucleos = async (q = "") => {
    setLoading(true);
    let query = supabase
      .from("nucleos")
      .select("*")
      .order("members_count", { ascending: false })
      .limit(100);
    if (q) query = query.ilike("name", `%${q}%`);
    const { data, error } = await query;
    if (!error) setNucleos(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (nucleo: Nucleo) => {
    setEditTarget(nucleo);
    setForm({
      name: nucleo.name,
      slug: nucleo.slug,
      description: nucleo.description || "",
      is_private: nucleo.is_private,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const name = form.name.trim();
    if (!name) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    if (!user) {
      toast({ title: "Você precisa estar logado", variant: "destructive" });
      return;
    }

    const slug = slugifyNucleoName(form.slug || name);
    setSaving(true);
    try {
      if (editTarget) {
        const { data, error } = await supabase
          .from("nucleos")
          .update({
            name,
            slug,
            description: form.description.trim() || null,
            is_private: form.is_private,
          })
          .eq("id", editTarget.id)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Sem permissão para editar este núcleo.");
        toast({ title: "Núcleo atualizado!" });
      } else {
        const { data, error } = await supabase
          .from("nucleos")
          .insert({
            name,
            slug,
            description: form.description.trim() || null,
            is_private: form.is_private,
            owner_id: user.id,
          })
          .select("id")
          .single();
        if (error) throw error;
        if (!data) throw new Error("Não foi possível criar o núcleo.");
        toast({ title: "Núcleo criado!" });
      }
      setDialogOpen(false);
      fetchNucleos(search);
    } catch (error: unknown) {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Tente novamente.",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const toggleVerify = async (id: string, current: boolean) => {
    const { data, error } = await supabase
      .from("nucleos")
      .update({ is_verified: !current })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      toast({
        title: "Não foi possível atualizar",
        description: error?.message || "Sem permissão para verificar este núcleo.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: !current ? "Núcleo verificado!" : "Verificação removida" });
    fetchNucleos(search);
  };

  const togglePrivate = async (id: string, current: boolean) => {
    const { data, error } = await supabase
      .from("nucleos")
      .update({ is_private: !current })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      toast({
        title: "Não foi possível atualizar",
        description: error?.message || "Sem permissão para alterar a privacidade.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: !current ? "Núcleo privado" : "Núcleo público" });
    fetchNucleos(search);
  };

  const handleDelete = async (id: string) => {
    const { data, error } = await supabase
      .from("nucleos")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      toast({
        title: "Não foi possível deletar",
        description: error?.message || "Sem permissão para deletar este núcleo.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Núcleo deletado" });
    setDeleteTarget(null);
    fetchNucleos(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Núcleos</h1>
            <p className="text-sm text-muted-foreground">{nucleos.length} núcleos encontrados</p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-violet-600 hover:bg-violet-700 min-h-11">
          <Plus className="w-4 h-4 mr-2" /> Novo núcleo
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchNucleos(search)}
            placeholder="Buscar núcleos..."
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
        <Button onClick={() => fetchNucleos(search)} className="bg-violet-600 hover:bg-violet-700">
          <Search className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Núcleo</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Membros</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Posts</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Criado em</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array(6)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-8 rounded" />
                          </td>
                        ))}
                    </tr>
                  ))
              ) : nucleos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted-foreground py-12">
                    Nenhum núcleo encontrado
                  </td>
                </tr>
              ) : (
                nucleos.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0"
                          style={{ background: n.color || "#8b5cf6" }}
                        >
                          {n.avatar_url ? (
                            <img src={n.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            n.name[0]
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{n.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">/{n.slug}</p>
                        </div>
                        {n.is_verified && <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" />}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {n.is_private ? (
                          <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">
                            Privado
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Público
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {n.members_count}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        {n.posts_count}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {format(new Date(n.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-white/10"
                          title="Editar"
                          onClick={() => openEdit(n)}
                        >
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-white/10"
                          title={n.is_verified ? "Remover verificação" : "Verificar"}
                          onClick={() => toggleVerify(n.id, n.is_verified)}
                        >
                          <BadgeCheck
                            className={`w-4 h-4 ${n.is_verified ? "text-sky-400" : "text-muted-foreground"}`}
                          />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-white/10"
                          title={n.is_private ? "Tornar público" : "Tornar privado"}
                          onClick={() => togglePrivate(n.id, n.is_private)}
                        >
                          {n.is_private ? (
                            <Unlock className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Lock className="w-4 h-4 text-orange-400" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 hover:bg-red-500/10"
                          onClick={() => setDeleteTarget(n.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur border-white/10 max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Editar núcleo" : "Novo núcleo"}</DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Atualize nome, slug, descrição e privacidade."
                : "Cria o núcleo na plataforma. O admin fica como dono."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nucleo-name">Nome</Label>
              <Input
                id="nucleo-name"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name,
                    slug: editTarget ? prev.slug : slugifyNucleoName(name),
                  }));
                }}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nucleo-slug">Slug</Label>
              <Input
                id="nucleo-slug"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                className="bg-white/5 border-white/10 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nucleo-description">Descrição</Label>
              <Textarea
                id="nucleo-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="bg-white/5 border-white/10 min-h-[100px]"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2">
              <Label htmlFor="nucleo-private">Privado</Label>
              <Switch
                id="nucleo-private"
                checked={form.is_private}
                onCheckedChange={(is_private) => setForm((prev) => ({ ...prev, is_private }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Salvando..." : editTarget ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" /> Deletar Núcleo
            </DialogTitle>
            <DialogDescription>
              Esta ação é permanente. O núcleo e todos os seus dados serão removidos.
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
              <Trash2 className="w-4 h-4 mr-2" /> Deletar Núcleo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNucleos;
