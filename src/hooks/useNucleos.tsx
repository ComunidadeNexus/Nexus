import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { slugifyNucleoName, uniquifyNucleoSlug } from "@/lib/nucleoSlug";

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

export const NUCLEOS_QUERY_KEY = ["nucleos"] as const;
export const MY_NUCLEOS_QUERY_KEY = ["my-nucleos"] as const;

function isUniqueViolation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "23505" || /duplicate key|unique constraint/i.test(error.message || "");
}

export const useNucleos = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidateNucleos = () => {
    queryClient.invalidateQueries({ queryKey: NUCLEOS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: MY_NUCLEOS_QUERY_KEY });
  };

  const nucleosQuery = useQuery({
    queryKey: NUCLEOS_QUERY_KEY,
    queryFn: async (): Promise<Nucleo[]> => {
      const { data, error } = await supabase
        .from("nucleos")
        .select("*")
        .order("members_count", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const myNucleosQuery = useQuery({
    queryKey: [...MY_NUCLEOS_QUERY_KEY, user?.id ?? null],
    enabled: Boolean(user),
    queryFn: async (): Promise<Nucleo[]> => {
      if (!user) return [];

      const { data: memberData, error: memberError } = await supabase
        .from("nucleo_members")
        .select("nucleo_id")
        .eq("user_id", user.id);

      if (memberError) throw memberError;
      if (!memberData || memberData.length === 0) return [];

      const nucleoIds = memberData.map((m) => m.nucleo_id);
      const { data, error } = await supabase
        .from("nucleos")
        .select("*")
        .in("id", nucleoIds)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  const fetchNucleos = async () => {
    await nucleosQuery.refetch();
  };

  const fetchMyNucleos = async () => {
    if (!user) return;
    await myNucleosQuery.refetch();
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
      const { data: membersData, error: membersError } = await supabase
        .from("nucleo_members")
        .select("*")
        .eq("nucleo_id", nucleoId)
        .order("joined_at", { ascending: true });

      if (membersError) throw membersError;
      if (!membersData || membersData.length === 0) return [];

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
    slug?: string;
    description?: string;
    color?: string;
    is_private?: boolean;
    avatar_url?: string;
  }): Promise<Nucleo | null> => {
    if (!user) {
      toast({
        title: "Erro ao criar núcleo",
        description: "Você precisa estar logado para criar uma comunidade.",
        variant: "destructive",
      });
      return null;
    }

    const name = data.name.trim();
    if (!name) {
      toast({
        title: "Erro ao criar núcleo",
        description: "O nome da comunidade é obrigatório.",
        variant: "destructive",
      });
      return null;
    }

    try {
      let lastError: { message?: string } | null = null;

      for (let attempt = 0; attempt < 4; attempt++) {
        const slug = uniquifyNucleoSlug(data.slug || name, attempt);
        const { data: nucleo, error } = await supabase
          .from("nucleos")
          .insert({
            name,
            slug,
            description: data.description,
            color: data.color,
            is_private: data.is_private,
            avatar_url: data.avatar_url,
            owner_id: user.id,
          })
          .select()
          .single();

        if (!error && nucleo) {
          toast({
            title: "Núcleo criado!",
            description: `O núcleo "${name}" foi criado com sucesso.`,
          });
          invalidateNucleos();
          return nucleo;
        }

        lastError = error;
        if (!isUniqueViolation(error)) break;
      }

      throw lastError || new Error("Não foi possível criar o núcleo.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente mais tarde.";
      toast({
        title: "Erro ao criar núcleo",
        description: message,
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

      invalidateNucleos();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente mais tarde.";
      toast({
        title: "Erro ao entrar no núcleo",
        description: message,
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

      invalidateNucleos();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente mais tarde.";
      toast({
        title: "Erro ao sair do núcleo",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const isMember = (nucleoId: string): boolean => {
    return (myNucleosQuery.data || []).some((n) => n.id === nucleoId);
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente mais tarde.";
      toast({
        title: "Erro ao adicionar regra",
        description: message,
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
      slug?: string;
    },
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: updated, error } = await supabase
        .from("nucleos")
        .update(data)
        .eq("id", nucleoId)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!updated) {
        throw new Error("Sem permissão para atualizar este núcleo, ou ele não existe mais.");
      }

      toast({
        title: "Comunidade atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });

      invalidateNucleos();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente mais tarde.";
      toast({
        title: "Erro ao atualizar",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteNucleo = async (nucleoId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: removed, error } = await supabase
        .from("nucleos")
        .delete()
        .eq("id", nucleoId)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!removed) {
        throw new Error("Sem permissão para excluir este núcleo, ou ele não existe mais.");
      }

      toast({
        title: "Comunidade excluída",
        description: "A comunidade foi apagada permanentemente.",
      });

      invalidateNucleos();
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Tente novamente mais tarde.";
      toast({
        title: "Erro ao excluir",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    nucleos: nucleosQuery.data || [],
    myNucleos: myNucleosQuery.data || [],
    isLoading: nucleosQuery.isLoading,
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
