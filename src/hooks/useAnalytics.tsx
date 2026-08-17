import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, startOfMonth, subDays, format, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyStats {
  date: string;
  posts: number;
  likes: number;
  comments: number;
}

interface AnalyticsData {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  avgEngagementRate: number;
  postsThisWeek: number;
  postsThisMonth: number;
  likesThisWeek: number;
  commentsThisWeek: number;
  topPosts: Array<{
    id: string;
    content: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
  }>;
  dailyStats: DailyStats[];
  followerGrowth: number;
  profileViews: number;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, period]);

  const fetchAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const daysBack = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const startDate = subDays(now, daysBack);
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const monthStart = startOfMonth(now);

      // Fetch all user posts
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("id, content, likes_count, comments_count, created_at, upvotes, downvotes")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      // Fetch reactions on user's posts
      const postIds = posts?.map(p => p.id) || [];
      const { data: reactions } = await supabase
        .from("reactions")
        .select("created_at, post_id")
        .in("post_id", postIds)
        .gte("created_at", startDate.toISOString());

      // Fetch comments on user's posts
      const { data: comments } = await supabase
        .from("comments")
        .select("created_at, post_id")
        .in("post_id", postIds)
        .gte("created_at", startDate.toISOString());

      // Fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("followers_count, following_count")
        .eq("user_id", user.id)
        .maybeSingle();

      // Calculate totals
      const totalPosts = posts?.length || 0;
      const totalLikes = posts?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0;
      const totalComments = posts?.reduce((sum, p) => sum + (p.comments_count || 0), 0) || 0;
      const totalViews = posts?.reduce((sum, p) => sum + (p.upvotes || 0) + (p.downvotes || 0), 0) || 0;

      // Posts this week/month
      const postsThisWeek = posts?.filter(p => new Date(p.created_at) >= weekStart).length || 0;
      const postsThisMonth = posts?.filter(p => new Date(p.created_at) >= monthStart).length || 0;

      // Reactions this week
      const likesThisWeek = reactions?.filter(r => new Date(r.created_at) >= weekStart).length || 0;
      const commentsThisWeek = comments?.filter(c => new Date(c.created_at) >= weekStart).length || 0;

      // Top posts by engagement
      const topPosts = (posts || [])
        .map(p => ({
          ...p,
          engagement: (p.likes_count || 0) + (p.comments_count || 0)
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5);

      // Daily stats for chart
      const days = eachDayOfInterval({ start: startDate, end: now });
      const dailyStats: DailyStats[] = days.map(day => {
        const dayStr = format(day, "yyyy-MM-dd");
        const dayPosts = posts?.filter(p => 
          format(new Date(p.created_at), "yyyy-MM-dd") === dayStr
        ).length || 0;
        const dayLikes = reactions?.filter(r => 
          format(new Date(r.created_at), "yyyy-MM-dd") === dayStr
        ).length || 0;
        const dayComments = comments?.filter(c => 
          format(new Date(c.created_at), "yyyy-MM-dd") === dayStr
        ).length || 0;

        return {
          date: format(day, "dd/MM", { locale: ptBR }),
          posts: dayPosts,
          likes: dayLikes,
          comments: dayComments,
        };
      });

      // Average engagement rate
      const avgEngagementRate = totalPosts > 0 
        ? ((totalLikes + totalComments) / totalPosts) 
        : 0;

      setAnalytics({
        totalPosts,
        totalLikes,
        totalComments,
        totalViews,
        avgEngagementRate,
        postsThisWeek,
        postsThisMonth,
        likesThisWeek,
        commentsThisWeek,
        topPosts,
        dailyStats,
        followerGrowth: profile?.followers_count || 0,
        profileViews: 0, // Would need separate tracking
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    period,
    setPeriod,
    refetch: fetchAnalytics,
  };
};
