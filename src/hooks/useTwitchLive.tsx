import { useState, useEffect } from "react";

export interface TwitchStreamer {
  id: string;
  name: string;
  category: string;
  viewers: string;
  avatar: string;
  live: boolean;
  order: number;
}

// Lista base de streamers que queremos monitorar (adicionados pela comunidade)
const BASE_STREAMERS = [
  { id: "gaules", name: "Gaules", category: "Esports" },
  { id: "alanzoka", name: "Alanzoka", category: "Variedades" },
  { id: "baiano", name: "Baiano", category: "Esports" },
  { id: "paulinholokobr", name: "PaulinhoLOKO", category: "Roleplay" },
  { id: "cellbit", name: "Cellbit", category: "Just Chatting" },
  { id: "coringa", name: "Coringa", category: "Roleplay" },
  { id: "casimito", name: "Casimito", category: "Esportes" },
  { id: "yayahuz", name: "Yayah", category: "Variedades" },
  { id: "mount", name: "Mount", category: "Roleplay" },
  { id: "frtt", name: "frttt", category: "Esports" },
  { id: "gabepeixe", name: "Gabepeixe", category: "Roleplay" },
  { id: "michel", name: "Michel", category: "Esports" },
];

export function resolveTwitchAvatarUrl(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!/^https?:\/\//i.test(value)) return undefined;
  if (/user not found/i.test(value)) return undefined;
  return value;
}

export function useTwitchLive() {
  const [streamers, setStreamers] = useState<TwitchStreamer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTwitchStatus = async () => {
      setLoading(true);

      try {
        // Dispara as requisições em paralelo para ser rápido
        const promises = BASE_STREAMERS.map(async (streamer, index) => {
          try {
            // Usamos a DecAPI (API gratuita que não precisa de chaves/OAuth)
            const [uptimeRes, avatarRes, viewersRes] = await Promise.all([
              fetch(`https://decapi.me/twitch/uptime/${streamer.id}`),
              fetch(`https://decapi.me/twitch/avatar/${streamer.id}`),
              fetch(`https://decapi.me/twitch/viewercount/${streamer.id}`),
            ]);

            const uptime = await uptimeRes.text();
            const avatarUrl = await avatarRes.text();
            const viewersText = await viewersRes.text();

            // Se a resposta contiver "offline" ou erro, ele não está live
            const isOffline =
              uptime.toLowerCase().includes("offline") || uptime.includes("not found");
            const isLive = !isOffline;

            // Formata os viewers (se estiver offline, fica 0)
            let formattedViewers = "0";
            if (isLive && !viewersText.includes("offline")) {
              const count = parseInt(viewersText.replace(/\D/g, "")) || 0;
              if (count >= 1000) {
                formattedViewers = (count / 1000).toFixed(1) + "K";
              } else {
                formattedViewers = count.toString();
              }
            }

            return {
              ...streamer,
              avatar: resolveTwitchAvatarUrl(avatarUrl) ?? "",
              live: isLive,
              viewers: formattedViewers,
              order: index,
            };
          } catch (e) {
            console.error(`Erro ao buscar dados de ${streamer.name}:`, e);
            // Em caso de erro de rede, assume que está offline para não quebrar a tela
            return {
              ...streamer,
              avatar: "",
              live: false,
              viewers: "0",
              order: index,
            };
          }
        });

        const results = await Promise.all(promises);

        // Ordenar a lista:
        // 1. Quem está online primeiro
        // 2. Quem tem mais viewers (usando uma heurística simples, ou ordem original)
        // Para simplificar, colocamos online no topo e mantemos a ordem original
        results.sort((a, b) => {
          if (a.live === b.live) {
            return a.order - b.order;
          }
          return a.live ? -1 : 1;
        });

        setStreamers(results);
      } catch (err) {
        console.error("Erro geral na busca da Twitch", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTwitchStatus();

    // Atualiza a cada 5 minutos
    const interval = setInterval(fetchTwitchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { streamers, loading };
}
