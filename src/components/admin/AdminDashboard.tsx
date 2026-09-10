import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminData } from "@/hooks/useAdminData";
import AdminStatCard from "./AdminStatCard";
import {
  Users,
  FileText,
  Hexagon,
  ShoppingBag,
  CreditCard,
  Coins,
  ShieldX,
  BadgeCheck,
  Crown,
  Shield,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    stats,
    loadingStats,
    fetchStats,
    posts,
    loadingPosts,
    fetchPosts,
    users,
    loadingUsers,
    fetchUsers,
  } = useAdminData();

  useEffect(() => {
    fetchStats();
    fetchPosts();
    fetchUsers();
  }, []);

  const statCards = stats
    ? [
        {
          title: "Total de Membros",
          value: stats.totalUsers,
          icon: Users,
          colorClass: "text-blue-400",
          bgClass: "bg-blue-500/10",
          trendLabel: "usuários cadastrados",
        },
        {
          title: "Total de Posts",
          value: stats.totalPosts,
          icon: FileText,
          colorClass: "text-emerald-400",
          bgClass: "bg-emerald-500/10",
          trendLabel: "publicações",
        },
        {
          title: "Núcleos Ativos",
          value: stats.totalNucleos,
          icon: Hexagon,
          colorClass: "text-violet-400",
          bgClass: "bg-violet-500/10",
        },
        {
          title: "Anúncios Marketplace",
          value: stats.totalMarketplace,
          icon: ShoppingBag,
          colorClass: "text-orange-400",
          bgClass: "bg-orange-500/10",
        },
        {
          title: "Assinaturas Ativas",
          value: stats.totalSubscriptions,
          icon: CreditCard,
          colorClass: "text-yellow-400",
          bgClass: "bg-yellow-500/10",
        },
        {
          title: "Transações de Coins",
          value: stats.totalCoinsTransactions,
          icon: Coins,
          colorClass: "text-amber-400",
          bgClass: "bg-amber-500/10",
        },
        {
          title: "Usuários Banidos",
          value: stats.bannedUsers,
          icon: ShieldX,
          colorClass: "text-red-400",
          bgClass: "bg-red-500/10",
          trend: stats.bannedUsers > 0 ? ("down" as const) : ("neutral" as const),
        },
        {
          title: "Usuários Verificados",
          value: stats.verifiedUsers,
          icon: BadgeCheck,
          colorClass: "text-sky-400",
          bgClass: "bg-sky-500/10",
          trend: "up" as const,
        },
        {
          title: "Usuários Premium",
          value: stats.premiumUsers,
          icon: Crown,
          colorClass: "text-yellow-400",
          bgClass: "bg-yellow-500/10",
        },
        {
          title: "Administradores",
          value: stats.adminUsers,
          icon: Shield,
          colorClass: "text-violet-400",
          bgClass: "bg-violet-500/10",
        },
      ]
    : [];

  const recentPosts = posts.slice(0, 8);
  const topUsers = [...users].sort((a, b) => (b.karma || 0) - (a.karma || 0)).slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral da plataforma Nexus</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/admin/premio")}
          className="flex items-center gap-3 p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 text-left hover:bg-yellow-500/15 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Área Premium</p>
            <p className="text-xs text-muted-foreground">
              Publicar downloads e conteúdos do cofre
            </p>
          </div>
        </button>
        <button
          onClick={() => navigate("/admin/assinaturas")}
          className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 text-left hover:bg-white/8 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Assinaturas</p>
            <p className="text-xs text-muted-foreground">Editar o plano que os usuários veem</p>
          </div>
        </button>
      </div>

      {/* Stats Grid */}
      {loadingStats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array(10)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((card, i) => (
            <AdminStatCard key={i} {...card} />
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Posts Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPosts ? (
              <div className="space-y-3">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
              </div>
            ) : (
              <div className="space-y-2">
                {recentPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum post encontrado
                  </p>
                ) : (
                  recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {(post.content || "").slice(0, 60)}
                          {(post.content || "").length > 60 ? "..." : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(post.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card className="bg-white/5 border-white/10 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              Top Membros por Karma
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="space-y-3">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                  ))}
              </div>
            ) : (
              <div className="space-y-2">
                {topUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum usuário encontrado
                  </p>
                ) : (
                  topUsers.map((user, i) => (
                    <div
                      key={user.user_id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                        {i + 1}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden shrink-0">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (user.name || user.username || "?")[0].toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.name || user.username || "Sem nome"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Nível {user.level} · {user.karma} karma
                        </p>
                      </div>
                      <RoleBadge role={user.role || "user"} />
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const config: Record<string, { label: string; className: string }> = {
    admin: { label: "Admin", className: "bg-violet-500/20 text-violet-400 border-violet-500/30" },
    moderator: { label: "Mod", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    premium: {
      label: "Premium",
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    user: { label: "User", className: "bg-white/10 text-muted-foreground border-white/10" },
  };
  const c = config[role] || config.user;
  return <Badge className={`text-xs ${c.className}`}>{c.label}</Badge>;
};

export default AdminDashboard;
