import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlatformFeedback {
  id: string;
  user_id: string;
  content: string;
  status: "pending" | "reviewed" | "implemented" | "rejected";
  created_at: string;
  profile?: {
    name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

export const useFeedback = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<PlatformFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("platform_feedback" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Buscar os perfis dos autores
      const userIds = [...new Set((data || []).map((f: any) => f.user_id))];
      const profilesMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url, username")
          .in("user_id", userIds);

        if (profiles) {
          profiles.forEach((p) => {
            profilesMap[p.user_id] = p;
          });
        }
      }

      const formattedFeedbacks = data.map((f: any) => ({
        ...f,
        profile: profilesMap[f.user_id] || null,
      }));

      setFeedbacks(formattedFeedbacks);
    } catch (error) {
      console.error("Erro ao buscar feedbacks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async (content: string) => {
    if (!user) return { error: "Você precisa estar logado." };

    try {
      const { error } = await supabase.from("platform_feedback" as any).insert({
        user_id: user.id,
        content,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao enviar dica:", error);
      return { error: error.message };
    }
  };

  const updateFeedbackStatus = async (id: string, status: PlatformFeedback["status"]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("platform_feedback" as any)
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));

      return { success: true };
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      return { error: error.message };
    }
  };

  return {
    feedbacks,
    isLoading,
    fetchFeedbacks,
    submitFeedback,
    updateFeedbackStatus,
  };
};
