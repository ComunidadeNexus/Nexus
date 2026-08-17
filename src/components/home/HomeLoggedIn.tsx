import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Menu, MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNavigation from "@/components/BottomNavigation";
import SearchBar from "@/components/community/SearchBar";
import PostCard from "@/components/community/PostCard";
import StoriesBar from "@/components/stories/StoriesBar";
import SuggestionsSidebar from "@/components/home/SuggestionsSidebar";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  upvotes: number;
  downvotes: number;
  score: number;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  is_premium_only: boolean;
  category_id: string | null;
  media_url: string | null;
  media_type: string | null;
}

interface Profile {
  user_id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  karma: number;
}

type UserVotes = Record<string, 'upvote' | 'downvote'>;
type UserLikes = Record<string, boolean>;

const HomeLoggedIn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const [userLikes, setUserLikes] = useState<UserLikes>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('is_hidden', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) throw postsError;
      setPosts(postsData || []);

      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map(post => post.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, name, username, avatar_url, is_verified, karma')
          .in('user_id', userIds);

        if (profilesData) {
          const profilesMap: Record<string, Profile> = {};
          profilesData.forEach(profile => {
            profilesMap[profile.user_id] = profile;
          });
          setProfiles(profilesMap);
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReactions = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('reactions')
        .select('post_id, reaction_type')
        .eq('user_id', user.id)
        .not('post_id', 'is', null);

      if (data) {
        const votes: UserVotes = {};
        const likes: UserLikes = {};
        data.forEach(reaction => {
          if (reaction.post_id) {
            if (reaction.reaction_type === 'like') {
              likes[reaction.post_id] = true;
            }
            votes[reaction.post_id] = reaction.reaction_type === 'like' ? 'upvote' : 'downvote';
          }
        });
        setUserVotes(votes);
        setUserLikes(likes);
      }
    } catch (error) {
      console.error('Error fetching user reactions:', error);
    }
  };

  const fetchCurrentUserProfile = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, name, username, avatar_url, is_verified, karma')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setCurrentUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching current user profile:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUserReactions();
    fetchCurrentUserProfile();
  }, [user]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;
    
    const query = searchQuery.toLowerCase();
    return posts.filter(post => {
      const author = profiles[post.user_id];
      const authorName = author?.name?.toLowerCase() || '';
      const authorUsername = author?.username?.toLowerCase() || '';
      const content = post.content.toLowerCase();
      
      return content.includes(query) || 
             authorName.includes(query) || 
             authorUsername.includes(query);
    });
  }, [posts, profiles, searchQuery]);

  const handlePostUpdate = () => {
    fetchPosts();
    fetchUserReactions();
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-display font-bold text-lg">Nexus</span>
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => navigate("/mensagens")}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/perfil")}
              >
                <img
                  src={currentUserProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Button>
              
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="pt-14">
        <div className="max-w-6xl mx-auto flex">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0 lg:ml-auto lg:mr-8">
            {/* Stories */}
            <StoriesBar />

            {/* Search (mobile only) */}
            <div className="px-4 py-2 md:hidden">
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery} 
                placeholder="Buscar..." 
              />
            </div>

            {/* Feed */}
            <div className="px-4 py-2 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? 'Nenhum post encontrado.' : 'Nenhum post ainda. Seja o primeiro!'}
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const author = profiles[post.user_id] || {
                    user_id: post.user_id,
                    name: 'Usuário',
                    username: null,
                    avatar_url: null,
                    is_verified: false,
                    karma: 0,
                  };

                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      author={author}
                      userVote={userVotes[post.id]}
                      isLiked={userLikes[post.id]}
                      onUpdate={handlePostUpdate}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar (desktop only) */}
          <SuggestionsSidebar />
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default HomeLoggedIn;