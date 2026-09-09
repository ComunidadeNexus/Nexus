import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import PostCard from "@/components/feed/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ProfileActivityProps {
  userId: string;
}

const ProfileActivity = ({ userId }: ProfileActivityProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select(
            `
            id, user_id, nucleo_id, title, content, media_url, media_type, 
            upvotes_count, downvotes_count, comments_count, created_at,
            nucleo:nucleos(slug, name)
          `,
          )
          .eq("user_id", userId)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(10);

        if (error) throw error;

        const userIds = [...new Set((data || []).map((p) => p.user_id))];
        const profilesMap: Record<string, any> = {};

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, name, username, avatar_url")
            .in("user_id", userIds);

          if (profilesData) {
            profilesData.forEach((p) => {
              profilesMap[p.user_id] = {
                name: p.name,
                username: p.username,
                avatar_url: p.avatar_url,
              };
            });
          }
        }

        // Fetch user votes if logged in (skip empty .in() — it can hang the request)
        const userVotes: Record<string, string> = {};
        const fetchedPosts = data || [];
        if (user && fetchedPosts.length > 0) {
          const { data: reactions } = await supabase
            .from("reactions")
            .select("post_id, reaction_type")
            .eq("user_id", user.id)
            .in(
              "post_id",
              fetchedPosts.map((p) => p.id),
            );

          if (reactions) {
            reactions.forEach((r) => {
              if (r.post_id) {
                userVotes[r.post_id] = r.reaction_type;
              }
            });
          }
        }

        const formattedPosts = fetchedPosts.map((post) => ({
          ...post,
          author: profilesMap[post.user_id] || { name: null, username: null, avatar_url: null },
          nucleo: post.nucleo || { slug: "geral", name: "Geral" },
          user_vote: userVotes[post.id] || null,
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [userId, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="flex items-center justify-center mb-6">
          <img
            src="/logo-nexus.png"
            alt="Nexus Logo"
            className="w-32 h-32 object-contain scale-125"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Você ainda não tem nenhum post
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
          Todos os posts que você fizer nas comunidades serão mostrados no seu perfil. Para
          exibi-los ou ocultá-los, atualize suas configurações.
        </p>
        <button
          type="button"
          onClick={() => navigate("/configuracoes")}
          className="min-h-11 px-5 py-2.5 bg-gray-200 dark:bg-white text-gray-900 font-bold rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-200 transition-colors"
        >
          Atualizar configurações
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          postId={post.id}
          nucleus={post.nucleo.name || post.nucleo.slug}
          author={post.author.name || post.author.username || "Usuário"}
          authorId={post.user_id}
          authorAvatar={post.author.avatar_url}
          timeAgo={formatDistanceToNow(new Date(post.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
          title={post.title || ""}
          content={post.content}
          votes={post.upvotes_count - post.downvotes_count}
          comments={post.comments_count}
          mediaUrl={post.media_url}
          mediaType={post.media_type}
          userVote={post.user_vote}
        />
      ))}
    </div>
  );
};

export default ProfileActivity;
