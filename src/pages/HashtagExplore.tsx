import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/community/PostCard";
import { Loader2, Hash } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Post {
  id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_premium_only: boolean;
  user_id: string;
}

interface Profile {
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

const HashtagExplore = () => {
  const { tag } = useParams<{ tag: string }>();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!tag) return;

      setIsLoading(true);
      try {
        // Search for posts containing the hashtag
        const { data: postsData, error } = await supabase
          .from("posts")
          .select("*")
          .ilike("content", `%#${tag}%`)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(postsData || []);

        // Fetch profiles
        const userIds = [...new Set(postsData?.map((p) => p.user_id) || [])];
        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, name, username, avatar_url, is_verified")
            .in("user_id", userIds);

          const profileMap = new Map<string, Profile>();
          profilesData?.forEach((p) => profileMap.set(p.user_id, p));
          setProfiles(profileMap);
        }

        // Fetch user likes
        if (user?.id && postsData && postsData.length > 0) {
          const { data: likesData } = await supabase
            .from("reactions")
            .select("post_id")
            .eq("user_id", user.id)
            .eq("reaction_type", "like")
            .in("post_id", postsData.map((p) => p.id));

          const likesMap: Record<string, boolean> = {};
          likesData?.forEach((l) => {
            likesMap[l.post_id] = true;
          });
          setUserLikes(likesMap);
        }
      } catch (error) {
        console.error("Error fetching hashtag posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [tag, user?.id]);

  const handlePostUpdate = () => {
    // Refetch posts
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="container mx-auto px-4 pt-20 pb-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Hash className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">#{tag}</h1>
            <p className="text-sm text-muted-foreground">
              {posts.length} post{posts.length !== 1 ? "s" : ""} encontrado{posts.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Hash className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhum post encontrado</h3>
            <p className="text-muted-foreground">
              Não há posts com a hashtag #{tag} ainda.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const author = profiles.get(post.user_id);
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  author={{
                    user_id: post.user_id,
                    name: author?.name || "Usuário",
                    username: author?.username || undefined,
                    avatar_url: author?.avatar_url || undefined,
                    is_verified: author?.is_verified || false,
                  }}
                  isLiked={userLikes[post.id] || false}
                  onUpdate={handlePostUpdate}
                />
              );
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HashtagExplore;
