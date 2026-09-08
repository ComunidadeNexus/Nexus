import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  Heart,
  MessageCircle,
  FileText,
  Users,
  Eye,
  Crown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Analytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isGlobalAdmin = location.pathname.startsWith("/admin");
  const { analytics, loading, period, setPeriod } = useAnalytics(isGlobalAdmin);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    description,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    description?: string;
  }) => (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {(trend || description) && (
              <div className="flex items-center gap-1 text-sm">
                {trend === "up" && (
                  <span className="flex items-center text-green-500">
                    <ArrowUpRight className="w-4 h-4" />
                    {trendValue}
                  </span>
                )}
                {trend === "down" && (
                  <span className="flex items-center text-red-500">
                    <ArrowDownRight className="w-4 h-4" />
                    {trendValue}
                  </span>
                )}
                {description && <span className="text-muted-foreground">{description}</span>}
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Faça login para acessar o analytics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Dashboard de Analytics
                </h1>
              </div>
              <p className="text-muted-foreground mt-1">Acompanhe o desempenho do seu conteúdo</p>
            </div>

            {/* Period Selector */}
            <Tabs value={period} onValueChange={(v) => setPeriod(v as "7d" | "30d" | "90d")}>
              <TabsList>
                <TabsTrigger value="7d" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />7 dias
                </TabsTrigger>
                <TabsTrigger value="30d">30 dias</TabsTrigger>
                <TabsTrigger value="90d">90 dias</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="glass-card">
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total de Posts"
                  value={analytics?.totalPosts || 0}
                  icon={FileText}
                  description={`${analytics?.postsThisWeek || 0} esta semana`}
                />
                <StatCard
                  title="Total de Curtidas"
                  value={analytics?.totalLikes || 0}
                  icon={Heart}
                  trend="up"
                  trendValue={`+${analytics?.likesThisWeek || 0}`}
                  description="esta semana"
                />
                <StatCard
                  title="Total de Comentários"
                  value={analytics?.totalComments || 0}
                  icon={MessageCircle}
                  trend="up"
                  trendValue={`+${analytics?.commentsThisWeek || 0}`}
                  description="esta semana"
                />
                <StatCard
                  title="Taxa de Engajamento"
                  value={`${(analytics?.avgEngagementRate || 0).toFixed(1)}`}
                  icon={TrendingUp}
                  description="interações por post"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Over Time */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Engajamento ao Longo do Tempo
                    </CardTitle>
                    <CardDescription>Curtidas e comentários por dia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analytics?.dailyStats || []}>
                          <defs>
                            <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor="hsl(var(--secondary))"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="hsl(var(--secondary))"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            className="text-muted-foreground"
                          />
                          <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="likes"
                            stroke="hsl(var(--primary))"
                            fillOpacity={1}
                            fill="url(#colorLikes)"
                            name="Curtidas"
                          />
                          <Area
                            type="monotone"
                            dataKey="comments"
                            stroke="hsl(var(--secondary))"
                            fillOpacity={1}
                            fill="url(#colorComments)"
                            name="Comentários"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Created */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Posts Criados
                    </CardTitle>
                    <CardDescription>Quantidade de posts por dia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics?.dailyStats || []}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            className="text-muted-foreground"
                          />
                          <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar
                            dataKey="posts"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            name="Posts"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Posts */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Posts com Melhor Desempenho
                  </CardTitle>
                  <CardDescription>Seus posts com maior engajamento</CardDescription>
                </CardHeader>
                <CardContent>
                  {analytics?.topPosts && analytics.topPosts.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.topPosts.map((post, index) => (
                        <div
                          key={post.id}
                          className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/comunidade?post=${post.id}`)}
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground line-clamp-2">{post.content}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(post.created_at), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {post.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {post.comments_count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum post encontrado ainda.</p>
                      <p className="text-sm">Comece a criar conteúdo para ver suas estatísticas!</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title={isGlobalAdmin ? "Usuários Totais" : "Seguidores"}
                  value={analytics?.followerGrowth || 0}
                  icon={Users}
                />
                <StatCard
                  title="Posts este Mês"
                  value={analytics?.postsThisMonth || 0}
                  icon={FileText}
                />
                <StatCard
                  title="Média Semanal"
                  value={(analytics?.postsThisWeek || 0).toFixed(1)}
                  icon={BarChart3}
                  description="posts por semana"
                />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analytics;
