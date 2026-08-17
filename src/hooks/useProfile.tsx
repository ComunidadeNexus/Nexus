import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  xp_points: number;
  level: number;
  is_verified: boolean;
  is_banned: boolean;
  username: string | null;
  karma: number;
  created_at: string;
  updated_at: string;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  xp_reward: number;
}

interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  badge: Badge;
}

interface ProfileStats {
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
}

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [stats, setStats] = useState<ProfileStats>({
    postsCount: 0,
    commentsCount: 0,
    likesReceived: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;
  const isOwnProfile = user?.id === targetUserId;

  const fetchProfile = async () => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch badges
      const { data: badgesData, error: badgesError } = await supabase
        .from("user_badges")
        .select(`
          id,
          badge_id,
          earned_at,
          badges:badge_id (
            id,
            name,
            description,
            icon,
            color,
            xp_reward
          )
        `)
        .eq("user_id", targetUserId);

      if (badgesError) throw badgesError;
      
      const formattedBadges = (badgesData || []).map((ub: any) => ({
        id: ub.id,
        badge_id: ub.badge_id,
        earned_at: ub.earned_at,
        badge: ub.badges,
      }));
      setBadges(formattedBadges);

      // Fetch stats
      const [postsResult, commentsResult, likesResult] = await Promise.all([
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", targetUserId)
          .eq("is_hidden", false),
        supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("user_id", targetUserId),
        supabase
          .from("reactions")
          .select("post_id")
          .eq("reaction_type", "like")
          .in("post_id", 
            (await supabase.from("posts").select("id").eq("user_id", targetUserId)).data?.map(p => p.id) || []
          ),
      ]);

      setStats({
        postsCount: postsResult.count || 0,
        commentsCount: commentsResult.count || 0,
        likesReceived: likesResult.data?.length || 0,
      });
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<Profile, "name" | "avatar_url" | "bio">>) => {
    if (!targetUserId || !isOwnProfile) return { error: "Unauthorized" };

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", targetUserId);

      if (error) throw error;
      
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (err: any) {
      console.error("Error updating profile:", err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetUserId]);

  // Calculate level progress
  const getLevelProgress = () => {
    if (!profile) return { current: 0, required: 100, percentage: 0 };
    
    const xpPerLevel = 250;
    const currentLevelXP = (profile.level - 1) * xpPerLevel;
    const nextLevelXP = profile.level * xpPerLevel;
    const progressXP = profile.xp_points - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    const percentage = Math.min((progressXP / requiredXP) * 100, 100);

    return {
      current: progressXP,
      required: requiredXP,
      percentage,
    };
  };

  return {
    profile,
    badges,
    stats,
    isLoading,
    error,
    isOwnProfile,
    updateProfile,
    refetch: fetchProfile,
    levelProgress: getLevelProgress(),
  };
};
