import React, { useState } from "react";
import {
  Gamepad2,
  Sparkles,
  Download,
  ExternalLink,
  Rss,
  Clock,
  Star,
  Users,
  Gamepad,
  Compass,
} from "lucide-react";
import { useGameDownloads } from "@/hooks/useGameDownloads";
import { useSteamNews } from "@/hooks/useSteamNews";
import { useGames, Game } from "@/hooks/useGames";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const NexusGames = () => {
  const { games, loading: loadingGames } = useGames();
  const { downloads, isLoading: loadingDownloads } = useGameDownloads();
  const { news: steamNews, loading: loadingSteam } = useSteamNews();
  const [activeTab, setActiveTab] = useState("explorar");

  const featuredGame = games && games.length > 0 ? games[0] : null;
  const gridGames = games && games.length > 1 ? games.slice(1) : [];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col min-h-[80vh] animate-fade-in px-4 py-8">
      {/* Tab Navigation Menu */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/20 p-2 rounded-xl">
              <Gamepad2 className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 hidden sm:block">
              Nexus Store
            </h1>
          </div>
          <TabsList className="bg-black/40 border border-white/5 p-1 rounded-xl">
            <TabsTrigger
              value="explorar"
              className="gap-2 px-6 rounded-lg data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 transition-all"
            >
              <Compass className="w-4 h-4" /> Explorar
            </TabsTrigger>
            <TabsTrigger
              value="atualizacoes"
              className="gap-2 px-6 rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 transition-all"
            >
              <Rss className="w-4 h-4" /> Atualizações
            </TabsTrigger>
            <TabsTrigger
              value="downloads"
              className="gap-2 px-6 rounded-lg data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 transition-all"
            >
              <Download className="w-4 h-4" /> VIP
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Aba: Explorar (Catálogo) */}
        <TabsContent value="explorar" className="mt-0 focus-visible:outline-none space-y-8">
          {loadingGames ? (
            <>
              <Skeleton className="w-full h-[400px] rounded-3xl" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Featured Game Hero Banner */}
              {featuredGame && (
                <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden group border border-white/10 shadow-2xl">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                    style={{ backgroundImage: `url(${featuredGame.thumbnail})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-[#0a0c14]/80 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c14] via-[#0a0c14]/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full md:w-2/3">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/50">
                        Destaque
                      </Badge>
                      {featuredGame.rating && (
                        <Badge
                          variant="outline"
                          className="bg-black/50 backdrop-blur-sm border-yellow-500/30 text-yellow-400 gap-1"
                        >
                          <Star className="w-3 h-3 fill-yellow-400" /> {featuredGame.rating}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="bg-black/50 backdrop-blur-sm text-gray-300"
                      >
                        {featuredGame.genre}
                      </Badge>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                      {featuredGame.title}
                    </h2>
                    <p className="text-gray-300 text-sm md:text-lg mb-8 line-clamp-2 max-w-xl drop-shadow">
                      {featuredGame.short_description}
                    </p>
                    <div className="flex items-center gap-4">
                      <a href={featuredGame.game_url} target="_blank" rel="noopener noreferrer">
                        <Button className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-6 rounded-xl gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                          <Gamepad2 className="w-5 h-5" /> Jogar Agora
                        </Button>
                      </a>
                      <Button
                        variant="outline"
                        className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white font-medium px-6 py-6 rounded-xl transition-all"
                      >
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Em Alta */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-indigo-400" /> Em Alta
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {gridGames.map((game) => (
                    <a
                      key={game.id}
                      href={game.game_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <Card className="bg-black/40 border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)] hover:border-indigo-500/30 h-full flex flex-col rounded-xl">
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                            style={{ backgroundImage: `url(${game.thumbnail})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                          {/* Rating badge floating on top right */}
                          {game.rating && (
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-md px-1.5 py-1 flex items-center gap-1 border border-white/10">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-[10px] font-bold text-white">
                                {game.rating}
                              </span>
                            </div>
                          )}

                          <div className="absolute bottom-0 left-0 p-3 w-full">
                            <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 mb-1 group-hover:text-indigo-400 transition-colors">
                              {game.title}
                            </h4>
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              {game.genre}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Tab de Atualizações (Steam News API) */}
        <TabsContent value="atualizacoes" className="mt-0 focus-visible:outline-none">
          {loadingSteam ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-32 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : steamNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white/5 border border-dashed border-white/10 rounded-2xl">
              <Rss className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Nenhuma atualização no momento</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Não conseguimos carregar as novidades agora.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {steamNews.map((newsItem) => (
                <Card
                  key={newsItem.gid}
                  className="overflow-hidden bg-card/40 border-white/5 hover:border-blue-500/30 transition-all duration-300 group flex flex-col h-full rounded-xl"
                >
                  <CardContent className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded font-medium">
                        {newsItem.gameName}
                      </span>
                      <span className="flex items-center text-xs text-muted-foreground gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(newsItem.date * 1000), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-3 text-foreground group-hover:text-blue-400 transition-colors line-clamp-2">
                      {newsItem.title}
                    </h3>

                    <p
                      className="text-sm text-muted-foreground line-clamp-4 flex-grow mb-4"
                      dangerouslySetInnerHTML={{
                        __html: newsItem.contents.replace(/<[^>]*>?/gm, ""),
                      }}
                    />

                    <a
                      href={newsItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full mt-auto"
                    >
                      <Button
                        variant="outline"
                        className="w-full border-white/10 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 gap-2 transition-all rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4" /> Ler na Steam
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab de Downloads VIP */}
        <TabsContent value="downloads" className="mt-0 focus-visible:outline-none">
          {loadingDownloads ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white/5 border border-dashed border-white/10 rounded-2xl">
              <Gamepad2 className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Nenhum download disponível</h3>
              <p className="text-muted-foreground text-center max-w-md">
                A equipe ainda não disponibilizou jogos para download direto. Fique de olho,
                novidades chegarão em breve!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {downloads.map((game) => (
                <Card
                  key={game.id}
                  className="overflow-hidden bg-card/40 border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] group flex flex-col h-full rounded-xl"
                >
                  <div className="relative">
                    <div
                      className="h-48 w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${game.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000"})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    {game.platform && (
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/10 font-medium">
                        {game.platform}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-lg leading-tight mb-2 text-foreground group-hover:text-emerald-400 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow">
                      {game.description || "Nenhuma descrição informada para este jogo."}
                    </p>
                    <a
                      href={game.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full mt-auto"
                    >
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg hover:shadow-emerald-500/25 transition-all rounded-lg">
                        <Download className="w-4 h-4" /> Baixar Agora
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NexusGames;
