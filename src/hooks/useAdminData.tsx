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
  roles?: string[];
  wallet_balance?: number;
  email?: string | null;
  last_sign_in_at?: string | null;
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

export interface AdminReport {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_post_id: string | null;
  reported_comment_id: string | null;
  reason: string;
  status: string;
  created_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_id: string | null;
  details: any;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  updated_at: string;
}

export const useAdminData = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSetting[]>([]);

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
        supabase
          .from("subscriptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase.from("coin_transactions").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", true),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("is_verified", true),
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
      const userIds = profilesData?.map((p) => p.user_id) || [];
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      const rolesMap: Record<string, string> = {};
      const rolesListMap: Record<string, string[]> = {};
      const roleRank: Record<string, number> = { admin: 4, moderator: 3, premium: 2, user: 1 };
      rolesData?.forEach((r) => {
        if (!rolesListMap[r.user_id]) rolesListMap[r.user_id] = [];
        rolesListMap[r.user_id].push(r.role);
        const current = rolesMap[r.user_id];
        if (!current || (roleRank[r.role] || 0) > (roleRank[current] || 0)) {
          rolesMap[r.user_id] = r.role;
        }
      });

      // Fetch wallets
      const { data: walletsData } = await supabase
        .from("user_wallets")
        .select("user_id, balance")
        .in("user_id", userIds);

      const walletsMap: Record<string, number> = {};
      walletsData?.forEach((w) => {
        walletsMap[w.user_id] = w.balance;
      });

      const loginsMap: Record<string, { email: string | null; last_sign_in_at: string | null }> = {};
      if (userIds.length > 0) {
        const { data: loginsData, error: loginsError } = await supabase.rpc(
          "admin_list_member_logins",
          { _user_ids: userIds },
        );
        if (loginsError) {
          console.error("Error fetching member logins:", loginsError);
        } else {
          loginsData?.forEach((row) => {
            loginsMap[row.user_id] = {
              email: row.email,
              last_sign_in_at: row.last_sign_in_at,
            };
          });
        }
      }

      let mapped = (profilesData || []).map((p) => ({
        ...p,
        role: rolesMap[p.user_id] || "user",
        roles: rolesListMap[p.user_id] || ["user"],
        wallet_balance: walletsMap[p.user_id] || 0,
        email: loginsMap[p.user_id]?.email ?? null,
        last_sign_in_at: loginsMap[p.user_id]?.last_sign_in_at ?? null,
      }));

      if (filterRole) {
        mapped = mapped.filter((u) =>
          filterRole === "premium"
            ? (u.roles || []).includes("premium") || u.role === "premium"
            : u.role === filterRole,
        );
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
    if (role === "premium") {
      return grantPremium(userId);
    }

    try {
      const { data: currentRoles, error: currentError } = await supabase
        .from("user_roles")
        .select("id, role")
        .eq("user_id", userId);
      if (currentError) throw currentError;

      const roles = currentRoles || [];
      if (roles.some((r) => r.role === role)) {
        toast({ title: "Este usuário já tem essa role" });
        return;
      }

      // Never overwrite an existing admin/premium row. Insert the new role instead.
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: role as "user" | "premium" | "moderator" | "admin",
      });
      if (error) throw error;

      toast({ title: "Role atualizada com sucesso!" });
      fetchUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar role";
      toast({ title: "Erro ao atualizar role", description: message, variant: "destructive" });
    }
  };

  const grantPremium = async (userId: string) => {
    const { data: existing, error: existingError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "premium")
      .maybeSingle();

    if (existingError) {
      toast({
        title: "Erro ao verificar Premium",
        description: existingError.message,
        variant: "destructive",
      });
      return false;
    }

    if (existing) {
      toast({ title: "Este usuário já tem acesso Premium" });
      return true;
    }

    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "premium" });
    if (error) {
      toast({ title: "Erro ao dar Premium", description: error.message, variant: "destructive" });
      return false;
    }

    await logAdminAction("GRANT_PREMIUM", userId);
    toast({
      title: "Premium liberado",
      description: "O usuário já entra na Área Premium.",
    });
    setUsers((prev) =>
      prev.map((u) => {
        if (u.user_id !== userId) return u;
        const roles = Array.from(new Set([...(u.roles || []), "premium"]));
        const roleRank: Record<string, number> = { admin: 4, moderator: 3, premium: 2, user: 1 };
        const role = roles.reduce(
          (best, r) => ((roleRank[r] || 0) > (roleRank[best] || 0) ? r : best),
          u.role || "user",
        );
        return { ...u, roles, role };
      }),
    );
    fetchUsers();
    fetchStats();
    return true;
  };

  const revokePremium = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "premium");

    if (error) {
      toast({
        title: "Erro ao remover Premium",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    await logAdminAction("REVOKE_PREMIUM", userId);
    toast({ title: "Acesso Premium removido" });
    setUsers((prev) =>
      prev.map((u) => {
        if (u.user_id !== userId) return u;
        const roles = (u.roles || []).filter((r) => r !== "premium");
        const roleRank: Record<string, number> = { admin: 4, moderator: 3, premium: 2, user: 1 };
        const role = roles.reduce(
          (best, r) => ((roleRank[r] || 0) > (roleRank[best] || 0) ? r : best),
          "user",
        );
        return { ...u, roles: roles.length ? roles : ["user"], role };
      }),
    );
    fetchUsers();
    fetchStats();
    return true;
  };

  const sendPasswordReset = async (email: string, userId: string) => {
    if (!email) {
      toast({ title: "Este usuário não tem email de login", variant: "destructive" });
      return false;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    if (error) {
      toast({
        title: "Erro ao enviar redefinição",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    await logAdminAction("PASSWORD_RESET_EMAIL", userId, { email });
    toast({
      title: "Email de redefinição enviado",
      description: "O link chega no Gmail da pessoa. Peça para olhar a caixa de entrada e o Spam.",
    });
    return true;
  };

  const toggleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      await supabase.from("profiles").update({ is_banned: !isBanned }).eq("user_id", userId);
      await logAdminAction(!isBanned ? "BAN_USER" : "UNBAN_USER", userId);
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
        await supabase
          .from("profiles")
          .update({
            xp_points: (profile.xp_points || 0) + amount,
            karma: (profile.karma || 0) + Math.floor(amount / 10),
          })
          .eq("user_id", userId);
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
      await logAdminAction("DELETE_POST", postId);
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
        userIds = data?.map((p) => p.user_id) || [];
      } else {
        const { data } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", targetRole as any);
        userIds = data?.map((r) => r.user_id) || [];
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

  const fetchReports = async () => {
    try {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      setReports(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      await supabase.from("reports").update({ status }).eq("id", reportId);
      toast({ title: "Status da denúncia atualizado" });
      fetchReports();
    } catch (err) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });
      setAuditLogs(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const logAdminAction = async (action: string, targetId?: string, details?: any) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user.id) return;
      await supabase.from("audit_logs").insert({
        admin_id: session.session.user.id,
        action,
        target_id: targetId,
        details,
      });
      fetchAuditLogs();
    } catch (err) {
      console.error("Erro ao gerar log de auditoria", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await supabase.from("system_settings").select("*");
      setSettings(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const { data: existing } = await supabase
        .from("system_settings")
        .select("id")
        .eq("key", key)
        .maybeSingle();
      if (existing) {
        await supabase
          .from("system_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key);
      } else {
        await supabase.from("system_settings").insert({ key, value });
      }
      toast({ title: "Configuração atualizada" });
      fetchSettings();
    } catch (err) {
      toast({ title: "Erro ao atualizar configuração", variant: "destructive" });
    }
  };

  return {
    stats,
    loadingStats,
    fetchStats,
    users,
    loadingUsers,
    fetchUsers,
    posts,
    loadingPosts,
    fetchPosts,
    updateUserRole,
    grantPremium,
    revokePremium,
    toggleBanUser,
    toggleVerifyUser,
    grantXP,
    toggleHidePost,
    togglePinPost,
    deletePost,
    creditCoins,
    sendPasswordReset,
    sendMassNotification,
    reports,
    fetchReports,
    updateReportStatus,
    auditLogs,
    fetchAuditLogs,
    logAdminAction,
    settings,
    fetchSettings,
    updateSetting,
  };
};
