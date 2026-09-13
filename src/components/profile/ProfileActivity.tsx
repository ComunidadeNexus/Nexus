import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import PostCard from "@/components/feed/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  displayPostAuthor,
  displayPostTitle,
  mapFeedPosts,
  mapReactionToVote,
  type FeedPost,
  type FeedPostAuthor,
  type FeedPostNucleo,
} from "@/lib/feedPosts";

interface ProfileActivityProps {
  userId: string;
}

/** Pixel height so the CTA cannot collapse to the old 40px (`h-10` / `py-2.5` + `text-sm`). */
const SETTINGS_CTA_STYLE = {
  height: 44,
  minHeight: 44,
  boxSizing: "border-box" as const,
};

async function loadProfilePosts(userId: string, viewerId: string | null): Promise<FeedPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, user_id, nucleo_id, title, content, media_url, media_type, upvotes, downvotes, comments_count, created_at",
    )
    .eq("user_id", userId)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  const rows = data || [];
  const profilesMap: Record<string, FeedPostAuthor> = {};
  const nucleosMap: Record<string, FeedPostNucleo> = {};
  const votes: Record<string, "upvote" | "downvote"> = {};

  const userIds = [...new Set(rows.map((p) => p.user_id))];
  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("user_id, name, username, avatar_url")
      .in("user_id", userIds);
    profilesData?.forEach((p) => {
      profilesMap[p.user_id] = {
        name: p.name,
        username: p.username,
        avatar_url: p.avatar_url,
      };
    });
  }

  const nucleoIds = [...new Set(rows.map((p) => p.nucleo_id).filter((id): id is string => !!id))];
  if (nucleoIds.length > 0) {
    const { data: nucleosData } = await supabase
      .from("nucleos")
      .select("id, slug, name")
      .in("id", nucleoIds);
    nucleosData?.forEach((n) => {
      nucleosMap[n.id] = { slug: n.slug, name: n.name };
    });
  }

  if (viewerId && rows.length > 0) {
    const { data: reactions } = await supabase
      .from("reactions")
      .select("post_id, reaction_type")
      .eq("user_id", viewerId)
      .in(
        "post_id",
        rows.map((p) => p.id),
      );
    reactions?.forEach((r) => {
      const vote = mapReactionToVote(r.reaction_type);
      if (r.post_id && vote) votes[r.post_id] = vote;
    });
  }

  return mapFeedPosts(rows, { profiles: profilesMap, nucleos: nucleosMap, votes });
}

const ProfileActivity = ({ userId }: ProfileActivityProps) => {
  const { user } = useAuth();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["profile-posts", userId, user?.id ?? null],
    queryFn: () => loadProfilePosts(userId, user?.id ?? null),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4 mt-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1D24] shadow-sm">
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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
          Todos os posts que você fizer nas comunidades serão mostrados no seu perfil. Para
          exibi-los ou ocultá-los, atualize suas configurações.
        </p>
        <Link
          to="/configuracoes"
          style={SETTINGS_CTA_STYLE}
          className="inline-flex appearance-none box-border shrink-0 items-center justify-center !h-11 !min-h-[44px] px-5 py-0 bg-gray-200 dark:bg-white text-gray-900 font-bold rounded-full text-sm leading-none hover:bg-gray-300 dark:hover:bg-gray-200 transition-colors"
        >
          Atualizar configurações
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          postId={post.id}
          nucleus={post.nucleo?.slug || "geral"}
          author={displayPostAuthor(post)}
          authorId={post.user_id}
          authorAvatar={post.author?.avatar_url}
          timeAgo={formatDistanceToNow(new Date(post.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
          title={displayPostTitle(post)}
          content={typeof post.content === "string" ? post.content : ""}
          votes={(post.upvotes_count ?? 0) - (post.downvotes_count ?? 0)}
          comments={post.comments_count ?? 0}
          mediaUrl={post.media_url || undefined}
          mediaType={post.media_type || undefined}
          userVote={post.user_vote}
        />
      ))}
    </div>
  );
};

export default ProfileActivity;
