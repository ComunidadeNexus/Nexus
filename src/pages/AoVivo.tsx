import React, { useState, useEffect } from "react";
import { Tv, Users, Heart, Gamepad2, Trophy, Flame, MessageSquare, Loader2 } from "lucide-react";
import { useTwitchLive } from "@/hooks/useTwitchLive";
import { useIsMobile } from "@/hooks/use-mobile";

const CATEGORIES = ["Todos", "Esports", "Roleplay", "Variedades", "Just Chatting", "Esportes"];

const AoVivo = () => {
  const { streamers, loading } = useTwitchLive();
  const isMobile = useIsMobile();
  const [activeStreamer, setActiveStreamer] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [showChat, setShowChat] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setShowChat(false);
    }
  }, [isMobile]);

  // Define o primeiro streamer online como ativo quando a lista carregar
  useEffect(() => {
    if (streamers.length > 0 && !activeStreamer) {
      setActiveStreamer(streamers[0].id);
    }
  }, [streamers, activeStreamer]);

  const PARENT_DOMAIN = window.location.hostname;

  const activeStreamerData = streamers.find((s) => s.id === activeStreamer) || streamers[0];

  const filteredStreamers = streamers.filter((s) =>
    activeCategory === "Todos" ? true : s.category === activeCategory,
  );

  return (
    <div className="w-full min-w-0 flex flex-col gap-6 pb-4 animate-fade-in overflow-x-hidden">
      {/* Coluna Principal (Player e Info) */}
      <div className="flex-1 flex flex-col">
        {/* Header do Hub */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-red-500/20 backdrop-blur-md rounded-xl">
            <Tv className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
              Área Ao Vivo
            </h1>
            <p className="text-gray-400 text-sm">
              Assista aos maiores criadores do Brasil direto da Nexus.
            </p>
          </div>
        </div>

        {/* Twitch Player & Chat Wrapper */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 items-stretch min-w-0">
          <div className="flex-1 min-w-0 bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative aspect-video flex items-center justify-center">
            {!activeStreamerData ? (
              <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
            ) : (
              <iframe
                src={`https://player.twitch.tv/?channel=${activeStreamerData.id}&parent=${PARENT_DOMAIN}&autoplay=true`}
                height="100%"
                width="100%"
                allowFullScreen={true}
                allow="fullscreen"
                className="absolute top-0 left-0 w-full h-full border-0"
                title="Twitch Stream"
              ></iframe>
            )}
          </div>

          {/* Chat da Twitch Integrado */}
          {showChat && (
            <div className="w-full lg:w-[min(350px,100%)] min-w-0 bg-[#18181B] rounded-2xl overflow-hidden shadow-2xl border border-gray-800 shrink-0 h-[280px] sm:h-[400px] lg:h-auto lg:min-h-[360px] flex items-center justify-center">
              {!activeStreamerData ? (
                <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
              ) : (
                <iframe
                  src={`https://www.twitch.tv/embed/${activeStreamerData.id}/chat?parent=${PARENT_DOMAIN}&darkpopout`}
                  height="100%"
                  width="100%"
                  className="border-0"
                  title="Twitch Chat"
                ></iframe>
              )}
            </div>
          )}
        </div>

        {/* Info do Streamer Atual */}
        {activeStreamerData ? (
          <div className="bg-white dark:bg-[#1A282D] rounded-2xl p-5 border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={activeStreamerData.avatar}
                alt={activeStreamerData.name}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 shrink-0 ${activeStreamerData.live ? "border-red-500 shadow-lg" : "border-gray-500 grayscale"}`}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                    {activeStreamerData.name}
                  </h2>
                  {activeStreamerData.live ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span> AO VIVO
                    </span>
                  ) : (
                    <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      OFFLINE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-purple-500" /> {activeStreamerData.category}
                  </span>
                  {activeStreamerData.live && (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" /> {activeStreamerData.viewers}{" "}
                      assistindo
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex-1 md:flex-none min-h-11 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-5 h-5" /> {showChat ? "Ocultar Chat" : "Ver Chat"}
              </button>
              <a
                href={`https://twitch.tv/${activeStreamerData.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-none min-h-11 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-500/20"
              >
                <Heart className="w-5 h-5" /> Seguir
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1A282D] rounded-2xl p-5 border border-gray-200 dark:border-gray-800 h-28 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Grade de Streamers (Abaixo do Vídeo) */}
      <div className="w-full flex flex-col mt-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-xl">
            <Flame className="w-6 h-6 text-orange-500" />
            Canais Recomendados
          </h3>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                  activeCategory === cat
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-white dark:bg-[#1A282D] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-dashed border-white/10 rounded-2xl w-full">
            <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Buscando canais ao vivo...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {filteredStreamers.map((streamer, index) => (
              <button
                key={streamer.id}
                onClick={() => {
                  setActiveStreamer(streamer.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all w-full ${
                  activeStreamer === streamer.id
                    ? "bg-red-50 dark:bg-red-500/10 border-2 border-red-500 shadow-lg shadow-red-500/20"
                    : streamer.live
                      ? "bg-white dark:bg-[#1A282D] border border-gray-200 dark:border-gray-800 hover:border-red-500/50 hover:shadow-xl hover:-translate-y-1"
                      : "bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="relative">
                  <img
                    src={streamer.avatar}
                    alt={streamer.name}
                    className={`w-20 h-20 rounded-full shadow-md object-cover ${!streamer.live && "grayscale"}`}
                  />
                  {streamer.live && (
                    <div className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-red-500 border-2 border-white dark:border-[#1A282D] rounded-full text-[10px] font-bold text-white uppercase shadow-sm">
                      Live
                    </div>
                  )}
                  {index < 3 && activeCategory === "Todos" && streamer.live && (
                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md">
                      <Trophy
                        className={`w-4 h-4 ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-orange-400"}`}
                      />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center text-center w-full min-w-0">
                  <span
                    className={`font-bold text-base w-full truncate ${activeStreamer === streamer.id ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}
                  >
                    {streamer.name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs w-full truncate">
                    {streamer.category}
                  </span>
                  {streamer.live ? (
                    <div className="flex items-center justify-center gap-1 mt-2 text-red-500 font-bold bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full text-xs">
                      <Users className="w-3.5 h-3.5" />
                      {streamer.viewers}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 mt-2 text-gray-400 font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
                      Offline
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AoVivo;
