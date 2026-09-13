import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark, Loader2 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const ProfileSaved = ({ userId }: { userId: string }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const savedData = localStorage.getItem("saved_posts");
        const postIds = savedData ? JSON.parse(savedData) : [];

        if (!postIds || postIds.length === 0) {
          setPosts([]);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("posts")
          .select(
            `
            id, user_id, nucleo_id, title, content, media_url, media_type, 
            upvotes, downvotes, comments_count, created_at,
            nucleo:nucleos(slug, name)
          `,
          )
          .in("id", postIds)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false });

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

        const formattedPosts = (data || []).map((post) => ({
          ...post,
          author: profilesMap[post.user_id] || { name: null, username: null, avatar_url: null },
          nucleo: post.nucleo || { slug: "geral", name: "Geral" },
          user_vote: "upvote",
        }));

        setPosts(formattedPosts);
      } catch (err) {
        console.error("Erro ao buscar posts salvos", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedPosts();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-10 bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400 bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>Você ainda não curtiu ou salvou nenhum post.</p>
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
          votes={
            (post.upvotes ?? post.upvotes_count ?? 0) -
            (post.downvotes ?? post.downvotes_count ?? 0)
          }
          comments={post.comments_count}
          mediaUrl={post.media_url}
          mediaType={post.media_type}
          userVote={post.user_vote}
        />
      ))}
    </div>
  );
};
