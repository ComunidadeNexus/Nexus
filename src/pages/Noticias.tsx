import React, { useEffect, useState } from "react";
import { Loader2, Globe2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/feed/PostCard";
import NewsCard from "@/components/feed/NewsCard";
import NewsReaderModal from "@/components/feed/NewsReaderModal";
import RightSidebar from "@/components/feed/RightSidebar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Noticias = () => {
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<any | null>(null);

  useEffect(() => {
    const fetchHybridFeed = async () => {
      try {
        setIsLoading(true);
        const newFeed = [];

        // 1. Fetch de Posts da Comunidade Oficial 'noticias'
        const { data: communityPosts, error: supabaseError } = await supabase
          .from("posts")
          .select(
            `
            *,
            profiles:user_id (id, name, username, avatar_url, is_verified),
            nucleos!inner (id, name, slug, avatar_url),
            reactions (id, user_id, reaction_type),
            comments (id)
          `,
          )
          .eq("nucleos.slug", "noticias")
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!supabaseError && communityPosts) {
          communityPosts.forEach((post) => {
            newFeed.push({
              type: "community",
              date: new Date(post.created_at).getTime(),
              data: post,
            });
          });
        }

        // 2. Fetch de Notícias Externas (API RSS2JSON - Mock: G1 Tecnologia)
        try {
          const rssResponse = await fetch(
            "https://api.rss2json.com/v1/api.json?rss_url=https://g1.globo.com/rss/g1/tecnologia/",
          );
          const rssData = await rssResponse.json();

          if (rssData.status === "ok") {
            rssData.items.slice(0, 15).forEach((item: any) => {
              // Extract image from description or enclosure
              let imageUrl = item.enclosure?.link;
              if (!imageUrl) {
                const imgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
                if (imgMatch) imageUrl = imgMatch[1];
              }

              // Strip HTML from description for the summary
              const cleanDesc =
                item.description.replace(/<[^>]*>?/gm, "").substring(0, 150) + "...";

              newFeed.push({
                type: "external",
                date: new Date(item.pubDate.replace(" ", "T")).getTime(), // RSS pubDate adapt
                data: {
                  title: item.title,
                  description: cleanDesc,
                  content: item.content || item.description, // HTML Completo
                  url: item.link,
                  imageUrl: imageUrl,
                  source: rssData.feed.title || "G1 Tecnologia",
                  publishedAt: formatDistanceToNow(new Date(item.pubDate.replace(" ", "T")), {
                    addSuffix: true,
                    locale: ptBR,
                  }),
                },
              });
            });
          }
        } catch (rssError) {
          console.error("Erro ao carregar RSS:", rssError);
        }

        // 3. Ordenar tudo por data (mais recente primeiro)
        newFeed.sort((a, b) => b.date - a.date);

        setFeedItems(newFeed);
      } catch (err) {
        console.error("Erro geral no fetch híbrido:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHybridFeed();
  }, []);

  return (
    <div className="w-full flex gap-6 px-4 md:px-0">
      {/* Coluna Esquerda: Feed */}
      <div className="flex-1 w-full min-w-0 max-w-[640px]">
        <div className="flex items-center gap-3 mb-6 p-4 bg-white dark:bg-[#1A282D] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Globe2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mundo & Tecnologia</h1>
            <p className="text-sm text-gray-500">
              As últimas notícias da comunidade oficial e do mundo.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : feedItems.length > 0 ? (
          <div className="space-y-4">
            {feedItems.map((item, index) => {
              if (item.type === "community") {
                const post = item.data;
                const authorName = post.profiles?.username || "Usuário Removido";
                const nucleusName = post.nucleos?.name || "Geral";
                const timeAgo = formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                });
                const commentsCount = post.comments?.[0]?.count || 0;
                const score = (post.reactions || []).reduce((acc: number, cur: any) => {
                  return cur.reaction_type === "upvote"
                    ? acc + 1
                    : cur.reaction_type === "downvote"
                      ? acc - 1
                      : acc;
                }, 0);

                return (
                  <PostCard
                    key={`comm-${post.id}-${index}`}
                    postId={post.id}
                    nucleus={nucleusName}
                    author={authorName}
                    authorId={post.user_id}
                    authorAvatar={post.profiles?.avatar_url}
                    timeAgo={timeAgo}
                    title={post.title}
                    content={post.content}
                    votes={score}
                    comments={commentsCount}
                    mediaUrl={post.media_url}
                    mediaType={post.media_type}
                  />
                );
              } else {
                return (
                  <NewsCard
                    key={`ext-${index}`}
                    {...item.data}
                    onClick={() => setSelectedNews(item.data)}
                  />
                );
              }
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">Nenhuma notícia encontrada.</div>
        )}
      </div>

      {/* Coluna Direita: Sidebar */}
      <div className="hidden lg:block w-[310px] shrink-0">
        <RightSidebar />
      </div>

      <NewsReaderModal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        news={selectedNews}
      />
    </div>
  );
};

export default Noticias;
