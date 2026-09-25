import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMarketplaceCatalog } from "@/hooks/useMarketplaceCatalog";
import { MarketplaceCategoryIcon } from "@/components/marketplace/MarketplaceCategoryIcon";
import {
  MARKETPLACE_CATEGORY_ICONS,
  slugifyMarketplaceLabel,
  type MarketplaceCategory,
  type MarketplaceHighlight,
} from "@/lib/marketplace";

const emptyCategory = {
  label: "",
  slug: "",
  icon: "Sparkles",
  image_url: null as string | null,
  sort_order: 0,
  is_active: true,
};

const emptyItem = {
  label: "",
  slug: "",
  image_url: null as string | null,
  accent: "from-[#111] to-[#00C6FF]",
  fit: "cover" as "cover" | "contain",
  popular: false,
  popular_order: 1,
  sort_order: 0,
  is_active: true,
};

const AdminMarketplaceCategories = () => {
  const { toast } = useToast();
  const {
    categories,
    isLoading,
    error,
    saveCategory,
    saveItem,
    deleteCategory,
    deleteItem,
    uploadImage,
  } = useMarketplaceCatalog("admin");

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editCategory, setEditCategory] = useState<MarketplaceCategory | null>(null);
  const [editItem, setEditItem] = useState<MarketplaceHighlight | null>(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const selected = useMemo(
    () => categories.find((category) => category.slug === selectedSlug) || null,
    [categories, selectedSlug],
  );

  const openCreateCategory = () => {
    setEditCategory(null);
    setCategoryForm({ ...emptyCategory, sort_order: categories.length + 1 });
    setCategoryOpen(true);
  };

  const openEditCategory = (category: MarketplaceCategory) => {
    setEditCategory(category);
    setCategoryForm({
      label: category.label,
      slug: category.slug,
      icon: category.icon,
      image_url: category.image || null,
      sort_order: category.sortOrder ?? 0,
      is_active: category.isActive !== false,
    });
    setCategoryOpen(true);
  };

  const openCreateItem = () => {
    if (!selected?.id) return;
    setEditItem(null);
    setItemForm({ ...emptyItem, sort_order: selected.highlights.length + 1 });
    setItemOpen(true);
  };

  const openEditItem = (item: MarketplaceHighlight) => {
    setEditItem(item);
    setItemForm({
      label: item.label,
      slug: item.slug,
      image_url: item.image || null,
      accent: item.accent,
      fit: item.fit === "contain" ? "contain" : "cover",
      popular: item.popularOrder != null,
      popular_order: item.popularOrder ?? 1,
      sort_order: item.sortOrder ?? 0,
      is_active: item.isActive !== false,
    });
    setItemOpen(true);
  };

  const handleUpload = async (
    file: File | undefined,
    onUrl: (url: string) => void,
  ) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUrl(url);
      toast({ title: "Imagem enviada" });
    } catch (uploadError) {
      toast({
        title: "Falha no upload",
        description: uploadError instanceof Error ? uploadError.message : "Tente JPG ou PNG",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const submitCategory = async () => {
    const slug = slugifyMarketplaceLabel(categoryForm.slug || categoryForm.label);
    if (!categoryForm.label.trim() || !slug) {
      toast({ title: "Preencha o nome da categoria", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await saveCategory({
        id: editCategory?.id,
        slug,
        label: categoryForm.label,
        icon: categoryForm.icon,
        image_url: categoryForm.image_url,
        sort_order: Number(categoryForm.sort_order) || 0,
        is_active: categoryForm.is_active,
      });
      toast({ title: editCategory ? "Categoria atualizada" : "Categoria criada" });
      setCategoryOpen(false);
    } catch (saveError) {
      toast({
        title: "Não foi possível salvar",
        description: saveError instanceof Error ? saveError.message : "Tente outro slug",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const submitItem = async () => {
    if (!selected?.id) return;
    const slug = slugifyMarketplaceLabel(itemForm.slug || itemForm.label);
    if (!itemForm.label.trim() || !slug) {
      toast({ title: "Preencha o nome do item", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await saveItem({
        id: editItem?.id,
        category_id: selected.id,
        slug,
        label: itemForm.label,
        image_url: itemForm.image_url,
        accent: itemForm.accent,
        fit: itemForm.fit,
        popular_order: itemForm.popular ? Number(itemForm.popular_order) || 1 : null,
        sort_order: Number(itemForm.sort_order) || 0,
        is_active: itemForm.is_active,
      });
      toast({ title: editItem ? "Item atualizado" : "Item criado" });
      setItemOpen(false);
    } catch (saveError) {
      toast({
        title: "Não foi possível salvar",
        description: saveError instanceof Error ? saveError.message : "Tente outro slug",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCategoryId) return;
    try {
      await deleteCategory(deleteCategoryId);
      toast({ title: "Categoria removida" });
      if (selected?.id === deleteCategoryId) setSelectedSlug(null);
    } catch (deleteError) {
      toast({
        title: "Não foi possível excluir",
        description: deleteError instanceof Error ? deleteError.message : undefined,
        variant: "destructive",
      });
    } finally {
      setDeleteCategoryId(null);
    }
  };

  const confirmDeleteItem = async () => {
    if (!deleteItemId) return;
    try {
      await deleteItem(deleteItemId);
      toast({ title: "Item removido" });
    } catch (deleteError) {
      toast({
        title: "Não foi possível excluir",
        description: deleteError instanceof Error ? deleteError.message : undefined,
        variant: "destructive",
      });
    } finally {
      setDeleteItemId(null);
    }
  };

  const ImageField = ({
    url,
    onChange,
  }: {
    url: string | null;
    onChange: (value: string | null) => void;
  }) => (
    <div className="space-y-2">
      <Label>Imagem JPG ou PNG</Label>
      <div className="flex items-center gap-3">
        <div className="w-20 h-14 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
          {url ? (
            <img src={url} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImagePlus className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex">
            <input
              type="file"
              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                void handleUpload(file, (next) => onChange(next));
              }}
            />
            <span className="inline-flex items-center min-h-9 px-3 rounded-md border border-white/10 text-sm cursor-pointer hover:bg-white/5">
              {uploading ? "Enviando..." : url ? "Trocar imagem" : "Enviar imagem"}
            </span>
          </label>
          {url && (
            <button
              type="button"
              className="text-xs text-red-400 text-left"
              onClick={() => onChange(null)}
            >
              Remover imagem
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSlug(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">{selected.label}</h2>
              <p className="text-xs text-muted-foreground">
                {selected.highlights.length} itens nesta categoria
              </p>
            </div>
          </div>
          <Button onClick={openCreateItem} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-4 h-4 mr-2" /> Novo item
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {selected.highlights.map((item) => (
            <div key={item.id || item.slug} className="rounded-xl border border-white/10 bg-white/5 p-2">
              <div
                className={`aspect-[16/10] rounded-lg overflow-hidden bg-gradient-to-br ${item.accent} ${
                  item.fit === "contain" ? "p-3 flex items-center justify-center" : ""
                }`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.label}
                    className={`w-full h-full ${item.fit === "contain" ? "object-contain" : "object-cover"}`}
                  />
                ) : (
                  <span className="text-xs text-white/80 p-2">{item.label}</span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium truncate">{item.label}</p>
              <p className="text-[11px] text-muted-foreground truncate">{item.slug}</p>
              <div className="mt-2 flex gap-1">
                <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => openEditItem(item)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={() => item.id && setDeleteItemId(item.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={itemOpen} onOpenChange={setItemOpen}>
          <DialogContent className="bg-background/95 border-white/10">
            <DialogHeader>
              <DialogTitle>{editItem ? "Editar item" : "Novo item"}</DialogTitle>
              <DialogDescription>Aparece na grade da categoria na vitrine.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input
                  value={itemForm.label}
                  onChange={(event) => {
                    const label = event.target.value;
                    setItemForm((current) => ({
                      ...current,
                      label,
                      slug: editItem ? current.slug : slugifyMarketplaceLabel(label),
                    }));
                  }}
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={itemForm.slug}
                  onChange={(event) =>
                    setItemForm((current) => ({
                      ...current,
                      slug: slugifyMarketplaceLabel(event.target.value),
                    }))
                  }
                />
              </div>
              <ImageField
                url={itemForm.image_url}
                onChange={(image_url) => setItemForm((current) => ({ ...current, image_url }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Enquadramento</Label>
                  <Select
                    value={itemForm.fit}
                    onValueChange={(value) =>
                      setItemForm((current) => ({ ...current, fit: value as "cover" | "contain" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Preencher</SelectItem>
                      <SelectItem value="contain">Cabido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    value={itemForm.sort_order}
                    onChange={(event) =>
                      setItemForm((current) => ({ ...current, sort_order: Number(event.target.value) }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 p-3">
                <div>
                  <Label>Popular</Label>
                  <p className="text-xs text-muted-foreground">Mostrar na aba Popular</p>
                </div>
                <Switch
                  checked={itemForm.popular}
                  onCheckedChange={(popular) => setItemForm((current) => ({ ...current, popular }))}
                />
              </div>
              {itemForm.popular && (
                <div>
                  <Label>Posição no Popular</Label>
                  <Input
                    type="number"
                    min={1}
                    value={itemForm.popular_order}
                    onChange={(event) =>
                      setItemForm((current) => ({
                        ...current,
                        popular_order: Number(event.target.value),
                      }))
                    }
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <Label>Ativo</Label>
                <Switch
                  checked={itemForm.is_active}
                  onCheckedChange={(is_active) => setItemForm((current) => ({ ...current, is_active }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setItemOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => void submitItem()} disabled={saving || uploading}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteItemId != null} onOpenChange={(open) => !open && setDeleteItemId(null)}>
          <DialogContent className="bg-background/95 border-white/10">
            <DialogHeader>
              <DialogTitle>Excluir item</DialogTitle>
              <DialogDescription>Ele some da vitrine na hora.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteItemId(null)}>
                Cancelar
              </Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => void confirmDeleteItem()}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          Crie categorias, envie JPG/PNG e monte os itens que aparecem na vitrine.
        </p>
        <Button onClick={openCreateCategory} className="bg-violet-600 hover:bg-violet-700">
          <Plus className="w-4 h-4 mr-2" /> Nova categoria
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-400">Não foi possível carregar as categorias: {error}</p>
      )}

      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-muted-foreground">
          Nenhuma categoria ainda. Crie a primeira para aparecer no marketplace.
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id || category.slug}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {category.image ? (
                  <img src={category.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <MarketplaceCategoryIcon name={category.icon} className="w-6 h-6 text-violet-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{category.label}</p>
                <p className="text-xs text-muted-foreground">
                  {category.slug} · {category.highlights.length} itens
                  {category.isActive === false ? " · oculta" : ""}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedSlug(category.slug)}>
                Itens
              </Button>
              <Button variant="ghost" size="icon" onClick={() => openEditCategory(category)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => category.id && setDeleteCategoryId(category.id)}
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="bg-background/95 border-white/10">
          <DialogHeader>
            <DialogTitle>{editCategory ? "Editar categoria" : "Nova categoria"}</DialogTitle>
            <DialogDescription>
              Nome, ícone e imagem da categoria no painel Categorias da loja.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome</Label>
              <Input
                value={categoryForm.label}
                onChange={(event) => {
                  const label = event.target.value;
                  setCategoryForm((current) => ({
                    ...current,
                    label,
                    slug: editCategory ? current.slug : slugifyMarketplaceLabel(label),
                  }));
                }}
                placeholder="Ex: Jogos"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={categoryForm.slug}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    slug: slugifyMarketplaceLabel(event.target.value),
                  }))
                }
              />
            </div>
            <div>
              <Label>Ícone</Label>
              <Select
                value={categoryForm.icon}
                onValueChange={(icon) => setCategoryForm((current) => ({ ...current, icon }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARKETPLACE_CATEGORY_ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ImageField
              url={categoryForm.image_url}
              onChange={(image_url) => setCategoryForm((current) => ({ ...current, image_url }))}
            />
            <div>
              <Label>Ordem</Label>
              <Input
                type="number"
                value={categoryForm.sort_order}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    sort_order: Number(event.target.value),
                  }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativa na vitrine</Label>
              <Switch
                checked={categoryForm.is_active}
                onCheckedChange={(is_active) =>
                  setCategoryForm((current) => ({ ...current, is_active }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCategoryOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void submitCategory()} disabled={saving || uploading}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteCategoryId != null}
        onOpenChange={(open) => !open && setDeleteCategoryId(null)}
      >
        <DialogContent className="bg-background/95 border-white/10">
          <DialogHeader>
            <DialogTitle>Excluir categoria</DialogTitle>
            <DialogDescription>
              Os itens dela também são removidos. Anúncios antigos continuam, mas ficam sem filtro.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteCategoryId(null)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => void confirmDeleteCategory()}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMarketplaceCategories;
