import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Json } from "@/integrations/supabase/types";
import {
  profileQueryKeys,
  sanitizeProfileCategories,
  sanitizeSocialLinks,
  type ProfileCategoryKey,
  type SocialLinks,
} from "@/lib/profileSocial";

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  banner_url?: string | null;
  bio: string | null;
  xp_points: number;
  level: number;
  is_verified: boolean;
  is_banned: boolean;
  username: string | null;
  karma: number;
  created_at: string;
  updated_at: string;
  followers_count?: number;
  following_count?: number;
  profile_categories: ProfileCategoryKey[];
  social_links: SocialLinks;
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

type ProfileBundle = {
  profile: Profile;
  badges: UserBadge[];
  stats: ProfileStats;
};

function mapProfile(row: {
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
  followers_count?: number;
  following_count?: number;
  profile_categories?: string[] | null;
  social_links?: Json | null;
  banner_url?: string | null;
}): Profile {
  return {
    ...row,
    profile_categories: sanitizeProfileCategories(row.profile_categories),
    social_links: sanitizeSocialLinks(row.social_links),
  };
}

async function fetchProfileBundle(targetUserId: string): Promise<ProfileBundle> {
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", targetUserId)
    .single();

  if (profileError) throw profileError;

  const { data: badgesData, error: badgesError } = await supabase
    .from("user_badges")
    .select(
      `
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
    `,
    )
    .eq("user_id", targetUserId);

  if (badgesError) throw badgesError;

  const formattedBadges: UserBadge[] = (badgesData || []).flatMap((ub) => {
    const badgeRel = ub.badges as Badge | Badge[] | null;
    const badge = Array.isArray(badgeRel) ? badgeRel[0] : badgeRel;
    if (!badge) return [];
    return [
      {
        id: ub.id,
        badge_id: ub.badge_id,
        earned_at: ub.earned_at,
        badge,
      },
    ];
  });

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
      .in(
        "post_id",
        (await supabase.from("posts").select("id").eq("user_id", targetUserId)).data?.map(
          (p) => p.id,
        ) || [],
      ),
  ]);

  return {
    profile: mapProfile(profileData),
    badges: formattedBadges,
    stats: {
      postsCount: postsResult.count || 0,
      commentsCount: commentsResult.count || 0,
      likesReceived: likesResult.data?.length || 0,
    },
  };
}

export type ProfileUpdates = Partial<
  Pick<
    Profile,
    "name" | "avatar_url" | "banner_url" | "bio" | "profile_categories" | "social_links"
  >
>;

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;
  const isOwnProfile = user?.id === targetUserId;

  const query = useQuery({
    queryKey: profileQueryKeys.detail(targetUserId || ""),
    queryFn: () => fetchProfileBundle(targetUserId!),
    enabled: Boolean(targetUserId),
    staleTime: 30_000,
  });

  const profile = query.data?.profile ?? null;
  const badges = query.data?.badges ?? [];
  const stats = query.data?.stats ?? {
    postsCount: 0,
    commentsCount: 0,
    likesReceived: 0,
  };

  const updateProfile = async (updates: ProfileUpdates) => {
    if (!targetUserId || !isOwnProfile) return { error: "Unauthorized" };

    try {
      const payload: {
        name?: string | null;
        avatar_url?: string | null;
        bio?: string | null;
        profile_categories?: string[];
        social_links?: Json;
      } = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.avatar_url !== undefined) payload.avatar_url = updates.avatar_url;
      if (updates.bio !== undefined) payload.bio = updates.bio;
      if (updates.profile_categories !== undefined) {
        payload.profile_categories = sanitizeProfileCategories(updates.profile_categories);
      }
      if (updates.social_links !== undefined) {
        payload.social_links = sanitizeSocialLinks(updates.social_links);
      }

      const { error } = await supabase.from("profiles").update(payload).eq("user_id", targetUserId);
      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.detail(targetUserId) });
      return { error: null };
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      return { error: err instanceof Error ? err.message : "Erro ao atualizar perfil" };
    }
  };

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
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    isOwnProfile,
    updateProfile,
    refetch: query.refetch,
    levelProgress: getLevelProgress(),
  };
};
