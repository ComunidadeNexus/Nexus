import { useState, useEffect } from "react";
import { useAdminData, AdminPost } from "@/hooks/useAdminData";
import {
  FileText,
  Search,
  Eye,
  EyeOff,
  Pin,
  PinOff,
  Trash2,
  MessageCircle,
  Filter,
  AlertTriangle,
} from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminConteudo = () => {
  const { posts, loadingPosts, fetchPosts, toggleHidePost, togglePinPost, deletePost } =
    useAdminData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [commentSearch, setCommentSearch] = useState("");

  useEffect(() => {
    fetchPosts();
    fetchComments();
  }, []);

  const fetchComments = async (search = "") => {
    setLoadingComments(true);
    try {
      let query = supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (search) query = query.ilike("content", `%${search}%`);
      const { data } = await query;
      setComments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleHideComment = async (id: string, isHidden: boolean) => {
    await supabase.from("comments").update({ is_hidden: !isHidden }).eq("id", id);
    toast({ title: !isHidden ? "Comentário ocultado" : "Comentário visível" });
    fetchComments();
  };

  const deleteComment = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    toast({ title: "Comentário deletado" });
    fetchComments();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Moderação de Conteúdo</h1>
          <p className="text-sm text-muted-foreground">Gerencie posts e comentários</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-0">
        {[
          { key: "posts", label: "Posts", count: posts.length },
          { key: "comments", label: "Comentários", count: comments.length },
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
            <span className="ml-2 text-xs bg-white/10 rounded-full px-2 py-0.5">{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === "posts" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPosts(search, filterType)}
                placeholder="Buscar posts..."
                className="pl-9 bg-white/5 border-white/10"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(v) => {
                const val = v === "all" ? "" : v;
                setFilterType(val);
                fetchPosts(search, val);
              }}
            >
              <SelectTrigger className="w-44 bg-white/5 border-white/10">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="hidden">Ocultos</SelectItem>
                <SelectItem value="visible">Visíveis</SelectItem>
                <SelectItem value="pinned">Fixados</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => fetchPosts(search, filterType)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Search className="w-4 h-4 mr-2" /> Buscar
            </Button>
          </div>

          {/* Posts Table */}
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                      Conteúdo
                    </th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Likes</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                      Comentários
                    </th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Data</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPosts ? (
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
                  ) : posts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-muted-foreground py-12">
                        Nenhum post encontrado
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-foreground text-sm truncate">
                            {post.content.slice(0, 80)}
                            {post.content.length > 80 ? "..." : ""}
                          </p>
                          {post.media_url && (
                            <span className="text-xs text-muted-foreground">📎 Mídia anexada</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            {post.is_hidden && (
                              <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                                Oculto
                              </Badge>
                            )}
                            {post.is_pinned && (
                              <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                                Fixado
                              </Badge>
                            )}
                            {post.is_premium_only && (
                              <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                Premium
                              </Badge>
                            )}
                            {!post.is_hidden && !post.is_pinned && !post.is_premium_only && (
                              <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                Normal
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-foreground">{post.likes_count}</td>
                        <td className="px-4 py-3 text-foreground">{post.comments_count}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {format(new Date(post.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              title={post.is_hidden ? "Mostrar" : "Ocultar"}
                              className="h-8 w-8 hover:bg-white/10"
                              onClick={() => toggleHidePost(post.id, post.is_hidden)}
                            >
                              {post.is_hidden ? (
                                <Eye className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-orange-400" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title={post.is_pinned ? "Desafixar" : "Fixar"}
                              className="h-8 w-8 hover:bg-white/10"
                              onClick={() => togglePinPost(post.id, post.is_pinned)}
                            >
                              {post.is_pinned ? (
                                <PinOff className="w-4 h-4 text-amber-400" />
                              ) : (
                                <Pin className="w-4 h-4 text-amber-400" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              title="Deletar"
                              className="h-8 w-8 hover:bg-red-500/10"
                              onClick={() => setDeleteTarget(post.id)}
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
        </>
      )}

      {activeTab === "comments" && (
        <>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchComments(commentSearch)}
                placeholder="Buscar comentários..."
                className="pl-9 bg-white/5 border-white/10"
              />
            </div>
            <Button
              onClick={() => fetchComments(commentSearch)}
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
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                      Conteúdo
                    </th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Likes</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Data</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingComments ? (
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <tr key={i} className="border-b border-white/5">
                          {Array(5)
                            .fill(0)
                            .map((_, j) => (
                              <td key={j} className="px-4 py-3">
                                <Skeleton className="h-8 rounded" />
                              </td>
                            ))}
                        </tr>
                      ))
                  ) : comments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted-foreground py-12">
                        Nenhum comentário encontrado
                      </td>
                    </tr>
                  ) : (
                    comments.map((comment) => (
                      <tr
                        key={comment.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-foreground text-sm truncate">
                            {comment.content.slice(0, 80)}
                            {comment.content.length > 80 ? "..." : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {comment.is_hidden ? (
                            <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">
                              Oculto
                            </Badge>
                          ) : (
                            <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              Visível
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground">{comment.likes_count}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {format(new Date(comment.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-white/10"
                              onClick={() => toggleHideComment(comment.id, comment.is_hidden)}
                            >
                              {comment.is_hidden ? (
                                <Eye className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-orange-400" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 hover:bg-red-500/10"
                              onClick={() => deleteComment(comment.id)}
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
        </>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-background/95 backdrop-blur border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" /> Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              Esta ação é permanente e não pode ser desfeita. O post e todos os seus comentários
              serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteTarget) {
                  deletePost(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Deletar Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminConteudo;
