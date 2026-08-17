import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { Loader2, ArrowRight } from "lucide-react";
import PostCard from "@/components/community/PostCard";

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_premium_only: boolean;
  media_url: string | null;
  media_type: string | null;
  user_id: string;
  category_id: string | null;
  score: number;
  upvotes: number;
  downvotes: number;
}

interface Profile {
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  karma: number;
}

type UserVotes = Record<string, "upvote" | "downvote">;

const RecentPosts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCategoryById } = useCategories();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(5);

        if (postsError) throw postsError;
        setPosts(postsData || []);

        // Fetch profiles
        const userIds = [...new Set((postsData || []).map((post) => post.user_id))];
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, name, avatar_url, is_verified, karma")
            .in("user_id", userIds);

          if (profilesData) {
            const profilesMap: Record<string, Profile> = {};
            profilesData.forEach((profile) => {
              profilesMap[profile.user_id] = {
                user_id: profile.user_id,
                name: profile.name,
                avatar_url: profile.avatar_url,
                is_verified: profile.is_verified,
                karma: profile.karma,
              };
            });
            setProfiles(profilesMap);
          }
        }

        // Fetch user votes
        if (user) {
          const { data: reactionsData } = await supabase
            .from("reactions")
            .select("post_id, reaction_type")
            .eq("user_id", user.id);

          if (reactionsData) {
            const votesMap: UserVotes = {};
            reactionsData.forEach((r) => {
              if (r.post_id) {
                // Map reaction types: 'like' = upvote, 'love' = downvote
                if (r.reaction_type === "like") {
                  votesMap[r.post_id] = "upvote";
                } else if (r.reaction_type === "love") {
                  votesMap[r.post_id] = "downvote";
                }
              }
            });
            setUserVotes(votesMap);
          }
        }
      } catch (error) {
        console.error("Error fetching recent posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePostUpdate = async () => {
    // Refetch posts on update
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(5);
    
    if (data) setPosts(data);
  };

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Posts Recentes</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Posts Recentes</h2>
        <button
          onClick={() => navigate("/comunidade")}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-8 glass-card rounded-xl">
          <p className="text-muted-foreground">
            Nenhum post ainda. Seja o primeiro a compartilhar algo!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const postCategory = getCategoryById(post.category_id);
            return (
              <PostCard
                key={post.id}
                post={post}
                author={profiles[post.user_id] || { user_id: post.user_id, name: null, avatar_url: null, is_verified: false, karma: 0 }}
                userVote={userVotes[post.id] || null}
                onUpdate={handlePostUpdate}
                category={postCategory ? {
                  name: postCategory.name,
                  icon: postCategory.icon,
                  color: postCategory.color,
                } : null}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RecentPosts;