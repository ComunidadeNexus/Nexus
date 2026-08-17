import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNavigation from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NucleoHeader from "@/components/nucleos/NucleoHeader";
import NucleoRules from "@/components/nucleos/NucleoRules";
import NucleoMembers from "@/components/nucleos/NucleoMembers";
import PostCard from "@/components/community/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import { useNucleos, Nucleo, NucleoMember, NucleoRule } from "@/hooks/useNucleos";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Post {
  id: string;
  content: string;
  media_url?: string;
  media_type?: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  category_id?: string;
  is_pinned: boolean;
  upvotes: number;
  downvotes: number;
  nucleo_id?: string;
  profiles?: {
    name: string;
    username?: string;
    avatar_url?: string;
    is_verified: boolean;
  };
  categories?: {
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
}

const NucleoDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getNucleo,
    getNucleoMembers,
    getNucleoRules,
    joinNucleo,
    leaveNucleo,
    addRule,
  } = useNucleos();

  const [nucleo, setNucleo] = useState<Nucleo | null>(null);
  const [members, setMembers] = useState<NucleoMember[]>([]);
  const [rules, setRules] = useState<NucleoRule[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  const currentMember = members.find((m) => m.user_id === user?.id);
  const isMember = !!currentMember;
  const isOwner = currentMember?.role === "owner";
  const isModerator = currentMember?.role === "moderator" || isOwner;

  useEffect(() => {
    const loadNucleoData = async () => {
      if (!slug) return;

      setIsLoading(true);
      const nucleoData = await getNucleo(slug);

      if (!nucleoData) {
        navigate("/nucleos");
        return;
      }

      setNucleo(nucleoData);

      const [membersData, rulesData] = await Promise.all([
        getNucleoMembers(nucleoData.id),
        getNucleoRules(nucleoData.id),
      ]);

      setMembers(membersData);
      setRules(rulesData);

      // Fetch posts for this nucleo
      const { data: postsData } = await supabase
        .from("posts")
        .select(`
          *,
          profiles!posts_user_id_fkey(name, username, avatar_url, is_verified),
          categories(name, slug, color, icon)
        `)
        .eq("nucleo_id", nucleoData.id)
        .eq("is_hidden", false)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      setPosts((postsData as unknown as Post[]) || []);
      setIsLoading(false);
    };

    loadNucleoData();
  }, [slug]);

  const handleJoin = async () => {
    if (!nucleo) return;
    await joinNucleo(nucleo.id);
    const membersData = await getNucleoMembers(nucleo.id);
    setMembers(membersData);
  };

  const handleLeave = async () => {
    if (!nucleo) return;
    await leaveNucleo(nucleo.id);
    const membersData = await getNucleoMembers(nucleo.id);
    setMembers(membersData);
  };

  const handleAddRule = async (title: string, description: string) => {
    if (!nucleo) return false;
    return await addRule(nucleo.id, title, description);
  };

  const refreshRules = async () => {
    if (!nucleo) return;
    const rulesData = await getNucleoRules(nucleo.id);
    setRules(rulesData);
  };

  const refreshPosts = async () => {
    if (!nucleo) return;
    const { data: postsData } = await supabase
      .from("posts")
      .select(`
        *,
        profiles!posts_user_id_fkey(name, username, avatar_url, is_verified),
        categories(name, slug, color, icon)
      `)
      .eq("nucleo_id", nucleo.id)
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    setPosts((postsData as unknown as Post[]) || []);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!nucleo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pb-24">
        {/* Back button */}
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/nucleos")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <NucleoHeader
          nucleo={nucleo}
          isMember={isMember}
          isOwner={isOwner}
          isModerator={isModerator}
          onJoin={handleJoin}
          onLeave={handleLeave}
        />

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="about">Sobre</TabsTrigger>
                  </TabsList>

                  {isMember && (
                    <CreatePostModal
                      onPostCreated={refreshPosts}
                      nucleoId={nucleo.id}
                    />
                  )}
                </div>

                <TabsContent value="posts" className="space-y-4">
                  {posts.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">
                        Nenhum post neste núcleo ainda.
                      </p>
                      {isMember && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Seja o primeiro a postar!
                        </p>
                      )}
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={{
                          id: post.id,
                          content: post.content,
                          created_at: post.created_at,
                          likes_count: post.likes_count,
                          comments_count: post.comments_count,
                          is_pinned: post.is_pinned,
                          is_premium_only: false,
                          media_url: post.media_url,
                          media_type: post.media_type,
                          user_id: post.user_id,
                          category_id: post.category_id,
                          upvotes: post.upvotes,
                          downvotes: post.downvotes,
                        }}
                        author={{
                          name: post.profiles?.name || "Usuário",
                          avatar_url: post.profiles?.avatar_url || null,
                          is_verified: post.profiles?.is_verified || false,
                          user_id: post.user_id,
                        }}
                        category={post.categories ? {
                          name: post.categories.name,
                          icon: post.categories.icon,
                          color: post.categories.color,
                        } : null}
                        onUpdate={refreshPosts}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="about">
                  <div className="space-y-4">
                    <NucleoRules
                      rules={rules}
                      canManage={isModerator}
                      onAddRule={handleAddRule}
                      onRefresh={refreshRules}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <NucleoMembers members={members} />
              <NucleoRules
                rules={rules}
                canManage={false}
                onAddRule={handleAddRule}
                onRefresh={refreshRules}
              />
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default NucleoDetail;
