import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption: string | null;
  views_count: number;
  expires_at: string;
  created_at: string;
}

interface StoryGroup {
  userId: string;
  userName: string | null;
  userAvatar: string | null;
  stories: Story[];
  hasUnviewed: boolean;
}

export const useStories = () => {
  const { user } = useAuth();
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());

  const fetchStories = async () => {
    try {
      setIsLoading(true);

      // Fetch all active stories
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (storiesError) throw storiesError;

      // Fetch viewed stories for current user
      if (user) {
        const { data: viewsData } = await supabase
          .from("story_views")
          .select("story_id")
          .eq("user_id", user.id);

        const viewedIds = new Set((viewsData || []).map((v) => v.story_id));
        setViewedStories(viewedIds);
      }

      // Get unique user IDs
      const userIds = [...new Set((storiesData || []).map((s) => s.user_id))];

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(
        (profilesData || []).map((p) => [p.user_id, p])
      );

      // Group stories by user
      const groupsMap = new Map<string, StoryGroup>();
      
      (storiesData || []).forEach((story) => {
        const profile = profilesMap.get(story.user_id);
        
        if (!groupsMap.has(story.user_id)) {
          groupsMap.set(story.user_id, {
            userId: story.user_id,
            userName: profile?.name || null,
            userAvatar: profile?.avatar_url || null,
            stories: [],
            hasUnviewed: false,
          });
        }

        const group = groupsMap.get(story.user_id)!;
        group.stories.push(story);
        
        if (user && !viewedStories.has(story.id) && story.user_id !== user.id) {
          group.hasUnviewed = true;
        }
      });

      // Separate own stories and others
      const groups = Array.from(groupsMap.values());
      const myStoriesGroup = groups.find((g) => g.userId === user?.id);
      const othersGroups = groups.filter((g) => g.userId !== user?.id);

      // Sort: unviewed first
      othersGroups.sort((a, b) => {
        if (a.hasUnviewed && !b.hasUnviewed) return -1;
        if (!a.hasUnviewed && b.hasUnviewed) return 1;
        return 0;
      });

      setMyStories(myStoriesGroup?.stories || []);
      setStoryGroups(othersGroups);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createStory = async (mediaUrl: string, mediaType: "image" | "video", caption?: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: mediaUrl,
        media_type: mediaType,
        caption: caption || null,
      });

      if (error) throw error;
      
      await fetchStories();
      return { error: null };
    } catch (err: any) {
      console.error("Error creating story:", err);
      return { error: err.message };
    }
  };

  const viewStory = async (storyId: string) => {
    if (!user) return;

    try {
      // Check if already viewed
      if (viewedStories.has(storyId)) return;

      await supabase.from("story_views").insert({
        story_id: storyId,
        user_id: user.id,
      });

      setViewedStories((prev) => new Set([...prev, storyId]));
    } catch (error) {
      // Ignore duplicate errors
      console.error("Error recording story view:", error);
    }
  };

  const deleteStory = async (storyId: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId)
        .eq("user_id", user.id);

      if (error) throw error;
      
      await fetchStories();
      return { error: null };
    } catch (err: any) {
      console.error("Error deleting story:", err);
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchStories();
  }, [user]);

  return {
    storyGroups,
    myStories,
    isLoading,
    viewedStories,
    createStory,
    viewStory,
    deleteStory,
    refetch: fetchStories,
  };
};
