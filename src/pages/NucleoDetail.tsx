import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NucleoHeader from "@/components/nucleos/NucleoHeader";
import NucleoRules from "@/components/nucleos/NucleoRules";
import NucleoMembers from "@/components/nucleos/NucleoMembers";
import PostCard from "@/components/feed/PostCard";
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
  const { getNucleo, getNucleoMembers, getNucleoRules, joinNucleo, leaveNucleo, addRule } =
    useNucleos();

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
        .select(
          `
          *,
          profiles!posts_user_id_fkey(name, username, avatar_url, is_verified),
          categories(name, slug, color, icon)
        `,
        )
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
      .select(
        `
        *,
        profiles!posts_user_id_fkey(name, username, avatar_url, is_verified),
        categories(name, slug, color, icon)
      `,
      )
      .eq("nucleo_id", nucleo.id)
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    setPosts((postsData as unknown as Post[]) || []);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
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
      <main className="pb-24">
        {/* Back button */}
        <div className="max-w-4xl mx-auto px-3 py-2 md:px-4 md:py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/nucleos")}>
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
        <div className="max-w-4xl mx-auto px-0 md:px-4 py-3 md:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-3 md:mb-4 px-3 md:px-0">
                  <TabsList>
                    <TabsTrigger value="posts">Posts</TabsTrigger>
                    <TabsTrigger value="about">Sobre</TabsTrigger>
                  </TabsList>

                  {isMember && (
                    <CreatePostModal onPostCreated={refreshPosts} nucleoId={nucleo.id} />
                  )}
                </div>

                <TabsContent value="posts" className="space-y-0 md:space-y-4">
                  {nucleo.is_private && !isMember ? (
                    <div className="text-center py-16 bg-muted/20 border border-dashed border-gray-700/50 rounded-2xl flex flex-col items-center justify-center max-md:mx-3">
                      <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mb-4 border border-white/5 shadow-xl">
                        <svg
                          className="w-8 h-8 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Conteúdo Privado</h3>
                      <p className="text-muted-foreground max-w-sm">
                        Este núcleo é privado. Você precisa se tornar um membro para ver as
                        postagens.
                      </p>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-lg max-md:mx-3">
                      <p className="text-muted-foreground">Nenhum post neste núcleo ainda.</p>
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
                        postId={post.id}
                        nucleus={nucleo?.name || "geral"}
                        author={post.profiles?.name || post.profiles?.username || "Usuário"}
                        authorId={post.user_id}
                        authorAvatar={post.profiles?.avatar_url}
                        timeAgo={new Date(post.created_at).toLocaleDateString()}
                        title={""}
                        content={post.content || ""}
                        votes={post.upvotes - post.downvotes}
                        comments={post.comments_count || 0}
                        mediaUrl={post.media_url || undefined}
                        mediaType={post.media_type || undefined}
                        userVote={null}
                      />
                    ))
                  )}
                </TabsContent>

                <TabsContent value="about">
                  <div className="space-y-4 px-3 md:px-0">
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
            <div className="space-y-4 px-3 md:px-0">
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
    </div>
  );
};

export default NucleoDetail;
