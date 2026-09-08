import { useState, useEffect } from "react";

export interface Game {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
  rating?: number; // Metacritic ou RAWG rating
}

// Fallback Seguro (Os 12 jogos originais) para caso a API falhe ou a Chave não exista.
const CURATED_GAMES: Game[] = [
  {
    id: 1,
    title: "Valorant",
    thumbnail:
      "https://images.unsplash.com/photo-1646244795204-6b9409de4e49?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "Um FPS tático 5v5 focado em personagens da Riot Games. Mistura de tiro preciso com habilidades únicas.",
    game_url: "https://playvalorant.com/",
    genre: "Shooter",
    platform: "PC",
    publisher: "Riot Games",
    developer: "Riot Games",
    release_date: "2020-06-02",
    freetogame_profile_url: "https://playvalorant.com/",
    rating: 4.5,
  },
  {
    id: 2,
    title: "Genshin Impact",
    thumbnail:
      "https://images.unsplash.com/photo-1662409748687-f13c2dbff668?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "RPG de ação em mundo aberto fenomenal com sistema de gacha, combates elementais e exploração massiva.",
    game_url: "https://genshin.hoyoverse.com/",
    genre: "Action RPG",
    platform: "PC",
    publisher: "HoYoverse",
    developer: "HoYoverse",
    release_date: "2020-09-28",
    freetogame_profile_url: "https://genshin.hoyoverse.com/",
    rating: 4.8,
  },
  {
    id: 3,
    title: "League of Legends",
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "O MOBA mais jogado do mundo. Forme equipes, destrua torres e vença a base inimiga.",
    game_url: "https://www.leagueoflegends.com/",
    genre: "MOBA",
    platform: "PC",
    publisher: "Riot Games",
    developer: "Riot Games",
    release_date: "2009-10-27",
    freetogame_profile_url: "https://www.leagueoflegends.com/",
    rating: 4.2,
  },
  {
    id: 4,
    title: "Counter-Strike 2",
    thumbnail:
      "https://images.unsplash.com/photo-1623933939637-296561e1b123?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "A evolução do lendário CS:GO. Gráficos melhorados, fumaça dinâmica e servidores mais precisos.",
    game_url: "https://store.steampowered.com/app/730/CounterStrike_2/",
    genre: "Shooter",
    platform: "PC",
    publisher: "Valve",
    developer: "Valve",
    release_date: "2023-09-27",
    freetogame_profile_url: "https://store.steampowered.com/app/730/CounterStrike_2/",
    rating: 4.7,
  },
  {
    id: 5,
    title: "Apex Legends",
    thumbnail:
      "https://images.unsplash.com/photo-1614088612140-52e6973e20ec?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "Battle Royale frenético no universo de Titanfall. Escolha sua Lenda e sobreviva até o fim.",
    game_url: "https://www.ea.com/games/apex-legends",
    genre: "Battle Royale",
    platform: "PC",
    publisher: "Electronic Arts",
    developer: "Respawn",
    release_date: "2019-02-04",
    freetogame_profile_url: "https://www.ea.com/games/apex-legends",
    rating: 4.4,
  },
  {
    id: 6,
    title: "Warframe",
    thumbnail:
      "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "Ninjas espaciais. Lute pelo sistema solar em um jogo cooperativo incrivelmente expansivo.",
    game_url: "https://www.warframe.com/",
    genre: "Action RPG",
    platform: "PC",
    publisher: "Digital Extremes",
    developer: "Digital Extremes",
    release_date: "2013-03-25",
    freetogame_profile_url: "https://www.warframe.com/",
    rating: 4.6,
  },
  {
    id: 7,
    title: "Krunker.io",
    thumbnail:
      "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "FPS frenético focado em movimentação, que roda direto e rápido no seu navegador.",
    game_url: "https://krunker.io/",
    genre: "Shooter",
    platform: "Web",
    publisher: "Yendis",
    developer: "Yendis",
    release_date: "2018-05-20",
    freetogame_profile_url: "https://krunker.io/",
    rating: 4.1,
  },
  {
    id: 8,
    title: "Hole.io",
    thumbnail:
      "https://images.unsplash.com/photo-1611996575749-79a3a250f563?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "Controle um buraco negro e engula a cidade inteira competindo contra outros buracos.",
    game_url: "https://hole-io.com/",
    genre: "Casual",
    platform: "Web",
    publisher: "Voodoo",
    developer: "Voodoo",
    release_date: "2018-06-01",
    freetogame_profile_url: "https://hole-io.com/",
    rating: 3.8,
  },
  {
    id: 9,
    title: "Path of Exile",
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "Action RPG sombrio e complexo com a maior árvore de habilidades já vista na história dos games.",
    game_url: "https://www.pathofexile.com/",
    genre: "Action RPG",
    platform: "PC",
    publisher: "Grinding Gear Games",
    developer: "Grinding Gear Games",
    release_date: "2013-10-23",
    freetogame_profile_url: "https://www.pathofexile.com/",
    rating: 4.8,
  },
  {
    id: 10,
    title: "Smite",
    thumbnail:
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "MOBA em terceira pessoa onde você controla deuses mitológicos em combates intensos.",
    game_url: "https://www.smitegame.com/",
    genre: "MOBA",
    platform: "PC",
    publisher: "Hi-Rez Studios",
    developer: "Titan Forge Games",
    release_date: "2014-03-25",
    freetogame_profile_url: "https://www.smitegame.com/",
    rating: 4.3,
  },
  {
    id: 11,
    title: "Slither.io",
    thumbnail:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "O clássico jogo da cobrinha em um mapa massivo online. Coma bolinhas e não bata nos outros.",
    game_url: "http://slither.io/",
    genre: "Casual",
    platform: "Web",
    publisher: "Steve Howse",
    developer: "Steve Howse",
    release_date: "2016-03-25",
    freetogame_profile_url: "http://slither.io/",
    rating: 4.0,
  },
  {
    id: 12,
    title: "Overwatch 2",
    thumbnail:
      "https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=1000&auto=format&fit=crop",
    short_description:
      "Hero shooter em equipes 5v5 com personagens incrivelmente carismáticos e modos diversos.",
    game_url: "https://overwatch.blizzard.com/",
    genre: "Shooter",
    platform: "PC",
    publisher: "Blizzard",
    developer: "Blizzard",
    release_date: "2022-10-04",
    freetogame_profile_url: "https://overwatch.blizzard.com/",
    rating: 4.2,
  },
];

// CHAVE DA RAWG API
// Para a tela ficar 100% dinâmica, coloque sua chave aqui.
// Como pegar: Acesse rawg.io -> Entre com Google -> Get API Key (Grátis em 1 clique)
const RAWG_API_KEY = ""; // Cole sua chave entre as aspas

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDynamicGames = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!RAWG_API_KEY) {
          throw new Error("API Key não configurada. Usando fallback.");
        }

        // Puxa os jogos mais populares com nota acima de 80 e metacritic
        const response = await fetch(
          `https://api.rawg.io/api/games?key=${RAWG_API_KEY}&ordering=-added&page_size=24&metacritic=80,100`,
        );

        if (!response.ok) {
          throw new Error("Erro na API da RAWG");
        }

        const data = await response.json();

        // Mapeando do formato RAWG para o formato que a nossa interface já usa
        const dynamicGames: Game[] = data.results.map((g: any) => ({
          id: g.id,
          title: g.name,
          thumbnail:
            g.background_image ||
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000",
          short_description: `Lançado em ${g.released}. Metacritic: ${g.metacritic || "N/A"}. Gêneros: ${g.genres?.map((ge: any) => ge.name).join(", ")}.`,
          game_url: `https://rawg.io/games/${g.slug}`,
          genre: g.genres?.[0]?.name || "Desconhecido",
          platform: g.parent_platforms?.some((p: any) => p.platform.name.includes("PC"))
            ? "PC"
            : "Web",
          publisher: "Desconhecido",
          developer: "Desconhecido",
          release_date: g.released,
          freetogame_profile_url: `https://rawg.io/games/${g.slug}`,
          rating: g.rating, // 0 a 5 na RAWG
        }));

        setGames(dynamicGames);
        setLoading(false);
      } catch (err) {
        console.warn("Retornando para o catálogo seguro. Motivo:", err);
        // Fallback Inteligente: Se falhar ou não tiver API key, carrega nosso catálogo embaralhado!
        setTimeout(() => {
          const today = new Date();
          const day = today.getDate();
          const shuffled = [...CURATED_GAMES].sort((a, b) => {
            const numA = (a.id * day) % 7;
            const numB = (b.id * day) % 7;
            return numA - numB;
          });
          setGames(shuffled);
          setLoading(false);
        }, 500);
      }
    };

    fetchDynamicGames();
  }, []);

  return { games, loading, error };
}
