import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Nucleo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  color: string;
  is_private: boolean;
  is_verified: boolean;
  owner_id: string;
  members_count: number;
  posts_count: number;
  created_at: string;
}

export interface NucleoMember {
  id: string;
  nucleo_id: string;
  user_id: string;
  role: "owner" | "moderator" | "member";
  joined_at: string;
  profile?: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface NucleoRule {
  id: string;
  nucleo_id: string;
  title: string;
  description: string;
  order_position: number;
}

export const useNucleos = () => {
  const { user } = useAuth();
  const [nucleos, setNucleos] = useState<Nucleo[]>([]);
  const [myNucleos, setMyNucleos] = useState<Nucleo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNucleos = async () => {
    try {
      const { data, error } = await supabase
        .from("nucleos")
        .select("*")
        .order("members_count", { ascending: false });

      if (error) throw error;
      setNucleos(data || []);
    } catch (error) {
      console.error("Error fetching nucleos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyNucleos = async () => {
    if (!user) return;

    try {
      const { data: memberData, error: memberError } = await supabase
        .from("nucleo_members")
        .select("nucleo_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;

      if (memberData && memberData.length > 0) {
        const nucleoIds = memberData.map((m) => m.nucleo_id);
        const { data, error } = await supabase
          .from("nucleos")
          .select("*")
          .in("id", nucleoIds)
          .order("name");

        if (error) throw error;
        setMyNucleos(data || []);
      } else {
        setMyNucleos([]);
      }
    } catch (error) {
      console.error("Error fetching my nucleos:", error);
    }
  };

  const getNucleo = async (slug: string): Promise<Nucleo | null> => {
    try {
      const { data, error } = await supabase.from("nucleos").select("*").eq("slug", slug).single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching nucleo:", error);
      return null;
    }
  };

  const getNucleoMembers = async (nucleoId: string): Promise<NucleoMember[]> => {
    try {
      // Fetch members
      const { data: membersData, error: membersError } = await supabase
        .from("nucleo_members")
        .select("*")
        .eq("nucleo_id", nucleoId)
        .order("joined_at", { ascending: true });

      if (membersError) throw membersError;

      if (!membersData || membersData.length === 0) return [];

      // Fetch profiles separately
      const userIds = membersData.map((m) => m.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, name, username, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(profilesData?.map((p) => [p.user_id, p]) || []);

      return membersData.map((member) => ({
        ...member,
        profile: profilesMap.get(member.user_id) || undefined,
      })) as NucleoMember[];
    } catch (error) {
      console.error("Error fetching nucleo members:", error);
      return [];
    }
  };

  const getNucleoRules = async (nucleoId: string): Promise<NucleoRule[]> => {
    try {
      const { data, error } = await supabase
        .from("nucleo_rules")
        .select("*")
        .eq("nucleo_id", nucleoId)
        .order("order_position", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching nucleo rules:", error);
      return [];
    }
  };

  const createNucleo = async (data: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
    is_private?: boolean;
    avatar_url?: string;
  }): Promise<Nucleo | null> => {
    if (!user) return null;

    try {
      const { data: nucleo, error } = await supabase
        .from("nucleos")
        .insert({
          ...data,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Núcleo criado!",
        description: `O núcleo "${data.name}" foi criado com sucesso.`,
      });

      fetchNucleos();
      fetchMyNucleos();
      return nucleo;
    } catch (error: any) {
      toast({
        title: "Erro ao criar núcleo",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return null;
    }
  };

  const joinNucleo = async (nucleoId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from("nucleo_members").insert({
        nucleo_id: nucleoId,
        user_id: user.id,
        role: "member",
      });

      if (error) throw error;

      toast({
        title: "Você entrou no núcleo!",
        description: "Agora você é membro deste núcleo.",
      });

      fetchNucleos();
      fetchMyNucleos();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao entrar no núcleo",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };

  const leaveNucleo = async (nucleoId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("nucleo_members")
        .delete()
        .eq("nucleo_id", nucleoId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Você saiu do núcleo",
        description: "Você não é mais membro deste núcleo.",
      });

      fetchNucleos();
      fetchMyNucleos();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao sair do núcleo",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };

  const isMember = (nucleoId: string): boolean => {
    return myNucleos.some((n) => n.id === nucleoId);
  };

  const addRule = async (
    nucleoId: string,
    title: string,
    description: string,
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.from("nucleo_rules").insert({
        nucleo_id: nucleoId,
        title,
        description,
      });

      if (error) throw error;

      toast({
        title: "Regra adicionada!",
        description: "A regra foi adicionada ao núcleo.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar regra",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateNucleo = async (
    nucleoId: string,
    data: {
      name?: string;
      description?: string;
      avatar_url?: string;
      is_private?: boolean;
    },
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("nucleos")
        .update(data)
        .eq("id", nucleoId)
        .eq("owner_id", user.id); // Apenas o dono pode atualizar

      if (error) throw error;

      toast({
        title: "Comunidade atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });

      fetchNucleos();
      fetchMyNucleos();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteNucleo = async (nucleoId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("nucleos")
        .delete()
        .eq("id", nucleoId)
        .eq("owner_id", user.id); // Apenas o dono pode deletar

      if (error) throw error;

      toast({
        title: "Comunidade excluída",
        description: "A comunidade foi apagada permanentemente.",
      });

      fetchNucleos();
      fetchMyNucleos();
      return true;
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchNucleos();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyNucleos();
    }
  }, [user]);

  return {
    nucleos,
    myNucleos,
    isLoading,
    fetchNucleos,
    fetchMyNucleos,
    getNucleo,
    getNucleoMembers,
    getNucleoRules,
    createNucleo,
    updateNucleo,
    deleteNucleo,
    joinNucleo,
    leaveNucleo,
    isMember,
    addRule,
  };
};
