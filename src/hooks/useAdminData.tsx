import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface AdminUser {
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_banned: boolean;
  is_verified: boolean;
  karma: number;
  xp_points: number;
  level: number;
  followers_count: number;
  following_count: number;
  created_at: string;
  role?: string;
  wallet_balance?: number;
}

export interface AdminPost {
  id: string;
  content: string;
  created_at: string;
  is_hidden: boolean;
  is_pinned: boolean;
  is_premium_only: boolean;
  likes_count: number;
  comments_count: number;
  upvotes: number;
  downvotes: number;
  user_id: string;
  category_id: string | null;
  media_url: string | null;
  media_type: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalNucleos: number;
  totalMarketplace: number;
  totalSubscriptions: number;
  totalCoinsTransactions: number;
  bannedUsers: number;
  verifiedUsers: number;
  premiumUsers: number;
  adminUsers: number;
}

export const useAdminData = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // ─── STATS ──────────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [
        { count: totalUsers },
        { count: totalPosts },
        { count: totalNucleos },
        { count: totalMarketplace },
        { count: totalSubscriptions },
        { count: totalCoinsTransactions },
        { count: bannedUsers },
        { count: verifiedUsers },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("nucleos").select("*", { count: "exact", head: true }),
        supabase.from("marketplace_listings").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("coin_transactions").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_verified", true),
      ]);

      const { count: premiumUsers } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "premium");

      const { count: adminUsers } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin");

      setStats({
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        totalNucleos: totalNucleos || 0,
        totalMarketplace: totalMarketplace || 0,
        totalSubscriptions: totalSubscriptions || 0,
        totalCoinsTransactions: totalCoinsTransactions || 0,
        bannedUsers: bannedUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        premiumUsers: premiumUsers || 0,
        adminUsers: adminUsers || 0,
      });
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ─── USERS ──────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (search = "", filterRole = "", filterBanned = "") => {
    setLoadingUsers(true);
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (search) {
        query = query.or(`name.ilike.%${search}%,username.ilike.%${search}%`);
      }
      if (filterBanned === "banned") query = query.eq("is_banned", true);
      if (filterBanned === "active") query = query.eq("is_banned", false);

      const { data: profilesData, error } = await query;
      if (error) throw error;

      // Fetch roles for all users
      const userIds = profilesData?.map(p => p.user_id) || [];
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      const rolesMap: Record<string, string> = {};
      rolesData?.forEach(r => { rolesMap[r.user_id] = r.role; });

      // Fetch wallets
      const { data: walletsData } = await supabase
        .from("user_wallets")
        .select("user_id, balance")
        .in("user_id", userIds);

      const walletsMap: Record<string, number> = {};
      walletsData?.forEach(w => { walletsMap[w.user_id] = w.balance; });

      let mapped = (profilesData || []).map(p => ({
        ...p,
        role: rolesMap[p.user_id] || "user",
        wallet_balance: walletsMap[p.user_id] || 0,
      }));

      if (filterRole) {
        mapped = mapped.filter(u => u.role === filterRole);
      }

      setUsers(mapped);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // ─── POSTS ──────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async (search = "", filterHidden = "") => {
    setLoadingPosts(true);
    try {
      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (search) query = query.ilike("content", `%${search}%`);
      if (filterHidden === "hidden") query = query.eq("is_hidden", true);
      if (filterHidden === "visible") query = query.eq("is_hidden", false);
      if (filterHidden === "pinned") query = query.eq("is_pinned", true);

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // ─── USER ACTIONS ────────────────────────────────────────────────────────
  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        await supabase.from("user_roles").update({ role: role as any }).eq("user_id", userId);
      } else {
        await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
      }
      toast({ title: "Role atualizada com sucesso!" });
      fetchUsers();
    } catch (err) {
      toast({ title: "Erro ao atualizar role", variant: "destructive" });
    }
  };

  const toggleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await supabase.from("profiles").update({ is_banned: !isBanned }).eq("user_id", userId);
      toast({ title: !isBanned ? "Usuário banido" : "Usuário desbanido" });
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast({ title: "Erro ao banir/desbanir usuário", variant: "destructive" });
    }
  };

  const toggleVerifyUser = async (userId: string, isVerified: boolean) => {
    try {
      await supabase.from("profiles").update({ is_verified: !isVerified }).eq("user_id", userId);
      toast({ title: !isVerified ? "Usuário verificado!" : "Verificação removida" });
      fetchUsers();
    } catch (err) {
      toast({ title: "Erro ao verificar usuário", variant: "destructive" });
    }
  };

  const grantXP = async (userId: string, amount: number) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp_points, karma")
        .eq("user_id", userId)
        .single();

      if (profile) {
        await supabase.from("profiles").update({
          xp_points: (profile.xp_points || 0) + amount,
          karma: (profile.karma || 0) + Math.floor(amount / 10),
        }).eq("user_id", userId);
        toast({ title: `+${amount} XP concedidos!` });
        fetchUsers();
      }
    } catch (err) {
      toast({ title: "Erro ao conceder XP", variant: "destructive" });
    }
  };

  // ─── POST ACTIONS ────────────────────────────────────────────────────────
  const toggleHidePost = async (postId: string, isHidden: boolean) => {
    try {
      await supabase.from("posts").update({ is_hidden: !isHidden }).eq("id", postId);
      toast({ title: !isHidden ? "Post ocultado" : "Post visível" });
      fetchPosts();
    } catch (err) {
      toast({ title: "Erro ao ocultar post", variant: "destructive" });
    }
  };

  const togglePinPost = async (postId: string, isPinned: boolean) => {
    try {
      await supabase.from("posts").update({ is_pinned: !isPinned }).eq("id", postId);
      toast({ title: !isPinned ? "Post fixado!" : "Post desafixado" });
      fetchPosts();
    } catch (err) {
      toast({ title: "Erro ao fixar post", variant: "destructive" });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await supabase.from("posts").delete().eq("id", postId);
      toast({ title: "Post deletado permanentemente" });
      fetchPosts();
      fetchStats();
    } catch (err) {
      toast({ title: "Erro ao deletar post", variant: "destructive" });
    }
  };

  // ─── COIN ACTIONS ─────────────────────────────────────────────────────────
  const creditCoins = async (userId: string, amount: number, description: string) => {
    try {
      await supabase.rpc("process_coin_transaction", {
        p_user_id: userId,
        p_amount: amount,
        p_type: "admin_credit",
        p_description: description || "Crédito manual pelo administrador",
      });
      toast({ title: `${amount} coins creditados!` });
    } catch (err) {
      toast({ title: "Erro ao creditar coins", variant: "destructive" });
    }
  };

  // ─── NOTIFICATION ACTIONS ─────────────────────────────────────────────────
  const sendMassNotification = async (title: string, message: string, targetRole: string) => {
    try {
      let userIds: string[] = [];

      if (targetRole === "all") {
        const { data } = await supabase.from("profiles").select("user_id");
        userIds = data?.map(p => p.user_id) || [];
      } else {
        const { data } = await supabase.from("user_roles").select("user_id").eq("role", targetRole as any);
        userIds = data?.map(r => r.user_id) || [];
      }

      for (const uid of userIds) {
        await supabase.rpc("create_notification", {
          p_user_id: uid,
          p_title: title,
          p_message: message,
          p_type: "system",
        });
      }

      toast({ title: `Notificação enviada para ${userIds.length} usuários!` });
    } catch (err) {
      toast({ title: "Erro ao enviar notificação", variant: "destructive" });
    }
  };

  return {
    stats, loadingStats, fetchStats,
    users, loadingUsers, fetchUsers,
    posts, loadingPosts, fetchPosts,
    updateUserRole, toggleBanUser, toggleVerifyUser, grantXP,
    toggleHidePost, togglePinPost, deletePost,
    creditCoins, sendMassNotification,
  };
};
