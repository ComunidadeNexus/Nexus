import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import PostCard from "@/components/community/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import CategoryBar from "@/components/community/CategoryBar";
import FilterTabs, { FilterType } from "@/components/community/FilterTabs";
import SearchBar from "@/components/community/SearchBar";
import { useCategories } from "@/hooks/useCategories";

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
  name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  user_id: string;
  karma: number;
}

type UserVotes = Record<string, "upvote" | "downvote">;

const Comunidade = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { categories, getCategoryById } = useCategories();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("recent");
  const [searchQuery, setSearchQuery] = useState("");

  // Handle category from URL params
  useEffect(() => {
    const categorySlug = searchParams.get("categoria");
    if (categorySlug && categories.length > 0) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setSelectedCategory(category.id);
      }
    }
  }, [searchParams, categories]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_hidden", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPosts(data || []);

      // Fetch profiles for all unique user_ids
      const userIds = [...new Set((data || []).map((post) => post.user_id))];
      const profilesMap: Record<string, Profile> = {};

      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, name, avatar_url, is_verified, karma")
          .in("user_id", userIds);

        if (profilesData) {
          profilesData.forEach((profile) => {
            profilesMap[profile.user_id] = {
              user_id: profile.user_id,
              name: profile.name,
              avatar_url: profile.avatar_url,
              is_verified: profile.is_verified,
              karma: profile.karma,
            };
          });
        }
      }

      setProfiles(profilesMap);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("reactions")
        .select("post_id, reaction_type")
        .eq("user_id", user.id);

      if (error) throw error;

      const votesMap: UserVotes = {};
      (data || []).forEach((r) => {
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
    } catch (error) {
      console.error("Error fetching user votes:", error);
    }
  };

  const fetchCurrentUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, is_verified, karma")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setCurrentUserProfile(data);
    } catch (error) {
      console.error("Error fetching current user profile:", error);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([fetchPosts(), fetchUserVotes(), fetchCurrentUserProfile()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handlePostUpdate = () => {
    fetchPosts();
    fetchUserVotes();
  };

  // Calculate ranking score for sorting
  const calculateRanking = (score: number, createdAt: string) => {
    const hoursOld = (Date.now() - new Date(createdAt).getTime()) / 3600000;
    return score / Math.pow(hoursOld + 2, 1.5);
  };

  // Filtered and sorted posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by category
    if (selectedCategory) {
      result = result.filter((post) => post.category_id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((post) => 
        post.content.toLowerCase().includes(query)
      );
    }

    // Sort by filter type
    switch (activeFilter) {
      case "popular":
        // Use ranking algorithm (score / time decay)
        result.sort((a, b) => calculateRanking(b.score, b.created_at) - calculateRanking(a.score, a.created_at));
        break;
      case "pinned":
        result = result.filter((post) => post.is_pinned);
        break;
      case "recent":
      default:
        // Already sorted by created_at from the query
        break;
    }

    return result;
  }, [posts, selectedCategory, searchQuery, activeFilter]);

  const selectedCategoryData = getCategoryById(selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <main className="pt-16">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-bold gradient-text truncate">
                {selectedCategoryData ? selectedCategoryData.name : "Comunidade"}
              </h1>
              {selectedCategoryData?.description && (
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {selectedCategoryData.description}
                </p>
              )}
            </div>

            <CreatePostModal
              onPostCreated={handlePostCreated}
              userName={currentUserProfile?.name}
              userAvatar={currentUserProfile?.avatar_url}
              defaultCategoryId={selectedCategory}
            />
          </div>

          {/* Category Bar - Horizontal Scroll */}
          <CategoryBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          {/* Posts Feed */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Nenhum post encontrado com essa busca."
                  : selectedCategory
                  ? "Nenhum post nesta categoria ainda."
                  : "Nenhum post ainda. Seja o primeiro a compartilhar algo!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => {
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
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default Comunidade;