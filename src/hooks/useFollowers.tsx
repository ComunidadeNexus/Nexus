import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

export const useFollowers = (userId?: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const targetUserId = userId;

  const checkIfFollowing = useCallback(async () => {
    if (!user?.id || !targetUserId || user.id === targetUserId) {
      setIsFollowing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId)
        .maybeSingle();

      if (error) throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  }, [user?.id, targetUserId]);

  const fetchFollowCounts = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("followers_count, following_count")
        .eq("user_id", targetUserId)
        .single();

      if (error) throw error;
      setFollowersCount(data?.followers_count || 0);
      setFollowingCount(data?.following_count || 0);
    } catch (error) {
      console.error("Error fetching follow counts:", error);
    }
  }, [targetUserId]);

  const fetchFollowers = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from("followers")
        .select("*")
        .eq("following_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for followers
      const followerIds = data?.map((f) => f.follower_id) || [];
      if (followerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url, username")
          .in("user_id", followerIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
        const followersWithProfiles = data?.map((f) => ({
          ...f,
          profile: profileMap.get(f.follower_id),
        }));
        setFollowers(followersWithProfiles || []);
      } else {
        setFollowers([]);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  }, [targetUserId]);

  const fetchFollowing = useCallback(async () => {
    if (!targetUserId) return;

    try {
      const { data, error } = await supabase
        .from("followers")
        .select("*")
        .eq("follower_id", targetUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for following
      const followingIds = data?.map((f) => f.following_id) || [];
      if (followingIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url, username")
          .in("user_id", followingIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
        const followingWithProfiles = data?.map((f) => ({
          ...f,
          profile: profileMap.get(f.following_id),
        }));
        setFollowing(followingWithProfiles || []);
      } else {
        setFollowing([]);
      }
    } catch (error) {
      console.error("Error fetching following:", error);
    }
  }, [targetUserId]);

  const follow = async (targetId: string) => {
    if (!user?.id) return { error: "Not authenticated" };
    if (user.id === targetId) return { error: "Cannot follow yourself" };

    setIsLoading(true);
    try {
      // Check if already following to avoid duplicate
      const { data: existing } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", targetId)
        .maybeSingle();

      if (existing) {
        setIsFollowing(true);
        return { error: null };
      }

      const { error } = await supabase.from("followers").insert({
        follower_id: user.id,
        following_id: targetId,
      });

      if (error) throw error;

      setIsFollowing(true);
      setFollowersCount((prev) => prev + 1);
      return { error: null };
    } catch (error: any) {
      console.error("Error following user:", error);
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const unfollow = async (targetId: string) => {
    if (!user?.id) return { error: "Not authenticated" };

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("followers")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetId);

      if (error) throw error;

      setIsFollowing(false);
      setFollowersCount((prev) => Math.max(0, prev - 1));
      return { error: null };
    } catch (error: any) {
      console.error("Error unfollowing user:", error);
      return { error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFollow = async (targetId: string) => {
    if (isFollowing) {
      return unfollow(targetId);
    }
    return follow(targetId);
  };

  useEffect(() => {
    if (targetUserId) {
      checkIfFollowing();
      fetchFollowCounts();
    }
  }, [targetUserId, checkIfFollowing, fetchFollowCounts]);

  return {
    isFollowing,
    followers,
    following,
    followersCount,
    followingCount,
    isLoading,
    follow,
    unfollow,
    toggleFollow,
    fetchFollowers,
    fetchFollowing,
    refetch: () => {
      checkIfFollowing();
      fetchFollowCounts();
    },
  };
};
