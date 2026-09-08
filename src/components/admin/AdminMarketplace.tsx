import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Search, Trash2, Eye, Filter, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  status: string;
  condition: string | null;
  views_count: number;
  user_id: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  sold: { label: "Vendido", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  deleted: { label: "Deletado", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  paused: { label: "Pausado", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
};

const AdminMarketplace = () => {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async (q = "", status = "") => {
    setLoading(true);
    let query = supabase
      .from("marketplace_listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (q) query = query.ilike("title", `%${q}%`);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (!error) setListings(data || []);
    setLoading(false);
  };

  const changeStatus = async (id: string, newStatus: string) => {
    await supabase.from("marketplace_listings").update({ status: newStatus }).eq("id", id);
    toast({ title: `Status alterado para ${STATUS_CONFIG[newStatus]?.label || newStatus}` });
    fetchListings(search, filterStatus);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("marketplace_listings").delete().eq("id", id);
    toast({ title: "Anúncio deletado" });
    setDeleteTarget(null);
    fetchListings(search, filterStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <ShoppingBag className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <p className="text-sm text-muted-foreground">{listings.length} anúncios carregados</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchListings(search, filterStatus)}
            placeholder="Buscar anúncios..."
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(v) => {
            const s = v === "all" ? "" : v;
            setFilterStatus(s);
            fetchListings(search, s);
          }}
        >
          <SelectTrigger className="w-40 bg-white/5 border-white/10">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="sold">Vendidos</SelectItem>
            <SelectItem value="paused">Pausados</SelectItem>
            <SelectItem value="deleted">Deletados</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => fetchListings(search, filterStatus)}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <Search className="w-4 h-4 mr-2" /> Buscar
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Anúncio</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Preço</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Categoria</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Views</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Data</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array(7)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-8 rounded" />
                          </td>
                        ))}
                    </tr>
                  ))
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted-foreground py-12">
                    Nenhum anúncio encontrado
                  </td>
                </tr>
              ) : (
                listings.map((l) => {
                  const statusConf = STATUS_CONFIG[l.status] || STATUS_CONFIG.active;
                  return (
                    <tr
                      key={l.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-foreground truncate">{l.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {l.description?.slice(0, 50)}...
                        </p>
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-medium">
                        {l.currency === "BRL" ? "R$" : l.currency} {l.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{l.category}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${statusConf.className}`}>
                          {statusConf.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          {l.views_count}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {format(new Date(l.created_at), "dd/MM/yy", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <Select onValueChange={(v) => changeStatus(l.id, v)}>
                            <SelectTrigger className="h-8 w-32 text-xs bg-white/5 border-white/10">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativar</SelectItem>
                              <SelectItem value="paused">Pausar</SelectItem>
                              <SelectItem value="sold">Marcar Vendido</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-red-500/10"
                            onClick={() => setDeleteTarget(l.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" /> Deletar Anúncio
            </DialogTitle>
            <DialogDescription>Esta ação é permanente e não pode ser desfeita.</DialogDescription>
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

export default AdminMarketplace;
