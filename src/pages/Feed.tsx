import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PostCard from "@/components/feed/PostCard";
import CreatePostModal from "@/components/community/CreatePostModal";
import { useFeed } from "@/hooks/useFeed";

const Feed = () => {
  const location = useLocation();
  const isPopularRoute = location.pathname === "/popular";

  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">(isPopularRoute ? "top" : "hot");

  const searchParams = new URLSearchParams(location.search);
  const categorySlug = searchParams.get("categoria");

  // Atualizar sortBy se a rota mudar
  useEffect(() => {
    if (location.pathname === "/popular") {
      setSortBy("top");
    } else if (location.pathname === "/comunidade" || location.pathname === "/feed") {
      setSortBy("hot");
    }
  }, [location.pathname]);

  const { posts, isLoading } = useFeed(sortBy, categorySlug);

  return (
    <div className="w-full">
      {/* Lista de Posts */}
      <div className="flex flex-col gap-0">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="text-gray-500">Carregando posts...</span>
          </div>
        ) : posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              nucleus={post.nucleo?.slug || "geral"}
              author={post.author?.name || post.author?.username || "Usuário"}
              authorId={post.user_id}
              authorAvatar={post.author?.avatar_url}
              timeAgo={new Date(post.created_at).toLocaleDateString()}
              title={post.title || "Sem Título"}
              content={post.content}
              votes={post.upvotes_count - post.downvotes_count}
              comments={post.comments_count}
              mediaUrl={post.media_url || undefined}
              mediaType={post.media_type || undefined}
              userVote={post.user_vote}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-gradient-to-br from-[#1A1D24] to-[#0f1218] rounded-2xl border border-white/5 shadow-2xl mt-4 relative overflow-hidden group">
            <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full group-hover:bg-primary/20 transition-all duration-700" />
            <div className="pointer-events-none absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full group-hover:bg-secondary/20 transition-all duration-700" />

            <div className="w-20 h-20 bg-background/80 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/10 mb-6 shadow-xl z-10">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-3 text-center z-10">
              Bem-vindo à Nexus!
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-8 z-10">
              A comunidade ainda está silenciosa. Que tal quebrar o gelo? Crie o primeiro post e
              comece a subir de nível interagindo com a galera!
            </p>

            <div className="relative z-10">
              <CreatePostModal
                triggerNode={
                  <button
                    type="button"
                    className="min-h-11 px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-full shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-105 transition-transform"
                  >
                    Fazer a Primeira Postagem
                  </button>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
