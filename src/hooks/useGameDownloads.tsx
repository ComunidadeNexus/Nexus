import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface GameDownload {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  download_url: string;
  platform: string | null;
  is_active: boolean;
  created_at: string;
}

export const useGameDownloads = () => {
  const [downloads, setDownloads] = useState<GameDownload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDownloads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("game_downloads")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error: any) {
      console.error("Error fetching game downloads:", error);
      toast({
        title: "Erro",
        description: "Falha ao buscar downloads de jogos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDownload = async (
    downloadData: Omit<GameDownload, "id" | "created_at" | "is_active">,
  ) => {
    try {
      const { data, error } = await supabase
        .from("game_downloads")
        .insert([{ ...downloadData, is_active: true }])
        .select()
        .single();

      if (error) throw error;

      setDownloads((prev) => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Jogo adicionado com sucesso!",
      });
      return true;
    } catch (error: any) {
      console.error("Error adding game download:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao adicionar o jogo.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteDownload = async (id: string) => {
    try {
      const { error } = await supabase.from("game_downloads").delete().eq("id", id);
      if (error) throw error;

      setDownloads((prev) => prev.filter((d) => d.id !== id));
      toast({
        title: "Sucesso",
        description: "Jogo removido com sucesso!",
      });
      return true;
    } catch (error: any) {
      console.error("Error deleting game download:", error);
      toast({
        title: "Erro",
        description: "Falha ao remover o jogo.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  return {
    downloads,
    isLoading,
    fetchDownloads,
    addDownload,
    deleteDownload,
  };
};
