import { useState, useEffect } from "react";

export interface Giveaway {
  id: number;
  title: string;
  worth: string;
  thumbnail: string;
  image: string;
  description: string;
  instructions: string;
  open_giveaway_url: string;
  published_date: string;
  type: string;
  platforms: string;
  end_date: string;
  users: number;
  status: string;
  gamerpower_url: string;
}

export function useGiveaways() {
  const [giveaways, setGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGiveaways = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("https://www.gamerpower.com/api/giveaways?type=game");

        if (!response.ok) {
          throw new Error("Erro na API da GamerPower");
        }

        const data = await response.json();

        // Pega apenas promoções ativas de jogos grátis completos (Full Games)
        // e que pertencem ao PC (Steam, Epic, GOG, etc).
        const filteredDeals = data.filter(
          (g: any) =>
            g.status === "Active" &&
            g.type === "Game" &&
            (g.platforms.includes("PC") ||
              g.platforms.includes("Steam") ||
              g.platforms.includes("Epic Games Store")),
        );

        setGiveaways(filteredDeals.slice(0, 16)); // Limitamos aos 16 mais recentes/relevantes
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch giveaways:", err);
        setError(err.message);

        // Fallback fake data in case API fails
        setGiveaways([
          {
            id: 1,
            title: "Promoção Especial da Epic",
            worth: "$19.99",
            thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000",
            image: "",
            description:
              "A API oficial está momentaneamente fora do ar, mas continue acompanhando o nosso Hub para novidades!",
            instructions: "",
            open_giveaway_url: "https://store.epicgames.com/",
            published_date: "",
            type: "Game",
            platforms: "Epic Games Store",
            end_date: "",
            users: 0,
            status: "Active",
            gamerpower_url: "",
          },
        ]);
        setLoading(false);
      }
    };

    fetchGiveaways();
  }, []);

  return { giveaways, loading, error };
}
