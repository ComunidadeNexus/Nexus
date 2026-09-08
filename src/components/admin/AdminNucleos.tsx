import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const AdminNucleos = () => {
  const { toast } = useToast();
  const [nucleos, setNucleos] = useState<Nucleo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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

  const toggleVerify = async (id: string, current: boolean) => {
    await supabase.from("nucleos").update({ is_verified: !current }).eq("id", id);
    toast({ title: !current ? "Núcleo verificado!" : "Verificação removida" });
    fetchNucleos(search);
  };

  const togglePrivate = async (id: string, current: boolean) => {
    await supabase.from("nucleos").update({ is_private: !current }).eq("id", id);
    toast({ title: !current ? "Núcleo privado" : "Núcleo público" });
    fetchNucleos(search);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("nucleos").delete().eq("id", id);
    toast({ title: "Núcleo deletado" });
    setDeleteTarget(null);
    fetchNucleos(search);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
          <Hexagon className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Núcleos</h1>
          <p className="text-sm text-muted-foreground">{nucleos.length} núcleos encontrados</p>
        </div>
      </div>

      {/* Search */}
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

      {/* Table */}
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
