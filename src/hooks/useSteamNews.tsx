import { useState, useEffect } from "react";

export interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number;
  feedname: string;
  feed_type: number;
  appid: number;
  gameName?: string;
}

const STEAM_GAMES = [
  { id: 730, name: "Counter-Strike 2" },
  { id: 570, name: "Dota 2" },
  { id: 578080, name: "PUBG: BATTLEGROUNDS" },
  { id: 271590, name: "Grand Theft Auto V" },
];

export function useSteamNews() {
  const [news, setNews] = useState<SteamNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSteamNews = async () => {
      setLoading(true);
      setError(null);

      try {
        let allNews: SteamNewsItem[] = [];

        // Buscamos as notícias para os principais jogos configurados
        for (const game of STEAM_GAMES) {
          // Usamos o nosso proxy local do Vite e do Vercel (/steam-api/)
          // Isso nunca será bloqueado por Adblockers
          const targetUrl = `/steam-api/ISteamNews/GetNewsForApp/v0002/?appid=${game.id}&count=3&maxlength=300&format=json`;

          const response = await fetch(targetUrl);

          if (!response.ok) {
            console.warn(`Falha ao buscar notícias do jogo ${game.name}`);
            continue;
          }

          const data = await response.json();

          const items = data.appnews?.newsitems || [];

          // Adicionamos o nome do jogo em cada notícia para ficar fácil de identificar na interface
          const itemsWithGameName = items.map((item: any) => ({
            ...item,
            gameName: game.name,
          }));

          allNews = [...allNews, ...itemsWithGameName];
        }

        // Ordenamos todas as notícias por data (mais recente primeiro)
        allNews.sort((a, b) => b.date - a.date);

        setNews(allNews);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch steam news:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSteamNews();
  }, []);

  return { news, loading, error };
}
