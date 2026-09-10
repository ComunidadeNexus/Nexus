import { useState } from "react";
import { Crown, Plus, Pencil, Trash2, Download, PlayCircle, ExternalLink } from "lucide-react";
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
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePremiumItems,
  PREMIUM_CATEGORIES,
  type PremiumItem,
  type PremiumContentType,
} from "@/hooks/usePremiumItems";

const emptyForm = {
  title: "",
  description: "",
  content_type: "download" as PremiumContentType,
  category: "ferramentas",
  file_url: "",
  thumbnail_url: "",
  meta: "",
  is_published: true,
};

const categoryLabel = (value: string) =>
  PREMIUM_CATEGORIES.find((c) => c.value === value)?.label || value;

const AdminPremio = () => {
  const { items, isLoading, saveItem, deleteItem } = usePremiumItems("admin");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PremiumItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const openEdit = (item: PremiumItem) => {
    setEditTarget(item);
    setForm({
      title: item.title,
      description: item.description || "",
      content_type: item.content_type,
      category: item.category,
      file_url: item.file_url,
      thumbnail_url: item.thumbnail_url || "",
      meta: item.meta || "",
      is_published: item.is_published,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.file_url.trim()) return;
    setSaving(true);
    const ok = await saveItem({
      id: editTarget?.id,
      ...form,
    });
    setSaving(false);
    if (ok) setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Prêmio</h1>
            <p className="text-sm text-muted-foreground">
              Tudo que você publicar aqui aparece no Cofre Premium para quem assina.
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="bg-yellow-500 hover:bg-yellow-600 text-black">
          <Plus className="w-4 h-4 mr-2" /> Novo prêmio
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
          <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-foreground font-medium">Nenhum prêmio ainda</p>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione downloads, vídeos ou materiais. Os usuários veem na hora em /premium.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  {item.content_type === "video" ? (
                    <PlayCircle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Download className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <Badge
                  className={`text-xs ${
                    item.is_published
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-white/10 text-muted-foreground border-white/10"
                  }`}
                >
                  {item.is_published ? "No cofre" : "Rascunho"}
                </Badge>
              </div>
              <p className="font-semibold text-foreground">{item.title}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3 mb-4">
                <Badge variant="outline" className="text-xs border-white/10">
                  {categoryLabel(item.category)}
                </Badge>
                <Badge variant="outline" className="text-xs border-white/10">
                  {item.content_type === "video" ? "Vídeo" : "Download"}
                </Badge>
                {item.meta && (
                  <Badge variant="outline" className="text-xs border-white/10">
                    {item.meta}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-white/10 text-xs"
                  onClick={() => openEdit(item)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="outline" className="border-white/10" asChild>
                  <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-500/20 hover:bg-red-500/10"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => !open && setDialogOpen(false)}>
        <DialogContent className="max-w-lg bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle>{editTarget ? "Editar prêmio" : "Novo prêmio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="bg-white/5 border-white/10"
                placeholder="Kit de templates, aula, script..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-white/5 border-white/10 resize-none h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <select
                  value={form.content_type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content_type: e.target.value as PremiumContentType }))
                  }
                  className="w-full h-10 rounded-md bg-white/5 border border-white/10 px-3 text-sm"
                >
                  <option value="download">Download</option>
                  <option value="video">Vídeo</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Categoria</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full h-10 rounded-md bg-white/5 border border-white/10 px-3 text-sm"
                >
                  {PREMIUM_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{form.content_type === "video" ? "Link do vídeo *" : "Link do arquivo *"}</Label>
              <Input
                value={form.file_url}
                onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
                className="bg-white/5 border-white/10"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Capa (opcional)</Label>
              <Input
                value={form.thumbnail_url}
                onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
                className="bg-white/5 border-white/10"
                placeholder="https://...imagem"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{form.content_type === "video" ? "Duração" : "Tamanho"}</Label>
              <Input
                value={form.meta}
                onChange={(e) => setForm((f) => ({ ...f, meta: e.target.value }))}
                className="bg-white/5 border-white/10"
                placeholder={form.content_type === "video" ? "Ex: 45 min" : "Ex: 12 MB"}
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
              <div>
                <p className="text-sm font-medium text-foreground">Publicar no cofre</p>
                <p className="text-xs text-muted-foreground">Usuários premium passam a ver agora</p>
              </div>
              <Switch
                checked={form.is_published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.file_url.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {saving ? "Salvando..." : editTarget ? "Salvar" : "Publicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPremio;
