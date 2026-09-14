import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { canFollow, profileQueryKeys } from "@/lib/profileSocial";

interface FollowerProfile {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  username: string | null;
}

interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profile?: FollowerProfile;
}

type FollowCounts = {
  followersCount: number;
  followingCount: number;
};

async function fetchFollowCounts(userId: string): Promise<FollowCounts> {
  const { data, error } = await supabase
    .from("profiles")
    .select("followers_count, following_count")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return {
    followersCount: data?.followers_count || 0,
    followingCount: data?.following_count || 0,
  };
}

async function fetchIsFollowing(viewerId: string, targetId: string): Promise<boolean> {
  if (viewerId === targetId) return false;
  const { data, error } = await supabase
    .from("followers")
    .select("id")
    .eq("follower_id", viewerId)
    .eq("following_id", targetId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export const useFollowers = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId;
  const viewerId = user?.id;

  const statusQuery = useQuery({
    queryKey: profileQueryKeys.followStatus(targetUserId || "", viewerId || ""),
    queryFn: () => fetchIsFollowing(viewerId!, targetUserId!),
    enabled: Boolean(viewerId && targetUserId && viewerId !== targetUserId),
  });

  const countsQuery = useQuery({
    queryKey: profileQueryKeys.followCounts(targetUserId || ""),
    queryFn: () => fetchFollowCounts(targetUserId!),
    enabled: Boolean(targetUserId),
  });

  const isFollowing = statusQuery.data === true;
  const followersCount = countsQuery.data?.followersCount ?? 0;
  const followingCount = countsQuery.data?.followingCount ?? 0;

  const invalidateFollowCaches = (targetId: string) => {
    if (viewerId) {
      void queryClient.invalidateQueries({
        queryKey: profileQueryKeys.followStatus(targetId, viewerId),
      });
      void queryClient.invalidateQueries({
        queryKey: profileQueryKeys.followCounts(viewerId),
      });
      void queryClient.invalidateQueries({ queryKey: profileQueryKeys.detail(viewerId) });
    }
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.followCounts(targetId) });
    void queryClient.invalidateQueries({ queryKey: profileQueryKeys.detail(targetId) });
  };

  const followMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const guard = canFollow(viewerId, targetId);
      if (!guard.ok) {
        throw new Error(guard.reason === "self" ? "Cannot follow yourself" : "Not authenticated");
      }

      const { data: existing, error: existingError } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", viewerId!)
        .eq("following_id", targetId)
        .maybeSingle();
      if (existingError) throw existingError;
      if (existing) return;

      const { error } = await supabase.from("followers").insert({
        follower_id: viewerId!,
        following_id: targetId,
      });
      if (error) throw error;
    },
    onMutate: async (targetId) => {
      if (!viewerId) return;
      await queryClient.cancelQueries({
        queryKey: profileQueryKeys.followStatus(targetId, viewerId),
      });
      await queryClient.cancelQueries({ queryKey: profileQueryKeys.followCounts(targetId) });
      const previousStatus = queryClient.getQueryData<boolean>(
        profileQueryKeys.followStatus(targetId, viewerId),
      );
      const previousCounts = queryClient.getQueryData<FollowCounts>(
        profileQueryKeys.followCounts(targetId),
      );
      queryClient.setQueryData(profileQueryKeys.followStatus(targetId, viewerId), true);
      queryClient.setQueryData<FollowCounts>(profileQueryKeys.followCounts(targetId), (old) => ({
        followersCount: (old?.followersCount ?? 0) + 1,
        followingCount: old?.followingCount ?? 0,
      }));
      return { previousStatus, previousCounts, targetId };
    },
    onError: (_error, targetId, context) => {
      if (!viewerId || !context) return;
      queryClient.setQueryData(
        profileQueryKeys.followStatus(targetId, viewerId),
        context.previousStatus,
      );
      queryClient.setQueryData(profileQueryKeys.followCounts(targetId), context.previousCounts);
    },
    onSettled: (_data, _error, targetId) => {
      invalidateFollowCaches(targetId);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (targetId: string) => {
      if (!viewerId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("followers")
        .delete()
        .eq("follower_id", viewerId)
        .eq("following_id", targetId);
      if (error) throw error;
    },
    onMutate: async (targetId) => {
      if (!viewerId) return;
      await queryClient.cancelQueries({
        queryKey: profileQueryKeys.followStatus(targetId, viewerId),
      });
      await queryClient.cancelQueries({ queryKey: profileQueryKeys.followCounts(targetId) });
      const previousStatus = queryClient.getQueryData<boolean>(
        profileQueryKeys.followStatus(targetId, viewerId),
      );
      const previousCounts = queryClient.getQueryData<FollowCounts>(
        profileQueryKeys.followCounts(targetId),
      );
      queryClient.setQueryData(profileQueryKeys.followStatus(targetId, viewerId), false);
      queryClient.setQueryData<FollowCounts>(profileQueryKeys.followCounts(targetId), (old) => ({
        followersCount: Math.max(0, (old?.followersCount ?? 0) - 1),
        followingCount: old?.followingCount ?? 0,
      }));
      return { previousStatus, previousCounts, targetId };
    },
    onError: (_error, targetId, context) => {
      if (!viewerId || !context) return;
      queryClient.setQueryData(
        profileQueryKeys.followStatus(targetId, viewerId),
        context.previousStatus,
      );
      queryClient.setQueryData(profileQueryKeys.followCounts(targetId), context.previousCounts);
    },
    onSettled: (_data, _error, targetId) => {
      invalidateFollowCaches(targetId);
    },
  });

  const follow = async (targetId: string) => {
    const guard = canFollow(viewerId, targetId);
    if (!guard.ok) {
      return { error: guard.reason === "self" ? "Cannot follow yourself" : "Not authenticated" };
    }
    try {
      await followMutation.mutateAsync(targetId);
      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao seguir";
      console.error("Error following user:", error);
      return { error: message };
    }
  };

  const unfollow = async (targetId: string) => {
    if (!viewerId) return { error: "Not authenticated" };
    try {
      await unfollowMutation.mutateAsync(targetId);
      return { error: null };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao deixar de seguir";
      console.error("Error unfollowing user:", error);
      return { error: message };
    }
  };

  const toggleFollow = async (targetId: string) => {
    if (isFollowing) return unfollow(targetId);
    return follow(targetId);
  };

  const fetchFollowers = async (): Promise<Follower[]> => {
    if (!targetUserId) return [];
    const { data, error } = await supabase
      .from("followers")
      .select("*")
      .eq("following_id", targetUserId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const followerIds = data?.map((row) => row.follower_id) || [];
    if (followerIds.length === 0) return [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, name, avatar_url, username")
      .in("user_id", followerIds);
    const profileMap = new Map(profiles?.map((profile) => [profile.user_id, profile]));
    return (data || []).map((row) => ({
      ...row,
      profile: profileMap.get(row.follower_id),
    }));
  };

  const fetchFollowing = async (): Promise<Follower[]> => {
    if (!targetUserId) return [];
    const { data, error } = await supabase
      .from("followers")
      .select("*")
      .eq("follower_id", targetUserId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    const followingIds = data?.map((row) => row.following_id) || [];
    if (followingIds.length === 0) return [];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, name, avatar_url, username")
      .in("user_id", followingIds);
    const profileMap = new Map(profiles?.map((profile) => [profile.user_id, profile]));
    return (data || []).map((row) => ({
      ...row,
      profile: profileMap.get(row.following_id),
    }));
  };

  return {
    isFollowing,
    followers: [] as Follower[],
    following: [] as Follower[],
    followersCount,
    followingCount,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
    follow,
    unfollow,
    toggleFollow,
    fetchFollowers,
    fetchFollowing,
    refetch: () => {
      void statusQuery.refetch();
      void countsQuery.refetch();
    },
  };
};
